// server/routes/social.js — Social Cine-Hub: Real-time Friends, Chat, Watchlists & Redis Pub/Sub
import { Router } from 'express'
import { DB, calculateTasteCompatibility } from '../db/index.js'
import {
  createRedisSub,
  publishEvent,
  setUserPresence,
  getUserPresence,
  getMultiplePresence
} from '../redis.js'

const router = Router()

// ── Real-Time Streaming Endpoint (Server-Sent Events backed by Upstash Redis) ─
router.get('/realtime/stream', async (req, res) => {
  const userId = req.query.userId || req.query.me
  if (!userId) {
    return res.status(400).json({ error: 'userId is required for realtime streaming.' })
  }

  // Set SSE Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  })
  res.flushHeaders?.()

  // Notify connection established
  res.write(`data: ${JSON.stringify({ type: 'connected', userId, timestamp: Date.now() })}\n\n`)

  // Register presence and mark any queued messages as delivered
  await setUserPresence(userId, 'online')
  DB.markMessagesAsDelivered(userId).catch(() => {})

  // Setup Redis subscriber for this user session
  const sub = createRedisSub()
  if (sub) {
    const userChannel = `chat:user:${userId}`
    const typingChannel = `chat:typing:${userId}`
    const presenceChannel = 'chat:presence'

    await sub.subscribe(userChannel, typingChannel, presenceChannel).catch(err => {
      console.warn('[SSE] Redis subscribe error:', err.message)
    })

    sub.on('message', (channel, msgStr) => {
      try {
        const payload = JSON.parse(msgStr)
        res.write(`data: ${JSON.stringify({ channel, ...payload })}\n\n`)
      } catch {
        res.write(`data: ${JSON.stringify({ channel, raw: msgStr })}\n\n`)
      }
    })
  }

  // Keep-alive heartbeat every 20 seconds
  const heartbeat = setInterval(() => {
    res.write(': keep-alive\n\n')
  }, 20000)

  // Cleanup on client close
  req.on('close', async () => {
    clearInterval(heartbeat)
    await setUserPresence(userId, 'offline').catch(() => {})
    if (sub) {
      try {
        await sub.quit()
      } catch {
        sub.disconnect()
      }
    }
  })
})

