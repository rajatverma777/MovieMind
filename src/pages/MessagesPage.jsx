// src/pages/MessagesPage.jsx — Apple visionOS Minimalist Liquid Glass Messenger
import { useState, useEffect, useRef, useMemo, Fragment } from 'react'
import { useApp } from '@/context/AppContext'
import { imgUrl } from '@/data/constants'
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

// Apple / WhatsApp style message delivery & read status ticks
function WhatsAppTick({ status = 'sent' }) {
  if (status === 'read') {
    return (
      <span title="Read" aria-label="Read" style={{ display: 'inline-flex', alignItems: 'center', color: '#38bdf8', marginLeft: 4 }}>
        <svg width="15" height="10" viewBox="0 0 18 11" fill="none">
          <path d="M1 6L4.5 9.5L12 1.5" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5.5 6L9 9.5L16.5 1.5" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  }

  if (status === 'delivered') {
    return (
      <span title="Delivered" aria-label="Delivered" style={{ display: 'inline-flex', alignItems: 'center', color: 'rgba(255,255,255,0.7)', marginLeft: 4 }}>
        <svg width="15" height="10" viewBox="0 0 18 11" fill="none">
          <path d="M1 6L4.5 9.5L12 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5.5 6L9 9.5L16.5 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  }

  return (
    <span title="Sent" aria-label="Sent" style={{ display: 'inline-flex', alignItems: 'center', color: 'rgba(255,255,255,0.45)', marginLeft: 4 }}>
      <svg width="11" height="10" viewBox="0 0 13 11" fill="none">
        <path d="M1 6L4.5 9.5L12 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

// Clean Send Arrow Icon
function SendArrowIcon({ size = 16, color = 'white' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor" fillOpacity="0.25" />
    </svg>
  )
}

// Friendly date formatter for grouping chat bubbles by day
function formatMessageDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined })
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

  // Lock window scroll on Messages page so only chat streams scroll, preventing page rubberbanding
  useEffect(() => {
    const origOverflow = document.body.style.overflow
    const origPaddingBottom = document.body.style.paddingBottom
    document.body.style.overflow = 'hidden'
    document.body.style.paddingBottom = '0px'
    return () => {
      document.body.style.overflow = origOverflow
      document.body.style.paddingBottom = origPaddingBottom
    }
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
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false)
  const chatScrollContainerRef = useRef(null)
  const prevMsgCountRef = useRef(0)

  // ── 1. Fetch Cine-Friends ──────────────────────────────────────────────────
  useEffect(() => {
    if (!myId) return
    const loadFriends = async () => {
      setLoading(true)
      try {
        const fRes = await fetch(`/api/social/friends?me=${encodeURIComponent(myId)}`).then(r => r.json()).catch(() => ({ friends: [] }))
        const friendList = fRes.friends || []
        setFriends(friendList)

        // Seed initial selected conversation partner only if explicitly requested via activeChatFriend
        setSelectedFriend(prev => {
          if (activeChatFriend) {
            const match = friendList.find(f => (f.id || f._id) === (activeChatFriend.id || activeChatFriend._id))
            return match || activeChatFriend
          }
          if (prev) {
            const match = friendList.find(f => (f.id || f._id) === (prev.id || prev._id))
            return match || prev
          }
          // Do NOT open any chat by default until user explicitly clicks a person
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
  }, [myId, activeChatFriend, watchlist.length])

  // Clear activeChatFriend when unmounting so re-visiting Messages starts clean without auto-selecting
  useEffect(() => {
    return () => {
      if (setActiveChatFriend) setActiveChatFriend(null)
    }
  }, [setActiveChatFriend])

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
            const seen = new Set()
            const clean = []
            for (const m of res.messages) {
              const k = m.id || (m._id ? String(m._id) : null)
              if (k && !seen.has(k)) {
                seen.add(k)
                clean.push(m)
              }
            }
            setMessages(prev => {
              if (prev.length === clean.length) {
                const isSame = clean.every((m, i) => {
                  const p = prev[i]
                  return (m.id || m._id) === (p.id || p._id) &&
                         m.read === p.read &&
                         m.delivered === p.delivered &&
                         m.text === p.text
                })
                if (isSame) return prev
              }
              return clean
            })
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

  // Isolated scroll within chat container (never scrolls window)
  const scrollChatToBottom = (smooth = true) => {
    const el = chatScrollContainerRef.current
    if (!el) return
    if (smooth) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    } else {
      el.scrollTop = el.scrollHeight
    }
    setShowScrollBottomBtn(false)
  }

  // Handle scroll inside chat container to detect when user scrolls up to read old history
  const handleChatScroll = (e) => {
    const el = e.currentTarget
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setShowScrollBottomBtn(distanceFromBottom > 160)
  }

  // Auto-scroll chat only when new messages are added or when near bottom
  useEffect(() => {
    const el = chatScrollContainerRef.current
    if (!el) return

    const prevCount = prevMsgCountRef.current
    const newCount = messages.length
    prevMsgCountRef.current = newCount

    if (newCount > prevCount) {
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 160
      const lastMsg = messages[messages.length - 1]
      const isSentByMe = lastMsg?.fromUserId === myId

      if (isNearBottom || isSentByMe || prevCount === 0) {
        scrollChatToBottom(prevCount > 0)
      }
    }
  }, [messages, myId])

  // Reset scroll and snap to bottom when switching friends
  useEffect(() => {
    prevMsgCountRef.current = 0
    const t = setTimeout(() => scrollChatToBottom(false), 60)
    return () => clearTimeout(t)
  }, [selectedFriend?.id || selectedFriend?._id])

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

  // ── 4. Send Message (Text) ────────────────────────────────────────────────
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

  // ── 5. Share Movie Recommendation into Chat ──────────────────────────────
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

  const launchConsensusWithFriend = (friend) => {
    if (!isChatEnabled) return
    setActiveChatFriend(friend)
    navigate('consensus')
  }

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

  useEffect(() => {
    // Lock body scrolling while inside Messages page so gestures never scroll the webpage
    const prevOverflow = document.body.style.overflow
    const prevPaddingBottom = document.body.style.paddingBottom
    document.body.style.overflow = 'hidden'
    document.body.style.paddingBottom = '0px'
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.paddingBottom = prevPaddingBottom
    }
  }, [])

  return (
    <div
      style={{
        height: 'calc(100dvh - 104px)',
        maxHeight: 'calc(100dvh - 104px)',
        maxWidth: 1340,
        margin: '0 auto',
        padding: '6px 16px 0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'DM Sans', sans-serif"
      }}
    >
      {/* ── MINIMALIST HEADER ────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
          flexShrink: 0,
          gap: 12
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: 'rgba(56, 189, 248, 0.14)',
              border: '1.2px solid rgba(56, 189, 248, 0.35)',
              borderRadius: 20,
              padding: '3px 10px',
              fontSize: 11,
              fontWeight: 700,
              color: '#38bdf8',
              boxShadow: '0 0 12px rgba(56, 189, 248, 0.2)'
            }}
          >
            <span>💬</span> CINECHAT
          </div>
          <h1
            style={{
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'DM Sans', sans-serif",
              fontSize: 20,
              fontWeight: 700,
              color: 'white',
              letterSpacing: -0.3,
              margin: 0
            }}
          >
            Messages
          </h1>
        </div>

        <button
          onClick={() => navigate('friends')}
          className="apple-glass-btn"
          style={{
            padding: '6px 14px',
            fontSize: 11.5,
            fontWeight: 600
          }}
        >
          <span>👥</span> Manage Cine-Friends
        </button>
      </div>

      {/* ── LIQUID GLASS MESSENGER CONTAINER ─────────────────────────────── */}
      <div
        className="apple-glass-card"
        style={{
          flex: '1 1 0',
          height: '100%',
          minHeight: 0,
          maxHeight: '100%',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '300px 1fr',
          gridTemplateRows: '100%',
          overflow: 'hidden'
        }}
      >
        {/* ── LEFT SIDEBAR: CONVERSATIONS ──────────────────────────────────── */}
        {(!isMobile || !selectedFriend) && (
          <div
            style={{
              borderRight: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(255, 255, 255, 0.015)',
              height: '100%',
              minHeight: 0
            }}
          >
            {/* Search Pill */}
            <div style={{ padding: '12px 14px 8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', flexShrink: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1.2px solid rgba(255, 255, 255, 0.14)',
                  borderRadius: 100,
                  padding: '7px 14px',
                  gap: 8,
                  backdropFilter: 'blur(16px)',
                  boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)'
                }}
              >
                <span style={{ fontSize: 13, opacity: 0.55 }}>🔍</span>
                <input
                  type="text"
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  placeholder="Search chats..."
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    fontSize: 12.5,
                    outline: 'none',
                    width: '100%',
                    fontFamily: 'inherit'
                  }}
                />
                {searchFilter && (
                  <button
                    onClick={() => setSearchFilter('')}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 11, padding: 0 }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Conversation Items Stream */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch',
                padding: '6px 4px'
              }}
            >
              <div
                style={{
                  padding: '8px 12px 4px',
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'rgba(255, 255, 255, 0.4)',
                  letterSpacing: 0.6,
                  textTransform: 'uppercase'
                }}
              >
                {friends.length > 0 ? `Cine-Friends (${friends.length})` : 'Cine-Friends'}
              </div>

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 36 }}>
                  <Spinner size={24} />
                </div>
              ) : filteredContacts.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'rgba(255, 255, 255, 0.45)', fontSize: 12 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
                  <div style={{ fontWeight: 600, color: 'white', marginBottom: 4 }}>No Cine-Friends Found</div>
                  <div style={{ fontSize: 11, lineHeight: 1.4 }}>Add friends to start chatting and sharing movie cards.</div>
                  <div style={{ marginTop: 14 }}>
                    <button
                      onClick={() => navigate('friends')}
                      style={{
                        background: 'rgba(56, 189, 248, 0.15)',
                        border: '1px solid rgba(56, 189, 248, 0.35)',
                        borderRadius: 16,
                        padding: '6px 14px',
                        color: '#38bdf8',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Find Friends
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
                        margin: '3px 6px',
                        padding: '10px 12px',
                        borderRadius: 16,
                        background: isSelected ? 'rgba(56, 189, 248, 0.14)' : 'transparent',
                        border: isSelected ? '1px solid rgba(56, 189, 248, 0.38)' : '1px solid transparent',
                        boxShadow: isSelected ? '0 0 16px rgba(56, 189, 248, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease'
                      }}
                      onMouseOver={e => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                        }
                      }}
                      onMouseOut={e => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'transparent'
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {/* Avatar Capsule */}
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              background: 'rgba(255, 255, 255, 0.08)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 20
                            }}
                          >
                            {f.avatar || '🍿'}
                          </div>
                          <span
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              width: 9,
                              height: 9,
                              borderRadius: '50%',
                              background: isOnline ? '#10b981' : '#6b7280',
                              border: '2px solid #0e111c',
                              boxShadow: isOnline ? '0 0 6px #10b981' : 'none'
                            }}
                          />
                        </div>

                        {/* Friend Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: 'rgba(255, 255, 255, 0.95)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {f.displayName || f.name}
                            </span>
                            {isFriend ? (
                              <span
                                style={{
                                  fontSize: 9.5,
                                  fontWeight: 700,
                                  color: (f.tasteMatchScore ?? f.tasteCompatibility ?? 0) > 0 ? '#34d399' : 'rgba(255,255,255,0.4)',
                                  background: (f.tasteMatchScore ?? f.tasteCompatibility ?? 0) > 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.06)',
                                  border: `1px solid ${(f.tasteMatchScore ?? f.tasteCompatibility ?? 0) > 0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.1)'}`,
                                  padding: '1px 6px',
                                  borderRadius: 10,
                                  flexShrink: 0
                                }}
                              >
                                {(f.tasteMatchScore ?? f.tasteCompatibility ?? 0) > 0
                                  ? `⚡ ${f.tasteMatchScore ?? f.tasteCompatibility}%`
                                  : '0% Match'}
                              </span>
                            ) : (
                              <span
                                style={{
                                  fontSize: 9,
                                  fontWeight: 700,
                                  color: '#fbbf24',
                                  background: 'rgba(251, 191, 36, 0.12)',
                                  border: '1px solid rgba(251, 191, 36, 0.25)',
                                  padding: '1px 5px',
                                  borderRadius: 10
                                }}
                              >
                                🔒 Locked
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.45)',
                              marginTop: 2,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            @{f.username} {isOnline && <span style={{ color: '#10b981' }}>· active</span>}
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

        {/* ── RIGHT MAIN CHAT PANEL ────────────────────────────────────────── */}
        {(!isMobile || selectedFriend) && (
          selectedFriend ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                maxHeight: '100%',
                minHeight: 0,
                overflow: 'hidden',
                position: 'relative',
                background: 'rgba(0, 0, 0, 0.12)'
              }}
            >
              {/* Active Conversation Top Bar */}
              <div
                style={{
                  padding: '12px 20px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.02)',
                  flexWrap: 'wrap',
                  gap: 10,
                  flexShrink: 0
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {isMobile && (
                    <button
                      onClick={() => setSelectedFriend(null)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.14)',
                        borderRadius: 14,
                        color: 'white',
                        padding: '5px 10px',
                        fontSize: 13,
                        cursor: 'pointer'
                      }}
                    >
                      ←
                    </button>
                  )}

                  {/* Profile info in header */}
                  <div
                    onClick={() => navigate('profile', selectedFriend)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                  >
                    <div style={{ position: 'relative' }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.18)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 22
                        }}
                      >
                        {selectedFriend.avatar || '🍿'}
                      </div>
                      <span
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: isSelectedFriendOnline ? '#10b981' : '#6b7280',
                          border: '2px solid #0e111c',
                          boxShadow: isSelectedFriendOnline ? '0 0 6px #10b981' : 'none'
                        }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>
                          {selectedFriend.displayName || selectedFriend.name}
                        </span>
                        <span style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.5)' }}>
                          @{selectedFriend.username}
                        </span>
                        <span
                          style={{
                            fontSize: 9.5,
                            padding: '2px 8px',
                            borderRadius: 12,
                            fontWeight: 600,
                            background: isChatEnabled
                              ? (isSelectedFriendOnline ? 'rgba(16, 185, 129, 0.14)' : 'rgba(255, 255, 255, 0.06)')
                              : 'rgba(239, 68, 68, 0.14)',
                            color: isChatEnabled
                              ? (isSelectedFriendOnline ? '#34d399' : 'rgba(255, 255, 255, 0.45)')
                              : '#f87171',
                            border: `1px solid ${isChatEnabled ? (isSelectedFriendOnline ? 'rgba(16, 185, 129, 0.3)' : 'transparent') : 'rgba(239, 68, 68, 0.3)'}`
                          }}
                        >
                          {isChatEnabled ? (isSelectedFriendOnline ? 'Online' : 'Offline') : '🔒 Chat Locked'}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: '#38bdf8', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>
                          {(selectedFriend.tasteMatchScore ?? selectedFriend.tasteCompatibility ?? 0) > 0
                            ? `⚡ ${selectedFriend.tasteMatchScore ?? selectedFriend.tasteCompatibility}% Taste Match`
                            : '⚡ 0% Taste Match (Save movies to compare)'}
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
                        <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>View Profile →</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => navigate('profile', selectedFriend)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: 'rgba(255, 255, 255, 0.85)',
                      borderRadius: 16,
                      padding: '6px 12px',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      transition: 'all 0.18s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  >
                    <span>👤</span> Profile
                  </button>

                  {isChatEnabled && (
                    <>
                      <button
                        onClick={() => launchConsensusWithFriend(selectedFriend)}
                        style={{
                          background: 'rgba(56, 189, 248, 0.12)',
                          border: '1px solid rgba(56, 189, 248, 0.28)',
                          color: '#38bdf8',
                          borderRadius: 16,
                          padding: '6px 12px',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          transition: 'all 0.18s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.2)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.12)'}
                      >
                        <span>🛋️</span> Watch Party
                      </button>

                      <button
                        onClick={handleUnfriendCurrent}
                        style={{
                          background: 'rgba(239, 68, 68, 0.08)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          color: '#f87171',
                          borderRadius: 16,
                          padding: '6px 10px',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          transition: 'all 0.18s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.16)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
                      >
                        <span>✕</span> Unfriend
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Typing indicator */}
              {realtime?.typingMap?.[selectedFriendId] && (
                <div
                  style={{
                    background: 'rgba(56, 189, 248, 0.08)',
                    borderBottom: '1px solid rgba(56, 189, 248, 0.15)',
                    padding: '4px 20px',
                    fontSize: 11,
                    color: '#7dd3fc',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    flexShrink: 0
                  }}
                >
                  <span className="dot-pulse">✍️</span> @{selectedFriend.username} is typing...
                </div>
              )}

              {/* Messages Stream */}
              <div
                ref={chatScrollContainerRef}
                onScroll={handleChatScroll}
                style={{
                  flex: '1 1 0',
                  minHeight: 0,
                  maxHeight: '100%',
                  padding: '16px 20px',
                  overflowY: 'auto',
                  overscrollBehavior: 'contain',
                  WebkitOverflowScrolling: 'touch',
                  touchAction: 'pan-y',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}
              >
                {messages.length === 0 ? (
                  <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255, 255, 255, 0.35)', fontSize: 13, margin: 'auto' }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>🎬</div>
                    <div style={{ fontWeight: 600, color: 'white' }}>Start a Conversation</div>
                    <div style={{ fontSize: 11.5, marginTop: 4, color: 'rgba(255, 255, 255, 0.45)' }}>
                      Say hi to @{selectedFriend.username} or share a movie you love!
                    </div>
                  </div>
                ) : (
                  messages.map((m, idx) => {
                    const isMe = m.fromUserId === myId
                    const msgKey = m.id || (m._id ? String(m._id) : `msg_${idx}`)
                    const dateLabel = formatMessageDate(m.createdAt)
                    const prevDateLabel = idx > 0 ? formatMessageDate(messages[idx - 1].createdAt) : null
                    const showDateDivider = Boolean(dateLabel && dateLabel !== prevDateLabel)

                    // Check if message is a Couch Consensus party invite
                    const isConsensusInvite = m.text && (
                      m.text.includes('Couch Consensus') ||
                      m.text.includes('movie-matching session')
                    )

                    return (
                      <Fragment key={msgKey}>
                        {showDateDivider && (
                          <div
                            style={{
                              alignSelf: 'center',
                              margin: '10px 0 6px',
                              background: 'rgba(255, 255, 255, 0.06)',
                              border: '1px solid rgba(255, 255, 255, 0.10)',
                              borderRadius: 14,
                              padding: '3px 12px',
                              fontSize: 10.5,
                              fontWeight: 600,
                              color: 'rgba(255, 255, 255, 0.65)',
                              letterSpacing: 0.3,
                              userSelect: 'none'
                            }}
                          >
                            {dateLabel}
                          </div>
                        )}

                        <div
                          style={{
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                            maxWidth: isConsensusInvite ? '85%' : '75%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isMe ? 'flex-end' : 'flex-start'
                          }}
                        >
                          {/* Couch Consensus Invite Card */}
                          {isConsensusInvite ? (
                            <div
                              style={{
                                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.88) 0%, rgba(15, 23, 42, 0.95) 100%)',
                                border: '1px solid rgba(56, 189, 248, 0.35)',
                                borderRadius: 18,
                                padding: '14px 16px',
                                maxWidth: 360,
                                boxShadow: '0 10px 32px rgba(0, 0, 0, 0.45), 0 0 16px rgba(56, 189, 248, 0.15)',
                                backdropFilter: 'blur(20px)'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                <div
                                  style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 12,
                                    background: 'rgba(56, 189, 248, 0.15)',
                                    border: '1px solid rgba(56, 189, 248, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 18,
                                    flexShrink: 0
                                  }}
                                >
                                  🛋️
                                </div>
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: 'white', letterSpacing: -0.2 }}>
                                    Couch Consensus
                                  </div>
                                  <div style={{ fontSize: 11, color: '#38bdf8', fontWeight: 500 }}>
                                    Watch Party Invitation
                                  </div>
                                </div>
                              </div>

                              <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.45, marginBottom: 12 }}>
                                {isMe
                                  ? `You invited @${selectedFriend.username} to a movie-matching session to pick tonight's film!`
                                  : `@${selectedFriend.username} invited you to a movie-matching session! Swipe and match films together.`}
                              </div>

                              <button
                                onClick={() => launchConsensusWithFriend(selectedFriend)}
                                style={{
                                  width: '100%',
                                  background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
                                  border: '1px solid rgba(255, 255, 255, 0.2)',
                                  borderRadius: 12,
                                  padding: '8px 14px',
                                  color: 'white',
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 6,
                                  boxShadow: '0 4px 16px rgba(14, 165, 233, 0.35)',
                                  transition: 'all 0.18s'
                                }}
                                onMouseOver={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                                onMouseOut={e => e.currentTarget.style.filter = 'none'}
                              >
                                <span>🍿</span> Join Watch Party →
                              </button>
                            </div>
                          ) : (
                            /* Text Message Bubble */
                            m.text && (
                              <div
                                style={{
                                  background: isMe
                                    ? 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)'
                                    : 'rgba(255, 255, 255, 0.08)',
                                  border: isMe ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
                                  color: 'white',
                                  padding: '9px 15px',
                                  borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                  fontSize: 13,
                                  lineHeight: 1.45,
                                  boxShadow: isMe ? '0 4px 14px rgba(14, 165, 233, 0.25)' : 'none',
                                  wordBreak: 'break-word'
                                }}
                              >
                                {m.text}
                              </div>
                            )
                          )}

                          {/* Interactive In-Chat Movie Card */}
                          {m.movieRecommendation && (
                            <div
                              style={{
                                marginTop: 6,
                                background: 'rgba(16, 20, 32, 0.85)',
                                border: '1px solid rgba(255, 255, 255, 0.14)',
                                borderRadius: 16,
                                padding: 12,
                                width: 300,
                                boxShadow: '0 12px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(20px)'
                              }}
                            >
                              <div style={{ display: 'flex', gap: 10 }}>
                                <img
                                  src={imgUrl(m.movieRecommendation.poster_path, 'w92')}
                                  alt={m.movieRecommendation.title}
                                  style={{ width: 54, height: 78, borderRadius: 8, objectFit: 'cover' }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {m.movieRecommendation.title}
                                  </div>
                                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                                    ⭐ {m.movieRecommendation.vote_average} · {m.movieRecommendation.release_date?.split('-')[0]}
                                  </div>
                                  <div style={{ fontSize: 9.5, color: '#38bdf8', marginTop: 3 }}>
                                    {(m.movieRecommendation.genres || []).slice(0, 2).join(' · ')}
                                  </div>
                                </div>
                              </div>

                              {m.movieRecommendation.personalNote && (
                                <div
                                  style={{
                                    marginTop: 8,
                                    padding: '6px 10px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: 8,
                                    fontSize: 11,
                                    color: 'rgba(255, 255, 255, 0.85)',
                                    fontStyle: 'italic',
                                    lineHeight: 1.35
                                  }}
                                >
                                  "{m.movieRecommendation.personalNote}"
                                </div>
                              )}

                              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                                <button
                                  onClick={() => toggleWatchlist({
                                    ...m.movieRecommendation,
                                    id: m.movieRecommendation.id,
                                    title: m.movieRecommendation.title,
                                    poster_path: m.movieRecommendation.poster_path,
                                    vote_average: m.movieRecommendation.vote_average,
                                    genre_ids: m.movieRecommendation.genre_ids || []
                                  })}
                                  style={{
                                    flex: 1,
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: 8,
                                    padding: '5px 0',
                                    color: 'white',
                                    fontSize: 10,
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                  }}
                                >
                                  {watchlist.some(w => w.id === m.movieRecommendation.id) ? '✓ Saved' : '+ Watchlist'}
                                </button>
                                <button
                                  onClick={() => navigate('movie', m.movieRecommendation.id)}
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.92)',
                                    border: 'none',
                                    borderRadius: 8,
                                    padding: '5px 10px',
                                    color: '#090910',
                                    fontSize: 10,
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Details ➔
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Timestamp & Delivery Tick */}
                          <span
                            style={{
                              fontSize: 9.5,
                              color: 'rgba(255, 255, 255, 0.35)',
                              marginTop: 3,
                              padding: '0 4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isMe && (
                              <WhatsAppTick status={m.read ? 'read' : (m.delivered ? 'delivered' : 'sent')} />
                            )}
                          </span>
                        </div>
                      </Fragment>
                    )
                  })
                )}
              </div>

              {/* Floating "Jump to Latest" Button */}
              {showScrollBottomBtn && (
                <button
                  type="button"
                  onClick={() => scrollChatToBottom(true)}
                  style={{
                    position: 'absolute',
                    bottom: isChatEnabled ? 74 : 110,
                    right: 22,
                    background: 'rgba(14, 165, 233, 0.92)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: 20,
                    padding: '7px 14px',
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 8px 24px rgba(14, 165, 233, 0.4), 0 2px 6px rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(12px)',
                    zIndex: 20,
                    transition: 'all 0.2s cubic-bezier(0.34, 1.2, 0.64, 1)'
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <span style={{ fontSize: 13, fontWeight: 800 }}>↓</span>
                  <span>Latest Messages</span>
                </button>
              )}

              {/* ── BOTTOM COMPOSER: LIQUID GLASS PILL ─────────────────────── */}
              {isChatEnabled ? (
                <div
                  style={{
                    flexShrink: 0,
                    padding: '12px 18px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                    background: 'rgba(14, 18, 30, 0.88)',
                    backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.01) 100%)',
                    backdropFilter: 'blur(28px) saturate(190%)',
                    WebkitBackdropFilter: 'blur(28px) saturate(190%)',
                    boxShadow: '0 -6px 24px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShareModalOpen(true)}
                    className="apple-glass-btn"
                    style={{
                      padding: '8px 14px',
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: '#38bdf8',
                      borderColor: 'rgba(56, 189, 248, 0.35)',
                      background: 'rgba(56, 189, 248, 0.12)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span>🎬</span> Recommend
                  </button>

                  <form
                    onSubmit={handleSendMessage}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1.2px solid rgba(255, 255, 255, 0.16)',
                      borderRadius: 100,
                      padding: '4px 6px 4px 16px',
                      backdropFilter: 'blur(16px)',
                      boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.25)'
                    }}
                  >
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
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        fontSize: 13,
                        outline: 'none',
                        fontFamily: 'inherit'
                      }}
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || sendingMsg}
                      className="apple-glass-btn-primary"
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        border: 'none',
                        padding: 0,
                        opacity: chatInput.trim() && !sendingMsg ? 1 : 0.4,
                        cursor: chatInput.trim() && !sendingMsg ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <SendArrowIcon size={14} color="white" />
                    </button>
                  </form>
                </div>
              ) : (
                /* Locked State: Apple VisionOS Frosted Glass Banner */
                <div
                  style={{
                    flexShrink: 0,
                    padding: '20px 24px',
                    background: 'rgba(16, 20, 32, 0.92)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(28px) saturate(190%)',
                    WebkitBackdropFilter: 'blur(28px) saturate(190%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    textAlign: 'center',
                    boxShadow: '0 -6px 24px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fbbf24', fontWeight: 600, fontSize: 13 }}>
                    <span>🔒</span> Chat Locked — Mutual Cine-Friendship Required
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: 12, maxWidth: 460, lineHeight: 1.5 }}>
                    {friendshipInfo.status === 'pending_incoming' ? (
                      <span>@{selectedFriend.displayName || selectedFriend.name} has sent you a friend request. Accept to enable chatting.</span>
                    ) : friendshipInfo.status === 'pending_outgoing' ? (
                      <span>Friend request sent! Chat will be unlocked automatically once @{selectedFriend.displayName || selectedFriend.name} accepts.</span>
                    ) : (
                      <span>You and @{selectedFriend.displayName || selectedFriend.name} must be mutual friends to send messages.</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {friendshipInfo.status === 'pending_incoming' ? (
                      <button
                        onClick={handleAcceptRequestInChat}
                        disabled={requestLoading}
                        style={{
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          border: 'none',
                          borderRadius: 20,
                          padding: '8px 18px',
                          color: 'white',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        <span>✓</span> {requestLoading ? 'Accepting...' : 'Accept Friend Request & Enable Chat'}
                      </button>
                    ) : friendshipInfo.status === 'pending_outgoing' ? (
                      <span
                        style={{
                          fontSize: 11.5,
                          color: '#fbbf24',
                          background: 'rgba(251, 191, 36, 0.12)',
                          border: '1px solid rgba(251, 191, 36, 0.28)',
                          padding: '6px 14px',
                          borderRadius: 20,
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <span>⏳</span> Request Pending Acceptance
                      </span>
                    ) : (
                      <button
                        onClick={handleSendRequestInChat}
                        disabled={requestLoading}
                        style={{
                          background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
                          border: 'none',
                          borderRadius: 20,
                          padding: '8px 18px',
                          color: 'white',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          boxShadow: '0 4px 14px rgba(14, 165, 233, 0.3)'
                        }}
                      >
                        <span>👥</span> {requestLoading ? 'Sending...' : 'Send Friend Request to Chat'}
                      </button>
                    )}

                    <button
                      onClick={() => navigate('profile', selectedFriend)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: 20,
                        padding: '8px 16px',
                        color: 'white',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      👤 View Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.45)',
                padding: 48,
                height: '100%',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 24,
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 34,
                  marginBottom: 16,
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
                }}
              >
                💬
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'white', letterSpacing: -0.2 }}>
                Select a Conversation
              </div>
              <p style={{ fontSize: 13, maxWidth: 320, margin: '8px 0 20px', lineHeight: 1.5, color: 'rgba(255, 255, 255, 0.5)' }}>
                Choose a Cine-Friend from the sidebar to view chat history and exchange movie recommendations.
              </p>
              <button
                onClick={() => navigate('friends')}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  borderRadius: 20,
                  padding: '9px 20px',
                  color: 'white',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.2s'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                }}
              >
                <span>👥</span> Find Cine-Friends
              </button>
            </div>
          )
        )}
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
