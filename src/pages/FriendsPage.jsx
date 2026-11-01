// src/pages/FriendsPage.jsx — Social Cine-Hub: Social Circle, Finding Cinephiles & Friend Requests
import { useState, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { GN } from '@/data/constants'
import Spinner from '@/components/Spinner'

export default function FriendsPage() {
  const { user, watchlist, navigate, setActiveChatFriend, realtime } = useApp()

  const myId = user?.id || user?._id

  // Tabs: 'friends' | 'search' | 'requests'
  const [activeTab, setActiveTab] = useState('friends')

  // Friends & Requests state
  const [friends, setFriends] = useState([])
  const [incomingRequests, setIncomingRequests] = useState([])
  const [outgoingRequests, setOutgoingRequests] = useState([])
  const [communityUsers, setCommunityUsers] = useState([])
  const [loadingFriends, setLoadingFriends] = useState(false)

  // User search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [actionStatus, setActionStatus] = useState({}) // { [toUserId]: 'sending' | 'sent' | 'error' }

  // ── 1. Fetch Friends, Requests & Community Cinephiles ────────────────────────
  const loadSocialData = async () => {
    if (!myId) return
    try {
      setLoadingFriends(true)
      const [fRes, rRes, cRes] = await Promise.all([
        fetch(`/api/social/friends?me=${encodeURIComponent(myId)}`).then(r => r.json()).catch(() => ({ friends: [] })),
        fetch(`/api/social/friend-requests?me=${encodeURIComponent(myId)}`).then(r => r.json()).catch(() => ({ incoming: [], outgoing: [] })),
        fetch(`/api/social/community-users?me=${encodeURIComponent(myId)}`).then(r => r.json()).catch(() => ({ users: [] }))
      ])

      const friendList = fRes.friends || []
      const inc = rRes.incoming || []
      const out = rRes.outgoing || []
      const community = cRes.users || []

      setFriends(friendList)
      setIncomingRequests(inc)
      setOutgoingRequests(out)
      setCommunityUsers(community)

      // Refresh real-time presence
      const allIds = [...friendList.map(f => f.id || f._id), ...community.map(c => c.id || c._id)].filter(Boolean)
      if (allIds.length > 0 && realtime?.refreshPresence) {
        realtime.refreshPresence(allIds)
      }
    } catch (err) {
      console.warn('[Social] Error loading friends data:', err)
    } finally {
      setLoadingFriends(false)
    }
  }

  useEffect(() => {
    loadSocialData()
  }, [myId, watchlist.length])

  // ── 2. User Search ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim() || !myId) {
      setSearchResults([])
      setSearching(false)
      return
    }

    setSearching(true)
    const deb = setTimeout(async () => {
      try {
        const res = await fetch(`/api/social/users/search?q=${encodeURIComponent(searchQuery)}&me=${encodeURIComponent(myId)}`).then(r => r.json())
        setSearchResults(res.users || [])
      } catch {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => clearTimeout(deb)
  }, [searchQuery, myId])

  // ── 3. Send Friend Request ─────────────────────────────────────────────────
  const handleSendFriendRequest = async (targetUser) => {
    const targetId = targetUser.id || targetUser._id
    if (!myId || !targetId) return

    setActionStatus(prev => ({ ...prev, [targetId]: 'sending' }))
    try {
      const res = await fetch('/api/social/friend-request/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: myId,
          toUserId: targetId
        })
      }).then(r => r.json())

      if (res.success) {
        setActionStatus(prev => ({ ...prev, [targetId]: 'sent' }))
        setOutgoingRequests(prev => [
          ...prev,
          {
            id: res.request?.id || `req_${Date.now()}`,
            fromUserId: myId,
            toUserId: targetId,
            status: 'pending',
            user: targetUser,
            toUser: targetUser,
            createdAt: new Date()
          }
        ])
      } else {
        alert(res.error || 'Could not send request.')
        setActionStatus(prev => ({ ...prev, [targetId]: 'error' }))
      }
    } catch {
      setActionStatus(prev => ({ ...prev, [targetId]: 'error' }))
    }
  }

  // ── 4. Cancel Sent Outgoing Request ────────────────────────────────────────
  const handleCancelRequest = async (requestId, targetUserId) => {
    if (!myId || !requestId) return
    try {
      const res = await fetch('/api/social/friend-request/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, userId: myId })
      }).then(r => r.json())

      if (res.success) {
        setOutgoingRequests(prev => prev.filter(r => r.id !== requestId && r._id !== requestId))
        if (targetUserId) {
          setActionStatus(prev => {
            const copy = { ...prev }
            delete copy[targetUserId]
            return copy
          })
        }
      } else {
        alert(res.error || 'Could not cancel request.')
      }
    } catch (err) {
      console.error('Error canceling request:', err)
    }
  }

  // ── 5. Accept / Decline Incoming Request ───────────────────────────────────
  const handleRespondRequest = async (requestId, action) => {
    if (!myId || !requestId) return
    try {
      const res = await fetch('/api/social/friend-request/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action, userId: myId })
      }).then(r => r.json())

      if (res.success) {
        setIncomingRequests(prev => prev.filter(r => r.id !== requestId && r._id !== requestId))
        await loadSocialData()
      } else {
        alert(res.error || `Could not ${action} request.`)
      }
    } catch (err) {
      console.error('Error responding to request:', err)
    }
  }

  // Start Direct Chat with any Cinephile in dedicated Messages Page
  const openChatWithFriend = (targetUser) => {
    setActiveChatFriend(targetUser)
    navigate('messages')
  }

  // Launch Couch Consensus directly with a friend
  const launchConsensusWithFriend = (friend) => {
    setActiveChatFriend(friend)
    navigate('consensus')
  }

  // ── 6. Unfriend / Remove Cine-Friend ───────────────────────────────────────
  const handleUnfriendFriend = async (friend) => {
    const friendId = friend.id || friend._id
    if (!myId || !friendId) return
    const friendName = friend.displayName || friend.name || `@${friend.username || 'user'}`
    if (!window.confirm(`Are you sure you want to unfriend ${friendName}? You will not be able to chat with them until you become friends again.`)) {
      return
    }

    try {
      const res = await fetch('/api/social/friend/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: myId, friendId })
      }).then(r => r.json())

      if (res.success) {
        setFriends(prev => prev.filter(f => (f.id || f._id) !== friendId))
      } else {
        alert(res.error || 'Failed to unfriend.')
      }
    } catch (err) {
      console.error('Error unfriending:', err)
    }
  }

  return (
    <div style={{ minHeight: '100vh', padding: '24px 20px 140px', maxWidth: 1200, margin: '0 auto', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'DM Sans', sans-serif" }}>
      {/* ── USER PROFILE HERO BAR ───────────────────────────────────────── */}
      <div className="apple-glass-card fu" style={{
        padding: '18px 24px', marginBottom: 22,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 14
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'rgba(229,9,20,.18)', border: '1.5px solid rgba(229,9,20,.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, boxShadow: '0 8px 20px rgba(229,9,20,.25), inset 0 1px 1px rgba(255,255,255,0.4)'
          }}>
            {user?.avatar || '🎬'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: 'white' }}>
                {user?.displayName || user?.name}
              </span>
              <span style={{ fontSize: 12, color: '#e50914', fontWeight: 700, background: 'rgba(229,9,20,.14)', padding: '2px 8px', borderRadius: 8 }}>
                @{user?.username}
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>
              {friends.length} friends · {watchlist.length} saved movies
            </div>
          </div>
        </div>

        {/* Quick jump to Messages */}
        <button
          onClick={() => navigate('messages')}
          className="apple-glass-btn-primary"
          style={{
            padding: '9px 18px',
            borderRadius: 100,
            fontSize: 12.5,
            fontWeight: 700
          }}
        >
          <span>💬</span> Open CineChat ({incomingRequests.length})
        </button>
      </div>

      {/* ── TOP NAV TABS ────────────────────────────────────────────────── */}
      <div className="apple-segmented-group fu d1" style={{ width: '100%', marginBottom: 24, display: 'flex' }}>
        {[
          { id: 'friends', label: '👥 My Friends', count: friends.length || null },
          { id: 'search', label: '🔍 Find Cinephiles', count: null },
          { id: 'requests', label: '📬 Requests', count: incomingRequests.length > 0 ? incomingRequests.length : (outgoingRequests.length > 0 ? outgoingRequests.length : null) },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`apple-segmented-item ${activeTab === t.id ? 'active' : ''}`}
            style={{
              flex: 1,
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: 13
            }}
          >
            <span>{t.label}</span>
            {t.count !== null && (
              <span style={{
                fontSize: 10,
                background: activeTab === t.id ? 'rgba(56,189,248,.3)' : 'rgba(255,255,255,.12)',
                color: activeTab === t.id ? '#ffffff' : 'rgba(255,255,255,.6)',
                padding: '1px 7px', borderRadius: 100, fontWeight: 800
              }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB 1: MY FRIENDS CIRCLE ────────────────────────────────────── */}
      {activeTab === 'friends' && (
        <div className="fu d2">
          {loadingFriends ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
              <Spinner size={36} />
            </div>
          ) : friends.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 64, color: 'rgba(255,255,255,.4)', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 16 }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>👥</div>
              <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 26, color: 'white' }}>Your Cine-Circle is Empty</h3>
              <p style={{ fontSize: 13, maxWidth: 400, margin: '8px auto 20px' }}>
                Search for cinephiles in the "Find Cinephiles" tab to connect, compare film tastes, and message each other!
              </p>
              <button
                onClick={() => setActiveTab('search')}
                style={{ background: '#e50914', border: 'none', borderRadius: 8, padding: '11px 24px', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                🔍 Search Cinephiles
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
              {friends.map(f => {
                const fId = f.id || f._id
                const isOnline = realtime?.presenceMap?.[fId] === 'online'

                return (
                  <div
                    key={fId}
                    style={{
                      background: 'linear-gradient(145deg, rgba(20,20,35,0.7) 0%, rgba(10,10,20,0.85) 100%)',
                      border: '1px solid rgba(255,255,255,.08)',
                      borderRadius: 16,
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 8px 24px rgba(0,0,0,.35)',
                      backdropFilter: 'blur(12px)',
                      transition: 'all .25s ease'
                    }}
                  >
                    <div>
                      {/* Card Header: Avatar, Name, % Fit & Unfriend */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        {/* User Identity */}
                        <div
                          onClick={() => navigate('profile', f)}
                          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', minWidth: 0 }}
                          title={`View @${f.username}'s public cinephile profile`}
                        >
                          {/* Styled Avatar with anchored Status Dot */}
                          <div
                            style={{
                              width: 46,
                              height: 46,
                              borderRadius: 12,
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.12)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 24,
                              position: 'relative',
                              flexShrink: 0
                            }}
                          >
                            <span>{f.avatar || '🍿'}</span>
                            <span
                              style={{
                                position: 'absolute',
                                bottom: -2,
                                right: -2,
                                width: 11,
                                height: 11,
                                borderRadius: '50%',
                                background: isOnline ? '#10b981' : '#64748b',
                                border: '2px solid #0e0e18',
                                boxShadow: isOnline ? '0 0 8px rgba(16,185,129,0.7)' : 'none'
                              }}
                              title={isOnline ? 'Online' : 'Offline'}
                            />
                          </div>

                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 16, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {f.displayName || f.name}
                            </div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                              @{f.username}
                            </div>
                          </div>
                        </div>

                        {/* Top Right: Taste Match Badge & Sleek Unfriend Button */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: '#10b981',
                              background: 'rgba(16,185,129,0.12)',
                              border: '1px solid rgba(16,185,129,0.25)',
                              padding: '3px 8px',
                              borderRadius: 8,
                              whiteSpace: 'nowrap'
                            }}
                            title="Taste Compatibility Score"
                          >
                            {(f.tasteMatchScore ?? f.tasteCompatibility ?? 0) > 0
                              ? `${f.tasteMatchScore ?? f.tasteCompatibility}% Fit`
                              : '0% Fit'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUnfriendFriend(f)
                            }}
                            style={{
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              borderRadius: 8,
                              width: 26,
                              height: 26,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'rgba(255,255,255,0.4)',
                              cursor: 'pointer',
                              fontSize: 12,
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={e => {
                              e.currentTarget.style.color = '#f87171'
                              e.currentTarget.style.background = 'rgba(239,68,68,0.15)'
                              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'
                            }}
                            onMouseOut={e => {
                              e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
                              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                            }}
                            title={`Unfriend @${f.username}`}
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Bio or Genre snippet */}
                      {f.bio ? (
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', lineHeight: 1.45, margin: '10px 0 12px', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          "{f.bio}"
                        </p>
                      ) : (
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', margin: '10px 0 12px' }}>
                          Favorite Genres: {(f.favoriteGenres || [878, 53]).map(id => GN[id]).filter(Boolean).slice(0, 3).join(' · ')}
                        </div>
                      )}

                      {/* Status Pill */}
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: isOnline ? '#10b981' : 'rgba(255,255,255,.45)', background: isOnline ? 'rgba(16,185,129,.08)' : 'rgba(255,255,255,.03)', padding: '2px 8px', borderRadius: 6, border: `1px solid ${isOnline ? 'rgba(16,185,129,.2)' : 'rgba(255,255,255,.06)'}`, marginBottom: 14 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: isOnline ? '#10b981' : '#64748b' }} />
                        <span>{isOnline ? 'Active Online' : 'Offline'}</span>
                      </div>
                    </div>

                    {/* Bottom Action Buttons: 3 clean, balanced, non-wrapping buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 8, marginTop: 10 }}>
                      <button
                        onClick={() => openChatWithFriend(f)}
                        style={{
                          background: '#e50914',
                          border: 'none',
                          borderRadius: 9,
                          padding: '10px 0',
                          color: 'white',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 5,
                          whiteSpace: 'nowrap',
                          boxShadow: '0 4px 12px rgba(229,9,20,.3)',
                          transition: 'all .2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#f40612'}
                        onMouseOut={e => e.currentTarget.style.background = '#e50914'}
                      >
                        <span>💬</span> Message
                      </button>

                      <button
                        onClick={() => launchConsensusWithFriend(f)}
                        style={{
                          background: 'rgba(229,9,20,.1)',
                          border: '1px solid rgba(229,9,20,.25)',
                          borderRadius: 9,
                          padding: '10px 0',
                          color: '#ff6b6b',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 5,
                          whiteSpace: 'nowrap',
                          transition: 'all .2s'
                        }}
                        onMouseOver={e => {
                          e.currentTarget.style.background = 'rgba(229,9,20,.18)'
                          e.currentTarget.style.borderColor = 'rgba(229,9,20,.4)'
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.background = 'rgba(229,9,20,.1)'
                          e.currentTarget.style.borderColor = 'rgba(229,9,20,.25)'
                        }}
                        title="Start Couch Consensus"
                      >
                        <span>🛋️</span> Match
                      </button>

                      <button
                        onClick={() => navigate('profile', f)}
                        style={{
                          background: 'rgba(255,255,255,.06)',
                          border: '1px solid rgba(255,255,255,.12)',
                          borderRadius: 9,
                          padding: '10px 0',
                          color: 'white',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 5,
                          whiteSpace: 'nowrap',
                          transition: 'all .2s'
                        }}
                        onMouseOver={e => {
                          e.currentTarget.style.background = 'rgba(255,255,255,.1)'
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,.2)'
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.background = 'rgba(255,255,255,.06)'
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,.12)'
                        }}
                        title="View Profile"
                      >
                        <span>👤</span> Profile
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: FIND CINE-FRIENDS & USERNAME SEARCH ──────────────────── */}
      {activeTab === 'search' && (
        <div className="fu d2" style={{ maxWidth: 740, margin: '0 auto' }}>
          {/* Search Bar */}
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, padding: '12px 18px', gap: 10 }}>
              <span style={{ fontSize: 18 }}>🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search cinephiles by unique @username or display name (e.g. alok_verma, rajat)..."
                style={{ width: '100%', background: 'none', border: 'none', color: 'white', fontSize: 14, outline: 'none' }}
              />
            </div>
          </div>

          {searching && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
              <Spinner size={32} />
            </div>
          )}

          {/* Results List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {searchResults.map(targetUser => {
              const targetId = targetUser.id || targetUser._id
              const isAlreadyFriend = friends.some(f => (f.id || f._id) === targetId)
              const outgoingReq = outgoingRequests.find(r => r.toUserId === targetId || (r.user?.id || r.user?._id) === targetId)
              const incomingReq = incomingRequests.find(r => r.fromUserId === targetId || (r.user?.id || r.user?._id) === targetId)
              const status = actionStatus[targetId]

              return (
                <div
                  key={targetId}
                  style={{
                    background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)',
                    borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12
                  }}
                >
                  <div
                    onClick={() => navigate('profile', targetUser)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                    title={`View @${targetUser.username}'s public profile`}
                  >
                    <span style={{ fontSize: 32 }}>{targetUser.avatar || '🍿'}</span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>{targetUser.displayName || targetUser.name}</span>
                        <span style={{ fontSize: 12, color: '#e50914', fontWeight: 700 }}>@{targetUser.username}</span>
                        {isAlreadyFriend ? (
                          <span style={{ fontSize: 10, color: '#10b981', fontWeight: 700, background: 'rgba(16,185,129,.15)', padding: '2px 8px', borderRadius: 8 }}>
                            ✓ Friend
                          </span>
                        ) : (
                          <span style={{ fontSize: 10, color: '#f87171', fontWeight: 700, background: 'rgba(239,68,68,.12)', padding: '2px 8px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                            <span>🔒</span> Private
                          </span>
                        )}
                        <span style={{ fontSize: 11, color: '#38bdf8' }}>➔</span>
                      </div>
                      {targetUser.bio && (
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>{targetUser.bio}</div>
                      )}
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>
                        {isAlreadyFriend ? (
                          <>Favorite Genres: {(targetUser.favoriteGenres || []).map(id => GN[id]).filter(Boolean).join(' · ') || 'Cinema Enthusiast'}</>
                        ) : (
                          <>🔒 Private Cinephile Profile · Add friend to unlock details & chat</>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => navigate('profile', targetUser)}
                      style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 8, padding: '7px 11px', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                      title="View Public Profile"
                    >
                      <span>👤</span> Profile
                    </button>
                    {isAlreadyFriend ? (
                      <>
                        <span style={{ fontSize: 11, color: '#10b981', fontWeight: 700, background: 'rgba(16,185,129,.15)', padding: '4px 10px', borderRadius: 6 }}>
                          ✓ Cine-Friends
                        </span>
                        <button
                          onClick={() => openChatWithFriend(targetUser)}
                          style={{ background: '#e50914', border: 'none', borderRadius: 8, padding: '7px 14px', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                        >
                          💬 Chat
                        </button>
                        <button
                          onClick={() => handleUnfriendFriend(targetUser)}
                          style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 8, padding: '7px 10px', color: '#f87171', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                          title="Unfriend"
                        >
                          ✕
                        </button>
                      </>
                    ) : outgoingReq || status === 'sent' ? (
                      <>
                        <span style={{ fontSize: 11, color: '#fbbf24', fontWeight: 700, background: 'rgba(251,191,36,.12)', padding: '4px 10px', borderRadius: 6 }}>
                          ⏳ Request Pending
                        </span>
                        {outgoingReq && (
                          <button
                            onClick={() => handleCancelRequest(outgoingReq.id, targetId)}
                            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,.15)', color: 'rgba(255,255,255,.6)', borderRadius: 8, padding: '6px 12px', fontSize: 11, cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                        )}
                      </>
                    ) : incomingReq ? (
                      <>
                        <button
                          onClick={() => handleRespondRequest(incomingReq.id, 'accept')}
                          style={{ background: '#10b981', border: 'none', borderRadius: 8, padding: '7px 14px', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                        >
                          ✓ Accept Request
                        </button>
                        <button
                          onClick={() => handleRespondRequest(incomingReq.id, 'decline')}
                          style={{ background: 'rgba(255,255,255,.08)', border: 'none', borderRadius: 8, padding: '7px 12px', color: 'rgba(255,255,255,.6)', fontSize: 12, cursor: 'pointer' }}
                        >
                          Decline
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleSendFriendRequest(targetUser)}
                          disabled={status === 'sending'}
                          style={{
                            background: '#e50914', border: 'none', borderRadius: 8, padding: '8px 16px',
                            color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .2s'
                          }}
                        >
                          {status === 'sending' ? 'Sending...' : '+ Add Friend'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── TAB 3: FRIEND REQUESTS (INCOMING & OUTGOING) ────────────────── */}
      {activeTab === 'requests' && (
        <div className="fu d2" style={{ maxWidth: 740, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Section A: Incoming Requests */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 18 }}>📥</span>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>
                Incoming Friend Requests ({incomingRequests.length})
              </h3>
            </div>

            {incomingRequests.length === 0 ? (
              <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, padding: 24, textAlign: 'center', color: 'rgba(255,255,255,.4)', fontSize: 12 }}>
                No incoming friend requests at this time.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {incomingRequests.map(req => {
                  const reqUser = req.user || req.fromUser || {}
                  return (
                    <div
                      key={req.id || req._id}
                      style={{
                        background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)',
                        borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12
                      }}
                    >
                      <div
                        onClick={() => navigate('profile', reqUser)}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                        title={`View @${reqUser.username}'s public profile`}
                      >
                        <span style={{ fontSize: 28 }}>{reqUser.avatar || '🍿'}</span>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>{reqUser.displayName || reqUser.name}</span>
                            <span style={{ fontSize: 10, color: '#38bdf8' }}>➔</span>
                          </div>
                          <div style={{ fontSize: 11, color: '#e50914' }}>@{reqUser.username}</div>
                          {reqUser.bio && <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>{reqUser.bio}</div>}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button
                          onClick={() => navigate('profile', reqUser)}
                          style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 7, padding: '8px 12px', color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                          title="View Profile"
                        >
                          👤 Profile
                        </button>
                        <button
                          onClick={() => handleRespondRequest(req.id, 'accept')}
                          style={{ background: '#10b981', border: 'none', borderRadius: 7, padding: '8px 18px', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRespondRequest(req.id, 'decline')}
                          style={{ background: 'rgba(255,255,255,.08)', border: 'none', borderRadius: 7, padding: '8px 14px', color: 'rgba(255,255,255,.6)', fontSize: 12, cursor: 'pointer' }}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Section B: Sent Outgoing Requests */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 18 }}>📤</span>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>
                Sent Outgoing Requests ({outgoingRequests.length})
              </h3>
            </div>

            {outgoingRequests.length === 0 ? (
              <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, padding: 24, textAlign: 'center', color: 'rgba(255,255,255,.4)', fontSize: 12 }}>
                You have no pending sent requests.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {outgoingRequests.map(req => {
                  const reqUser = req.user || req.toUser || {}
                  return (
                    <div
                      key={req.id || req._id}
                      style={{
                        background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)',
                        borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12
                      }}
                    >
                      <div
                        onClick={() => navigate('profile', reqUser)}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                        title={`View @${reqUser.username}'s public profile`}
                      >
                        <span style={{ fontSize: 28 }}>{reqUser.avatar || '🍿'}</span>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>{reqUser.displayName || reqUser.name}</span>
                            <span style={{ fontSize: 10, color: '#38bdf8' }}>➔</span>
                          </div>
                          <div style={{ fontSize: 11, color: '#e50914' }}>@{reqUser.username}</div>
                          <div style={{ fontSize: 10, color: '#fbbf24', marginTop: 3 }}>⏳ Waiting for them to accept</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button
                          onClick={() => navigate('profile', reqUser)}
                          style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 7, padding: '7px 11px', color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                          title="View Profile"
                        >
                          👤 Profile
                        </button>
                        <button
                          onClick={() => handleCancelRequest(req.id, req.toUserId)}
                          style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 7, padding: '7px 12px', color: '#ff6b6b', fontSize: 11, cursor: 'pointer' }}
                        >
                          Cancel Request
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