// ── Presence Heartbeat & Query ───────────────────────────────────────────────
router.post('/presence/heartbeat', async (req, res) => {
  try {
    const { userId, status = 'online' } = req.body || {}
    if (!userId) return res.status(400).json({ error: 'userId required' })
    await setUserPresence(userId, status)
    return res.json({ success: true, status })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

router.get('/presence', async (req, res) => {
  try {
    const ids = (req.query.ids || '').split(',').filter(Boolean)
    const map = await getMultiplePresence(ids)
    return res.json({ presence: map })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ── Typing Indicator ────────────────────────────────────────────────────────
router.post('/typing', async (req, res) => {
  try {
    const { fromUserId, toUserId, isTyping } = req.body || {}
    if (!fromUserId || !toUserId) return res.status(400).json({ error: 'fromUserId and toUserId required' })
    await publishEvent(`chat:typing:${toUserId}`, {
      type: 'typing',
      fromUserId,
      isTyping: !!isTyping,
      timestamp: Date.now()
    })
    return res.json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ── Search Users by Username or Display Name ─────────────────────────────────
router.get('/users/search', async (req, res) => {
  try {
    const { q, me } = req.query || {}
    if (!q || typeof q !== 'string' || !q.trim()) {
      return res.json({ users: [] })
    }
    const results = await DB.searchUsers(q, me)
    return res.json({ users: results })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ── Get Friends List with Taste Compatibility Score ──────────────────────────
router.get('/friends', async (req, res) => {
  try {
    const me = req.query.me || req.query.userId
    if (!me) return res.status(400).json({ error: 'User ID is required.' })

    const currentUser = await DB.findUserById(me)
    const rawFriends = await DB.getUserFriends(me)

    const friendsWithScores = rawFriends.map(f => {
      const compatibility = currentUser ? calculateTasteCompatibility(currentUser, f) : 75
      return {
        ...f,
        tasteCompatibility: compatibility
      }
    })

    return res.json({ friends: friendsWithScores })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ── Friend Requests ─────────────────────────────────────────────────────────
router.post('/friend-request/send', async (req, res) => {
  try {
    const { fromUserId, toUserId } = req.body || {}
    if (!fromUserId || !toUserId) {
      return res.status(400).json({ error: 'fromUserId and toUserId are required.' })
    }
    const request = await DB.sendFriendRequest(fromUserId, toUserId)

    // Publish live event via Redis
    const sender = await DB.findUserById(fromUserId)
    await publishEvent(`chat:user:${toUserId}`, {
      type: 'friend_request_received',
      request: {
        ...request,
        user: sender
      }
    })

    return res.json({ success: true, message: 'Friend request sent!', request })
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
})

router.get('/friend-requests', async (req, res) => {
  try {
    const me = req.query.me || req.query.userId
    if (!me) return res.status(400).json({ error: 'User ID is required.' })
    const requests = await DB.getFriendRequests(me)
    return res.json(requests)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

router.post('/friend-request/respond', async (req, res) => {
  try {
    const { requestId, action, userId } = req.body || {}
    if (!requestId || !['accept', 'decline'].includes(action)) {
      return res.status(400).json({ error: 'requestId and valid action (accept/decline) required.' })
    }
    const result = await DB.respondFriendRequest(requestId, action, userId)

    // Notify the other user via Redis
    const otherUserId = result.fromUserId === String(userId) ? result.toUserId : result.fromUserId
    await publishEvent(`chat:user:${otherUserId}`, {
      type: 'friend_request_responded',
      requestId,
      action,
      byUserId: userId
    })

    return res.json({ success: true, message: `Friend request ${action}ed!`, result })
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
})

// ── Cancel Friend Request ───────────────────────────────────────────────────
router.post('/friend-request/cancel', async (req, res) => {
  try {
    const { requestId, userId } = req.body || {}
    if (!requestId || !userId) {
      return res.status(400).json({ error: 'requestId and userId required.' })
    }
    const success = await DB.cancelFriendRequest(requestId, userId)
    if (!success) {
      return res.status(404).json({ error: 'Friend request not found or not created by you.' })
    }
    return res.json({ success: true, message: 'Friend request cancelled.' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ── Remove Friend (Unfriend) ────────────────────────────────────────────────
router.post('/friend/remove', async (req, res) => {
  try {
    const { userId, friendId } = req.body || {}
    if (!userId || !friendId) {
      return res.status(400).json({ error: 'userId and friendId are required.' })
    }
    const success = await DB.removeFriend(userId, friendId)
    if (!success) {
      return res.status(404).json({ error: 'Friendship record not found.' })
    }

    // Publish live notification event
    await publishEvent(`chat:user:${friendId}`, {
      type: 'unfriended',
      byUserId: userId
    }).catch(() => {})

    return res.json({ success: true, message: 'Unfriended successfully.' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ── Get Community Cinephiles for Initial Networking ──────────────────────────
router.get('/community-users', async (req, res) => {
  try {
    const me = req.query.me || req.query.userId
    const { getMongoDb } = await import('../auth.js')
    const db = await getMongoDb()
    const users = await db.collection('user').find().limit(25).toArray()
    const formatted = users
      .map(u => ({
        id: u.id || (u._id ? u._id.toString() : null),
        _id: u.id || (u._id ? u._id.toString() : null),
        displayName: u.displayName || u.name || u.username,
        name: u.displayName || u.name || u.username,
        username: u.username || 'cinephile',
        avatar: u.avatar || '🎬',
        bio: u.bio || '',
        favoriteGenres: u.favoriteGenres ? (Array.isArray(u.favoriteGenres) ? u.favoriteGenres : JSON.parse(u.favoriteGenres || '[]')) : [878, 53]
      }))
      .filter(u => u.id && u.id !== String(me))
    return res.json({ users: formatted })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ── Get Public User Profile (Safe view for friends & other cinephiles) ───────
router.get('/profile/:targetId', async (req, res) => {
  try {
    const { targetId } = req.params
    const viewerId = req.query.viewerId || req.query.me
    if (!targetId) return res.status(400).json({ error: 'targetId is required.' })

    const targetUser = await DB.findUserById(targetId)
    if (!targetUser) return res.status(404).json({ error: 'User not found.' })

    // Load friend count, watchlist, and preferences
    const [friends, targetWatchlist, preferences] = await Promise.all([
      DB.getUserFriends(targetId),
      DB.getWatchlist(targetId),
      DB.getUserPreferences(targetId)
    ])

    const isSelf = viewerId && String(viewerId) === String(targetUser.id)

    // Calculate taste compatibility if viewer is provided and not self
    let compatibility = 75
    let friendshipStatus = 'none'
    let pendingRequestId = null

    if (viewerId && !isSelf) {
      const viewerUser = await DB.findUserById(viewerId)
      if (viewerUser) {
        compatibility = calculateTasteCompatibility(viewerUser, targetUser)
      }

      // Check friendship status
      const isFriend = friends.some(f => String(f.id) === String(viewerId) || String(f._id) === String(viewerId))
      if (isFriend) {
        friendshipStatus = 'friends'
      } else {
        const { incoming, outgoing } = await DB.getFriendRequests(viewerId)
        const incomingReq = incoming.find(r =>
          String(r.fromUserId) === String(targetId) ||
          String(r.fromUserId) === String(targetUser.id) ||
          String(r.user?.id) === String(targetId) ||
          String(r.user?.id) === String(targetUser.id)
        )
        const outgoingReq = outgoing.find(r =>
          String(r.toUserId) === String(targetId) ||
          String(r.toUserId) === String(targetUser.id) ||
          String(r.user?.id) === String(targetId) ||
          String(r.user?.id) === String(targetUser.id)
        )
        if (incomingReq) {
          friendshipStatus = 'pending_incoming'
          pendingRequestId = incomingReq.id || (incomingReq._id ? String(incomingReq._id) : null)
        } else if (outgoingReq) {
          friendshipStatus = 'pending_outgoing'
          pendingRequestId = outgoingReq.id || (outgoingReq._id ? String(outgoingReq._id) : null)
        }
      }
    }

    // Sanitize profile — NEVER leak email, passwords or sensitive internal details to other users
    const publicProfile = {
      id: targetUser.id,
      _id: targetUser.id,
      displayName: targetUser.displayName || targetUser.name,
      name: targetUser.displayName || targetUser.name,
      username: targetUser.username,
      avatar: targetUser.avatar || '🎬',
      bio: targetUser.bio || '',
      favoriteGenres: targetUser.favoriteGenres || [878, 53],
      createdAt: targetUser.createdAt,
      // Personal email only included if viewing own profile
      ...(isSelf ? { email: targetUser.email } : {}),
      friendsCount: friends.length,
      watchlistCount: targetWatchlist.length,
      watchlist: targetWatchlist,
      preferences,
      tasteCompatibility: compatibility,
      friendshipStatus,
      pendingRequestId,
      isSelf
    }

    return res.json({ profile: publicProfile })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ── Get Recent Chat Partners ────────────────────────────────────────────────
router.get('/chat-partners', async (req, res) => {
  try {
    const me = req.query.me || req.query.userId
    if (!me) return res.status(400).json({ error: 'userId required.' })
    const partners = await DB.getRecentChatUsers(me)
    return res.json({ partners })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ── Send 1-on-1 Message with Movie Recommendation Card & Redis Broadcast ────
router.post('/messages/send', async (req, res) => {
  try {
    const { fromUserId, toUserId, text = '', movieRecommendation = null } = req.body || {}
    if (!fromUserId || !toUserId) {
      return res.status(400).json({ error: 'fromUserId and toUserId are required.' })
    }
    if (!text.trim() && !movieRecommendation) {
      return res.status(400).json({ error: 'Either message text or movie recommendation is required.' })
    }

    // Strict Friendship Check: Chat is disabled unless friend request has been accepted
    const isFriend = await DB.areFriends(fromUserId, toUserId)
    if (!isFriend) {
      return res.status(403).json({
        error: 'Chat is disabled. You must accept or send a friend request and become mutual Cine-Friends before messaging.'
      })
    }

    // Check if recipient is online in Redis right now
    const recipientStatus = await getUserPresence(toUserId)
    const isOnline = recipientStatus === 'online'

    // 1. Save permanently in MongoDB (delivered is true if recipient is online)
    const msg = await DB.sendMessage({
      fromUserId,
      toUserId,
      text,
      movieRecommendation,
      isDelivered: isOnline
    })

    // 2. Publish to recipient Redis channel for instantaneous cross-instance real-time delivery
    await publishEvent(`chat:user:${toUserId}`, {
      type: 'new_message',
      message: msg
    })

    return res.json({ success: true, message: msg })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ── Get Conversation Messages & Friendship Status ────────────────────────────
router.get('/messages/conversation', async (req, res) => {
  try {
    const { userA, userB } = req.query || {}
    if (!userA || !userB) {
      return res.status(400).json({ error: 'Both userA and userB query parameters required.' })
    }

    const [messages, areFriends, requests] = await Promise.all([
      DB.getConversation(userA, userB),
      DB.areFriends(userA, userB),
      DB.getFriendRequests(userA)
    ])

    let friendshipStatus = areFriends ? 'friends' : 'none'
    let pendingRequestId = null
    if (!areFriends && requests) {
      const incomingReq = requests.incoming?.find(r =>
        String(r.fromUserId) === String(userB) ||
        String(r.user?.id) === String(userB)
      )
      const outgoingReq = requests.outgoing?.find(r =>
        String(r.toUserId) === String(userB) ||
        String(r.user?.id) === String(userB)
      )
      if (incomingReq) {
        friendshipStatus = 'pending_incoming'
        pendingRequestId = incomingReq.id || (incomingReq._id ? String(incomingReq._id) : null)
      } else if (outgoingReq) {
        friendshipStatus = 'pending_outgoing'
        pendingRequestId = outgoingReq.id || (outgoingReq._id ? String(outgoingReq._id) : null)
      }
    }

    return res.json({ messages, areFriends, friendshipStatus, pendingRequestId })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ── Mark Messages as Delivered (Double Grey Tick) ───────────────────────────
router.post('/messages/delivered', async (req, res) => {
  try {
    const { toUserId, fromUserId, messageId } = req.body || {}
    if (!toUserId) return res.status(400).json({ error: 'toUserId is required.' })

    const count = await DB.markMessagesAsDelivered(toUserId, messageId ? [messageId] : null)

    if (fromUserId) {
      await publishEvent(`chat:user:${fromUserId}`, {
        type: 'messages_delivered',
        byUserId: toUserId,
        messageId: messageId || null,
        timestamp: Date.now()
      })
    }

    return res.json({ success: true, deliveredCount: count })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ── Mark Messages as Read (Double Blue Tick) ─────────────────────────────────
router.post('/messages/read', async (req, res) => {
  try {
    const { toUserId, fromUserId } = req.body || {}
    if (!toUserId || !fromUserId) {
      return res.status(400).json({ error: 'toUserId and fromUserId required.' })
    }
    const count = await DB.markMessagesAsRead(toUserId, fromUserId)

    // Broadcast read receipt via Redis so sender's double tick turns BLUE immediately!
    await publishEvent(`chat:user:${fromUserId}`, {
      type: 'messages_read',
      byUserId: toUserId,
      fromUserId,
      timestamp: Date.now()
    })

    return res.json({ success: true, markedCount: count })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ── Get Unread Count ─────────────────────────────────────────────────────────
router.get('/unread', async (req, res) => {
  try {
    const me = req.query.me || req.query.userId
    if (!me) return res.status(400).json({ error: 'User ID is required.' })

    const [unreadMessages, requests] = await Promise.all([
      DB.getUnreadCount(me),
      DB.getFriendRequests(me)
    ])
    const pendingCount = (requests.incoming || []).length
    return res.json({
      unreadMessages,
      pendingRequests: pendingCount,
      totalAlerts: unreadMessages + pendingCount
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ── Watchlist Management (Permanent MongoDB Storage per User) ────────────────
router.get('/watchlist', async (req, res) => {
  try {
    const userId = req.query.userId || req.query.me
    if (!userId) return res.status(400).json({ error: 'userId is required.' })
    const list = await DB.getWatchlist(userId)
    return res.json({ watchlist: list })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

router.post('/watchlist/add', async (req, res) => {
  try {
    const { userId, movie } = req.body || {}
    if (!userId || !movie) return res.status(400).json({ error: 'userId and movie object are required.' })
    const updated = await DB.addToWatchlist(userId, movie)
    return res.json({ success: true, watchlist: updated })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

router.post('/watchlist/remove', async (req, res) => {
  try {
    const { userId, movieId } = req.body || {}
    if (!userId || !movieId) return res.status(400).json({ error: 'userId and movieId are required.' })
    const updated = await DB.removeFromWatchlist(userId, movieId)
    return res.json({ success: true, watchlist: updated })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ── Taste Preferences (Equalizer) ────────────────────────────────────────────
router.get('/preferences', async (req, res) => {
  try {
    const userId = req.query.userId || req.query.me
    if (!userId) return res.status(400).json({ error: 'userId is required.' })
    const prefs = await DB.getUserPreferences(userId)
    return res.json({ preferences: prefs })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

router.post('/preferences', async (req, res) => {
  try {
    const { userId, preferences } = req.body || {}
    if (!userId || !preferences) return res.status(400).json({ error: 'userId and preferences required.' })
    const updated = await DB.updateUserPreferences(userId, preferences)
    return res.json({ success: true, preferences: updated })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ── Taste Comparison ─────────────────────────────────────────────────────────
router.get('/taste-compare', async (req, res) => {
  try {
    const { userA, userB } = req.query || {}
    if (!userA || !userB) {
      return res.status(400).json({ error: 'Both userA and userB required.' })
    }
    const [uA, uB] = await Promise.all([
      DB.findUserById(userA),
      DB.findUserById(userB)
    ])
    if (!uA || !uB) return res.status(404).json({ error: 'User not found.' })

    const score = calculateTasteCompatibility(uA, uB)
    const [wlA, wlB] = await Promise.all([
      DB.getWatchlist(userA),
      DB.getWatchlist(userB)
    ])
    const idsA = new Set(wlA.map(m => m.id))
    const mutualMovies = wlB.filter(m => idsA.has(m.id))

    return res.json({
      score,
      mutualCount: mutualMovies.length,
      mutualMovies,
      userA: { id: uA.id, name: uA.displayName, username: uA.username },
      userB: { id: uB.id, name: uB.displayName, username: uB.username }
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

export default router
