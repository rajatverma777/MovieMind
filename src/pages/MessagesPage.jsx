// src/pages/MessagesPage.jsx — Dedicated Real-Time Cine-Chat & Direct Messaging Hub
import { useState, useEffect, useRef, useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import { GN, imgUrl } from '@/data/constants'
import MovieShareModal from '@/components/MovieShareModal'
import Spinner from '@/components/Spinner'

// Deduplication helper to prevent double message rendering across SSE and HTTP responses
const isSameMessage = (a, b) => {
  if (!a || !b) return false
  const aId = a.id || (a._id ? String(a._id) : null)
  const bId = b.id || (b._id ? String(b._id) : null)
  if (aId && bId && aId === bId) return true

  // Proximity deduplication for identical text and participants
  if (
    a.fromUserId === b.fromUserId &&
    a.toUserId === b.toUserId &&
    a.text === b.text
  ) {
    const timeA = new Date(a.createdAt || Date.now()).getTime()
    const timeB = new Date(b.createdAt || Date.now()).getTime()
    if (Math.abs(timeA - timeB) < 5000) return true
  }
  return false
}

// WhatsApp-style message delivery & read status ticks
// 1 grey tick = sent to server
// 2 grey ticks = delivered to recipient
// 2 blue ticks = read by recipient
function WhatsAppTick({ status = 'sent' }) {
  if (status === 'read') {
    return (
      <span
        title="Read"
        aria-label="Read"
        style={{ display: 'inline-flex', alignItems: 'center', color: '#53bdeb', marginLeft: 3 }}
      >
        <svg width="15" height="10" viewBox="0 0 18 11" fill="none" style={{ display: 'inline-block' }}>
          <path d="M1 6L4.5 9.5L12 1.5" stroke="#53bdeb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5.5 6L9 9.5L16.5 1.5" stroke="#53bdeb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  }

  if (status === 'delivered') {
    return (
      <span
        title="Delivered"
        aria-label="Delivered"
        style={{ display: 'inline-flex', alignItems: 'center', color: 'rgba(255,255,255,0.6)', marginLeft: 3 }}
      >
        <svg width="15" height="10" viewBox="0 0 18 11" fill="none" style={{ display: 'inline-block' }}>
          <path d="M1 6L4.5 9.5L12 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5.5 6L9 9.5L16.5 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  }

  // Sent (single grey tick)
  return (
    <span
      title="Sent"
      aria-label="Sent"
      style={{ display: 'inline-flex', alignItems: 'center', color: 'rgba(255,255,255,0.45)', marginLeft: 3 }}
    >
      <svg width="11" height="10" viewBox="0 0 13 11" fill="none" style={{ display: 'inline-block' }}>
        <path d="M1 6L4.5 9.5L12 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

export default function MessagesPage() {
  const { user, watchlist, toggleWatchlist, navigate, activeChatFriend, setActiveChatFriend, realtime } = useApp()

  const myId = user?.id || user?._id

  // Responsive mobile view check (< 768px)
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Friends & Conversation Partners
  const [friends, setFriends] = useState([])
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [searchFilter, setSearchFilter] = useState('')
  const [loading, setLoading] = useState(true)

  // Friendship verification state for active conversation
  const [friendshipInfo, setFriendshipInfo] = useState({
    areFriends: true,
    status: 'friends',
    loading: false
  })
  const [requestLoading, setRequestLoading] = useState(false)

  // Messages & Input state
  const [messages, setMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const messagesEndRef = useRef(null)

  // ── 1. Fetch Cine-Friends ──────────────────────────────────────────────────
  useEffect(() => {
    if (!myId) return
    const loadFriends = async () => {
      setLoading(true)
      try {
        const fRes = await fetch(`/api/social/friends?me=${encodeURIComponent(myId)}`).then(r => r.json()).catch(() => ({ friends: [] }))
        const friendList = fRes.friends || []
        setFriends(friendList)

        // Seed initial selected conversation partner: only from accepted friends or pre-selected friend
        setSelectedFriend(prev => {
          if (activeChatFriend) {
            const match = friendList.find(f => (f.id || f._id) === (activeChatFriend.id || activeChatFriend._id))
            return match || activeChatFriend
          }
          if (prev) {
            const match = friendList.find(f => (f.id || f._id) === (prev.id || prev._id))
            return match || prev
          }
          // On mobile viewports, keep contacts list visible initially unless friend pre-selected
          if (window.innerWidth < 768) return null
          if (friendList.length > 0) return friendList[0]
          return null
        })

        // Refresh presence for these users
        const allIds = friendList.map(f => f.id || f._id).filter(Boolean)
        if (allIds.length > 0 && realtime?.refreshPresence) {
          realtime.refreshPresence(allIds)
        }
      } catch (err) {
        console.warn('Error loading chat contacts:', err)
      } finally {
        setLoading(false)
      }
    }
    loadFriends()
  }, [myId, activeChatFriend])

  // Handle activeChatFriend changes
  useEffect(() => {
    if (activeChatFriend) {
      setSelectedFriend(activeChatFriend)
    }
  }, [activeChatFriend])

  // ── 2. Real-Time Incoming Message Listener (Upstash Redis SSE) ─────────────
  useEffect(() => {
    if (!realtime?.incomingMessage || !selectedFriend || !myId) return
    const msg = realtime.incomingMessage
    const selectedId = selectedFriend.id || selectedFriend._id
    const isConv = (msg.fromUserId === selectedId && msg.toUserId === myId) ||
                   (msg.fromUserId === myId && msg.toUserId === selectedId)
    if (isConv) {
      setMessages(prev => {
        if (prev.some(m => isSameMessage(m, msg))) return prev
        return [...prev, msg]
      })

      // If incoming from active chat friend, immediately mark as read
      if (msg.fromUserId === selectedId && msg.toUserId === myId) {
        fetch('/api/social/messages/read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ toUserId: myId, fromUserId: selectedId })
        }).catch(() => {})
      }
    }
  }, [realtime?.incomingMessage, selectedFriend, myId])

  // ── 2b. Real-Time Read Receipts (turns Double Ticks Blue) ───────────────────
  useEffect(() => {
    if (!realtime?.readReceipt || !selectedFriend || !myId) return
    const { byUserId } = realtime.readReceipt
    const selectedId = selectedFriend.id || selectedFriend._id
    if (byUserId === selectedId) {
      setMessages(prev =>
        prev.map(m => {
          if (m.fromUserId === myId && !m.read) {
            return { ...m, read: true, delivered: true, readAt: new Date() }
          }
          return m
        })
      )
    }
  }, [realtime?.readReceipt, selectedFriend, myId])

  // ── 2c. Real-Time Delivery Receipts (turns single tick to Double Grey) ──────
  useEffect(() => {
    if (!realtime?.deliveryReceipt || !selectedFriend || !myId) return
    const { byUserId, messageId } = realtime.deliveryReceipt
    const selectedId = selectedFriend.id || selectedFriend._id
    if (byUserId === selectedId) {
      setMessages(prev =>
        prev.map(m => {
          if (m.fromUserId === myId && !m.delivered && !m.read) {
            if (!messageId || m.id === messageId) {
              return { ...m, delivered: true, deliveredAt: new Date() }
            }
          }
          return m
        })
      )
    }
  }, [realtime?.deliveryReceipt, selectedFriend, myId])

  // ── 3. Fetch Conversation Messages ──────────────────────────────────────────
  useEffect(() => {
    if (!myId || !selectedFriend) return

    let isMounted = true
    const selectedId = selectedFriend.id || selectedFriend._id

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/social/messages/conversation?userA=${encodeURIComponent(myId)}&userB=${encodeURIComponent(selectedId)}`).then(r => r.json())
        if (isMounted) {
          if (Array.isArray(res.messages)) {
            // Authoritative deduplication of messages from permanent MongoDB store
            const seen = new Set()
            const clean = []
            for (const m of res.messages) {
              const k = m.id || (m._id ? String(m._id) : null)
              if (k && !seen.has(k)) {
                seen.add(k)
                clean.push(m)
              }
            }
            setMessages(clean)
          }

          if (typeof res.areFriends === 'boolean') {
            setFriendshipInfo({
              areFriends: res.areFriends,
              status: res.friendshipStatus || (res.areFriends ? 'friends' : 'none'),
              loading: false
            })
          }
        }
      } catch {}
    }

    fetchMessages()

    // Mark as read
    fetch('/api/social/messages/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toUserId: myId, fromUserId: selectedId })
    }).catch(() => {})

    const timer = setInterval(fetchMessages, 2500)
    return () => {
      isMounted = false
      clearInterval(timer)
    }
  }, [myId, selectedFriend])

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const selectedFriendId = selectedFriend?.id || selectedFriend?._id
  const isAcceptedFriend = friends.some(f => (f.id || f._id) === selectedFriendId)
  const isChatEnabled = isAcceptedFriend || friendshipInfo.areFriends
  const isSelectedFriendOnline = realtime?.presenceMap?.[selectedFriendId] === 'online'

  // Update friendship verification when selectedFriend or friends list changes
  useEffect(() => {
    if (!selectedFriend) return
    const isFriend = friends.some(f => (f.id || f._id) === selectedFriendId)
    setFriendshipInfo(prev => ({
      areFriends: isFriend,
      status: isFriend ? 'friends' : (prev.status !== 'friends' ? prev.status : 'none'),
      loading: false
    }))
  }, [selectedFriend, selectedFriendId, friends])

  // Direct action: Send Friend Request from within chat to unlock it
  const handleSendRequestInChat = async () => {
    if (!myId || !selectedFriendId || requestLoading) return
    setRequestLoading(true)
    try {
      const res = await fetch('/api/social/friend-request/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUserId: myId, toUserId: selectedFriendId })
      }).then(r => r.json())

      if (res.success) {
        setFriendshipInfo({ areFriends: false, status: 'pending_outgoing', loading: false })
      } else {
        alert(res.error || 'Could not send friend request.')
      }
    } catch (err) {
      console.error('Error sending friend request from chat:', err)
    } finally {
      setRequestLoading(false)
    }
  }

  // Direct action: Accept Incoming Friend Request from within chat to unlock it
  const handleAcceptRequestInChat = async () => {
    if (!myId || !selectedFriendId || requestLoading) return
    setRequestLoading(true)
    try {
      const rRes = await fetch(`/api/social/friend-requests?me=${encodeURIComponent(myId)}`).then(r => r.json())
      const incoming = rRes.incoming || []
      const match = incoming.find(r => String(r.fromUserId) === String(selectedFriendId) || String(r.user?.id) === String(selectedFriendId))
      if (match) {
        const res = await fetch('/api/social/friend-request/respond', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requestId: match.id || match._id, action: 'accept', userId: myId })
        }).then(r => r.json())

        if (res.success) {
          setFriends(prev => [...prev, selectedFriend])
          setFriendshipInfo({ areFriends: true, status: 'friends', loading: false })
        } else {
          alert(res.error || 'Could not accept friend request.')
        }
      } else {
        const fRes = await fetch(`/api/social/friends?me=${encodeURIComponent(myId)}`).then(r => r.json())
        setFriends(fRes.friends || [])
        setFriendshipInfo({ areFriends: true, status: 'friends', loading: false })
      }
    } catch (err) {
      console.error('Error accepting friend request from chat:', err)
    } finally {
      setRequestLoading(false)
    }
  }

  // Direct action: Unfriend current chat partner
  const handleUnfriendCurrent = async () => {
    if (!myId || !selectedFriendId) return
    const name = selectedFriend?.displayName || selectedFriend?.name || `@${selectedFriend?.username || 'user'}`
    if (!window.confirm(`Are you sure you want to unfriend ${name}? Chat will be disabled until you become friends again.`)) {
      return
    }

    try {
      const res = await fetch('/api/social/friend/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: myId, friendId: selectedFriendId })
      }).then(r => r.json())

      if (res.success) {
        setFriends(prev => prev.filter(f => (f.id || f._id) !== selectedFriendId))
        setFriendshipInfo({ areFriends: false, status: 'none', loading: false })
      } else {
        alert(res.error || 'Failed to unfriend.')
      }
    } catch (err) {
      console.error('Error unfriending in chat:', err)
    }
  }

  // ── 4. Send Message (Text) — Strictly disabled without mutual friendship ─────
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault()
    if (!chatInput.trim() || !selectedFriend || sendingMsg || !myId || !isChatEnabled) return

    const selectedId = selectedFriend.id || selectedFriend._id
    const text = chatInput.trim()
    setChatInput('')
    setSendingMsg(true)

    try {
      const res = await fetch('/api/social/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: myId,
          toUserId: selectedId,
          text
        })
      }).then(r => r.json())

      if (res.success && res.message) {
        setMessages(prev => {
          if (prev.some(m => isSameMessage(m, res.message))) return prev
          return [...prev, res.message]
        })
      } else if (res.error) {
        alert(res.error)
        setFriendshipInfo(prev => ({ ...prev, areFriends: false }))
      }
    } catch (err) {
      console.error('[Chat] Send error:', err)
    } finally {
      setSendingMsg(false)
    }
  }

  // ── 5. Share Movie Recommendation into Chat — Strictly disabled without mutual friendship
  const handleShareMovie = async (movieRec) => {
    if (!selectedFriend || !myId || !isChatEnabled) return
    const selectedId = selectedFriend.id || selectedFriend._id
    try {
      const res = await fetch('/api/social/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: myId,
          toUserId: selectedId,
          text: `🎬 Recommended: ${movieRec.title}`,
          movieRecommendation: movieRec
        })
      }).then(r => r.json())

      if (res.success && res.message) {
        setMessages(prev => {
          if (prev.some(m => isSameMessage(m, res.message))) return prev
          return [...prev, res.message]
        })
      } else if (res.error) {
        alert(res.error)
      }
    } catch (err) {
      console.error('[Chat] Movie share error:', err)
    }
  }

  // Launch Couch Consensus directly with this friend
  const launchConsensusWithFriend = (friend) => {
    if (!isChatEnabled) return
    setActiveChatFriend(friend)
    navigate('consensus')
  }

  // Contacts list: Only mutual accepted Cine-Friends!
  // If an active chat friend was navigated to who is not yet in friends, also show them with a locked badge.
  const contactList = useMemo(() => {
    const list = [...friends]
    if (selectedFriend && !friends.some(f => (f.id || f._id) === (selectedFriend.id || selectedFriend._id))) {
      list.unshift(selectedFriend)
    }
    return list
  }, [friends, selectedFriend])

  const filteredContacts = contactList.filter(f =>
    !searchFilter.trim() ||
    (f.displayName || f.name || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
    (f.username || '').toLowerCase().includes(searchFilter.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', padding: '84px 24px 48px', maxWidth: 1400, margin: '0 auto', fontFamily: "'DM Sans', sans-serif" }}>
      {/* ── HEADER BAR ──────────────────────────────────────────────────────── */}
      <div className="fu" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(229,9,20,.12)', border: '1px solid rgba(229,9,20,.25)', borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700, color: '#e50914', marginBottom: 6 }}>
            <span>💬</span> REAL-TIME CINEPHILE MESSENGER
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 42, color: 'white', letterSpacing: 1, margin: 0 }}>
            Cine<span style={{ color: '#e50914' }}>Chat</span> & Messages
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => navigate('friends')}
            style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8, padding: '8px 16px', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span>👥</span> Manage Cine-Friends
          </button>
        </div>
      </div>

      {/* ── MESSENGER MAIN GRID ─────────────────────────────────────────────── */}
      <div className="fu d1" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', minHeight: 650, height: 'calc(100vh - 200px)', background: '#090915', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, overflow: 'hidden' }}>
        {/* Left Sidebar: Conversations List (Hidden on mobile if friend selected) */}
        {(!isMobile || !selectedFriend) && (
          <div style={{ borderRight: isMobile ? 'none' : '1px solid rgba(255,255,255,.07)', display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,.01)', height: '100%' }}>
            {/* Search box in sidebar */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '6px 12px', gap: 8 }}>
                <span style={{ fontSize: 13, opacity: 0.5 }}>🔍</span>
                <input
                  type="text"
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  placeholder="Search conversations..."
                  style={{ background: 'none', border: 'none', color: 'white', fontSize: 12, outline: 'none', width: '100%' }}
                />
              </div>
            </div>

            {/* Contacts Stream */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <div style={{ padding: '10px 16px 6px', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {friends.length > 0 ? `Cine-Friends (${friends.length})` : 'Cine-Friends'}
              </div>

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
                  <Spinner size={24} />
                </div>
              ) : filteredContacts.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'rgba(255,255,255,.4)', fontSize: 12 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
                  <div style={{ fontWeight: 700, color: 'white', marginBottom: 4 }}>No Cine-Friends Added</div>
                  <div>Chat is disabled until a friend request is accepted.</div>
                  <div style={{ marginTop: 12 }}>
                    <button
                      onClick={() => navigate('friends')}
                      style={{ background: '#e50914', border: 'none', borderRadius: 6, padding: '7px 16px', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                    >
                      🔍 Find & Add Friends
                    </button>
                  </div>
                </div>
              ) : (
                filteredContacts.map(f => {
                  const fId = f.id || f._id
                  const isSelected = selectedFriendId === fId
                  const isOnline = realtime?.presenceMap?.[fId] === 'online'
                  const isFriend = friends.some(friend => (friend.id || friend._id) === fId)

                  return (
                    <div
                      key={fId}
                      onClick={() => setSelectedFriend(f)}
                      style={{
                        padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,.04)',
                        background: isSelected ? 'rgba(229,9,20,.12)' : 'transparent',
                        borderLeft: isSelected ? '3px solid #e50914' : '3px solid transparent',
                        cursor: 'pointer', transition: 'all .2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ position: 'relative' }}>
                          <span style={{ fontSize: 26 }}>{f.avatar || '🍿'}</span>
                          <span
                            style={{
                              position: 'absolute', bottom: -1, right: -1, width: 8, height: 8, borderRadius: '50%',
                              background: isOnline ? '#10b981' : '#6b7280',
                              border: '1.5px solid #090915'
                            }}
                            title={isOnline ? 'Online' : 'Offline'}
                          />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {f.displayName || f.name}
                            </div>
                            {isFriend ? (
                              <span style={{ fontSize: 10, fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,.12)', padding: '1px 6px', borderRadius: 4 }}>
                                {f.tasteMatchScore || f.tasteCompatibility || 75}%
                              </span>
                            ) : (
                              <span style={{ fontSize: 9, fontWeight: 700, color: '#f87171', background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.25)', padding: '1px 5px', borderRadius: 4 }}>
                                🔒 Locked
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 11, color: '#e50914', marginTop: 1, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <span>@{f.username}</span>
                              <span style={{ fontSize: 9, color: isOnline ? '#10b981' : 'rgba(255,255,255,.3)' }}>
                                · {isOnline ? 'Active Now' : 'Offline'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate('profile', f)
                              }}
                              style={{
                                background: 'rgba(255,255,255,.06)',
                                border: '1px solid rgba(255,255,255,.1)',
                                borderRadius: 4,
                                padding: '2px 6px',
                                color: 'rgba(255,255,255,.7)',
                                fontSize: 9,
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                              title={`View @${f.username}'s public profile`}
                            >
                              👤 Profile
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* Right Main Chat Panel (Hidden on mobile if no friend selected) */}
        {(!isMobile || selectedFriend) && (
          selectedFriend ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'rgba(0,0,0,.15)' }}>
            {/* Active Friend Header */}
            <div style={{ padding: '14px 22px', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,.02)', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Back button on mobile */}
                {isMobile && (
                  <button
                    onClick={() => setSelectedFriend(null)}
                    style={{
                      background: 'rgba(255,255,255,.08)',
                      border: '1px solid rgba(255,255,255,.15)',
                      borderRadius: 8,
                      color: 'white',
                      padding: '6px 10px',
                      fontSize: 14,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                    title="Back to conversations"
                  >
                    ←
                  </button>
                )}

                {/* Friend Avatar & Info (Click to view Profile) */}
                <div
                  onClick={() => navigate('profile', selectedFriend)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                  title={`View @${selectedFriend.username}'s public profile`}
                >
                  <div style={{ position: 'relative' }}>
                    <span style={{ fontSize: 28 }}>{selectedFriend.avatar || '🍿'}</span>
                    <span
                      style={{
                        position: 'absolute', bottom: -1, right: -1, width: 9, height: 9, borderRadius: '50%',
                        background: isSelectedFriendOnline ? '#10b981' : '#6b7280',
                        border: '2px solid #090915'
                      }}
                      title={isSelectedFriendOnline ? 'Online' : 'Offline'}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>{selectedFriend.displayName || selectedFriend.name}</span>
                      <span style={{ fontSize: 12, color: '#e50914', fontWeight: 600 }}>@{selectedFriend.username}</span>
                      <span style={{ fontSize: 10, background: isChatEnabled ? (isSelectedFriendOnline ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)') : 'rgba(239,68,68,0.15)', color: isChatEnabled ? (isSelectedFriendOnline ? '#10b981' : 'rgba(255,255,255,0.4)') : '#f87171', border: `1px solid ${isChatEnabled ? (isSelectedFriendOnline ? '#10b981' : 'transparent') : 'rgba(239,68,68,0.3)'}`, padding: '1px 7px', borderRadius: 6, fontWeight: 600 }}>
                        {isChatEnabled ? (isSelectedFriendOnline ? 'Online' : 'Offline') : '🔒 Chat Disabled'}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', display: 'flex', alignItems: 'center', gap: 8, marginTop: 2, flexWrap: 'wrap' }}>
                      <span>⚡ {selectedFriend.tasteMatchScore || selectedFriend.tasteCompatibility || 75}% Taste Match</span>
                      <span>·</span>
                      <span style={{ color: '#38bdf8', textDecoration: 'underline' }}>
                        👤 View Profile ➔
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: View Profile & Launch Couch Consensus */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => navigate('profile', selectedFriend)}
                  style={{
                    background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.16)',
                    color: 'white', borderRadius: 8, padding: '8px 12px', fontSize: 11,
                    fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                    transition: 'all .2s'
                  }}
                  title="View Cinephile Profile"
                >
                  <span>👤</span> Profile
                </button>
                {isChatEnabled && (
                  <>
                    <button
                      onClick={() => launchConsensusWithFriend(selectedFriend)}
                      style={{
                        background: 'rgba(229,9,20,.12)', border: '1px solid rgba(229,9,20,.3)',
                        color: '#e50914', borderRadius: 8, padding: '8px 14px', fontSize: 11,
                        fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                        transition: 'all .2s'
                      }}
                    >
                      <span>🛋️</span> Consensus
                    </button>
                    <button
                      onClick={handleUnfriendCurrent}
                      style={{
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                        color: '#f87171', borderRadius: 8, padding: '8px 12px', fontSize: 11,
                        fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                        transition: 'all .2s'
                      }}
                      title="Unfriend this Cinephile"
                    >
                      <span>✕</span> Unfriend
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Friend Typing Indicator */}
            {realtime?.typingMap?.[selectedFriendId] && (
              <div style={{ background: 'rgba(229,9,20,0.08)', borderBottom: '1px solid rgba(229,9,20,0.2)', padding: '5px 22px', fontSize: 11, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="dot-pulse">✍️</span> @{selectedFriend.username} is typing...
              </div>
            )}

            {/* Messages Scroll Area */}
            <div style={{ flex: 1, padding: 22, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {messages.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,.3)', fontSize: 13, margin: 'auto' }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🎬</div>
                  <div>No messages yet with @{selectedFriend.username}.</div>
                  <div style={{ fontSize: 11, marginTop: 6, color: 'rgba(255,255,255,.4)' }}>
                    Type a message below or click "Recommend Movie" to drop your favorite film into the chat!
                  </div>
                </div>
              ) : (
                messages.map((m, idx) => {
                  const isMe = m.fromUserId === myId
                  const msgKey = m.id || (m._id ? String(m._id) : `msg_${idx}`)
                  return (
                    <div
                      key={msgKey}
                      style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start'
                      }}
                    >
                      {/* Text Bubble */}
                      {m.text && (
                        <div
                          style={{
                            background: isMe ? 'linear-gradient(135deg,#e50914,#8b5cf6)' : 'rgba(255,255,255,.06)',
                            border: isMe ? 'none' : '1px solid rgba(255,255,255,.1)',
                            color: 'white', padding: '10px 15px', borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                            fontSize: 13, lineHeight: 1.45, boxShadow: isMe ? '0 4px 14px rgba(229,9,20,.2)' : 'none'
                          }}
                        >
                          {m.text}
                        </div>
                      )}

                      {/* Interactive In-Chat Movie Card */}
                      {m.movieRecommendation && (
                        <div
                          style={{
                            marginTop: 6,
                            background: '#0d0d1a',
                            border: '1px solid rgba(229,9,20,.3)',
                            borderRadius: 12, padding: 12, width: 310,
                            boxShadow: '0 8px 24px rgba(0,0,0,.6)'
                          }}
                        >
                          <div style={{ display: 'flex', gap: 10 }}>
                            <img
                              src={imgUrl(m.movieRecommendation.poster_path, 'w92')}
                              alt={m.movieRecommendation.title}
                              style={{ width: 56, height: 80, borderRadius: 6, objectFit: 'cover' }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {m.movieRecommendation.title}
                              </div>
                              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>
                                ⭐ {m.movieRecommendation.vote_average} · {m.movieRecommendation.release_date?.split('-')[0]}
                              </div>
                              <div style={{ fontSize: 9, color: '#d4a843', marginTop: 3 }}>
                                {(m.movieRecommendation.genres || []).slice(0, 2).join(' · ')}
                              </div>
                            </div>
                          </div>

                          {m.movieRecommendation.personalNote && (
                            <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(212,168,67,.08)', border: '1px solid rgba(212,168,67,.2)', borderRadius: 6, fontSize: 11, color: '#f3d994', fontStyle: 'italic', lineHeight: 1.35 }}>
                              "{m.movieRecommendation.personalNote}"
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                            <button
                              onClick={() => toggleWatchlist({ id: m.movieRecommendation.id, title: m.movieRecommendation.title, poster_path: m.movieRecommendation.poster_path, vote_average: m.movieRecommendation.vote_average })}
                              style={{ flex: 1, background: 'rgba(255,255,255,.07)', border: 'none', borderRadius: 6, padding: '5px 0', color: 'white', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}
                            >
                              {watchlist.some(w => w.id === m.movieRecommendation.id) ? '✓ In Watchlist' : '+ Watchlist'}
                            </button>
                            <button
                              onClick={() => navigate('movie', m.movieRecommendation.id)}
                              style={{ background: '#e50914', border: 'none', borderRadius: 6, padding: '5px 10px', color: 'white', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                            >
                              Details ➔
                            </button>
                          </div>
                        </div>
                      )}

                      <span style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', marginTop: 3, padding: '0 4px', display: 'flex', alignItems: 'center', gap: 3 }}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isMe && (
                          <WhatsAppTick status={m.read ? 'read' : (m.delivered ? 'delivered' : 'sent')} />
                        )}
                      </span>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Composer: Active if mutual friends, Locked if request not accepted */}
            {isChatEnabled ? (
              <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.02)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShareModalOpen(true)}
                  style={{
                    background: 'rgba(229,9,20,.15)', border: '1px solid rgba(229,9,20,.35)',
                    color: '#e50914', borderRadius: 8, padding: '10px 14px', fontSize: 12,
                    fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap'
                  }}
                  title="Send interactive movie card"
                >
                  <span>🎬</span> Recommend Movie
                </button>

                <form onSubmit={handleSendMessage} style={{ flex: 1, display: 'flex', gap: 10 }}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => {
                      setChatInput(e.target.value)
                      if (selectedFriendId && realtime?.sendTyping) {
                        realtime.sendTyping(selectedFriendId, e.target.value.trim().length > 0)
                      }
                    }}
                    placeholder={`Message @${selectedFriend.username}...`}
                    style={{
                      flex: 1, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
                      borderRadius: 8, padding: '11px 16px', color: 'white', fontSize: 13, outline: 'none'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || sendingMsg}
                    style={{
                      background: (chatInput.trim() && !sendingMsg) ? '#e50914' : 'rgba(255,255,255,.08)',
                      border: 'none', borderRadius: 8, padding: '11px 22px', color: 'white',
                      fontWeight: 700, fontSize: 13, cursor: (chatInput.trim() && !sendingMsg) ? 'pointer' : 'default', transition: 'all .2s',
                      opacity: sendingMsg ? 0.7 : 1
                    }}
                  >
                    {sendingMsg ? 'Sending...' : 'Send'}
                  </button>
                </form>
              </div>
            ) : (
              <div style={{
                padding: '20px 24px',
                background: 'rgba(20,20,35,0.85)',
                borderTop: '1px solid rgba(239,68,68,0.25)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                textAlign: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontWeight: 700, fontSize: 13 }}>
                  <span style={{ fontSize: 16 }}>🔒</span> Chat Disabled — Mutual Cine-Friendship Required
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, maxWidth: 500, lineHeight: 1.5 }}>
                  {friendshipInfo.status === 'pending_incoming' ? (
                    <span>@{selectedFriend.displayName || selectedFriend.name} has sent you a friend request. Accept the request to enable chat and sharing.</span>
                  ) : friendshipInfo.status === 'pending_outgoing' ? (
                    <span>Friend request sent! Chat will be unlocked automatically once @{selectedFriend.displayName || selectedFriend.name} accepts your request.</span>
                  ) : (
                    <span>You cannot message @{selectedFriend.displayName || selectedFriend.name} until they accept your friend request.</span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {friendshipInfo.status === 'pending_incoming' ? (
                    <button
                      onClick={handleAcceptRequestInChat}
                      disabled={requestLoading}
                      style={{ background: '#10b981', border: 'none', borderRadius: 8, padding: '9px 18px', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}
                    >
                      <span>✓</span> {requestLoading ? 'Accepting...' : 'Accept Friend Request & Enable Chat'}
                    </button>
                  ) : friendshipInfo.status === 'pending_outgoing' ? (
                    <span style={{ fontSize: 12, color: '#fbbf24', background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', padding: '7px 16px', borderRadius: 8, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <span>⏳</span> Request Pending Acceptance
                    </span>
                  ) : (
                    <button
                      onClick={handleSendRequestInChat}
                      disabled={requestLoading}
                      style={{ background: '#e50914', border: 'none', borderRadius: 8, padding: '9px 18px', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 14px rgba(229,9,20,0.3)' }}
                    >
                      <span>👥</span> {requestLoading ? 'Sending...' : 'Send Friend Request to Chat'}
                    </button>
                  )}

                  <button
                    onClick={() => navigate('profile', selectedFriend)}
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '9px 16px', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    👤 View Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.4)', padding: 48 }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>💬</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>Select a Conversation</div>
            <p style={{ fontSize: 12, maxWidth: 300, margin: '8px 0 16px', textAlign: 'center' }}>
              Choose a friend from the left sidebar to start chatting or sharing movie recommendations.
            </p>
            <button
              onClick={() => navigate('friends')}
              style={{ background: '#e50914', border: 'none', borderRadius: 8, padding: '10px 20px', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              👥 Find Cine-Friends
            </button>
          </div>
        ))}
      </div>

      {/* Movie Share Drawer Modal */}
      <MovieShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        recipientName={selectedFriend?.displayName || selectedFriend?.name}
        onShareMovie={handleShareMovie}
      />
    </div>
  )
}
