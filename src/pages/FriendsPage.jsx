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
  }, [myId])

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

  return (
    <div style={{ minHeight: '100vh', padding: '88px 24px 64px', maxWidth: 1400, margin: '0 auto', fontFamily: "'DM Sans', sans-serif" }}>
      {/* ── USER PROFILE HERO BAR ───────────────────────────────────────── */}
      <div className="fu" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, padding: '18px 24px', marginBottom: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(229,9,20,.15)', border: '2px solid rgba(229,9,20,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, boxShadow: '0 0 16px rgba(229,9,20,.2)' }}>
            {user?.avatar || '🎬'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: 19, fontWeight: 700, color: 'white', margin: 0 }}>
                {user?.displayName || user?.name}
              </h2>
              <span style={{ fontSize: 12, color: '#e50914', fontWeight: 700, background: 'rgba(229,9,20,.12)', padding: '2px 8px', borderRadius: 6 }}>
                @{user?.username}
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 3 }}>
              CineID: <code style={{ color: '#10b981', fontFamily: 'monospace' }}>{myId}</code> · {friends.length} Cine-Friends · {outgoingRequests.length} Pending Outgoing · {watchlist.length} Saved in Watchlist
            </div>
          </div>
        </div>

        {/* Quick jump to Messages */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => navigate('messages')}
            style={{ background: '#e50914', border: 'none', borderRadius: 8, padding: '9px 18px', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 16px rgba(229,9,20,0.3)' }}
          >
            <span>💬</span> Open Messages & Chat
          </button>
        </div>
      </div>

      {/* ── TOP NAV TABS ────────────────────────────────────────────────── */}
      <div className="fu d1" style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,.08)', marginBottom: 20, gap: 4 }}>
        {[
          { id: 'friends', label: '👥 My Cine-Circle', count: friends.length || null },
          { id: 'search', label: '🔍 Find Cinephiles', count: null },
          { id: 'requests', label: '📬 Friend Requests', count: incomingRequests.length > 0 ? incomingRequests.length : (outgoingRequests.length > 0 ? `${outgoingRequests.length} sent` : null) },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '11px 20px', background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13,
              color: activeTab === t.id ? 'white' : 'rgba(255,255,255,.45)',
              borderBottom: activeTab === t.id ? '2px solid #e50914' : '2px solid transparent',
              transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <span>{t.label}</span>
            {t.count !== null && (
              <span style={{ fontSize: 10, background: '#e50914', color: 'white', padding: '1px 7px', borderRadius: 10, fontWeight: 800 }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
              {friends.map(f => {
                const fId = f.id || f._id
                const isOnline = realtime?.presenceMap?.[fId] === 'online'

                return (
                  <div
                    key={fId}
                    style={{
                      background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)',
                      borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                      boxShadow: '0 4px 18px rgba(0,0,0,.4)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ position: 'relative' }}>
                            <span style={{ fontSize: 32 }}>{f.avatar || '🍿'}</span>
                            <span
                              style={{
                                position: 'absolute', bottom: -1, right: -1, width: 9, height: 9, borderRadius: '50%',
                                background: isOnline ? '#10b981' : '#6b7280',
                                border: '2px solid #090915'
                              }}
                              title={isOnline ? 'Online' : 'Offline'}
                            />
                          </div>
                          <div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>{f.displayName || f.name}</div>
                            <div style={{ fontSize: 12, color: '#e50914' }}>@{f.username}</div>
                          </div>
                        </div>

                        <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,.12)', padding: '3px 8px', borderRadius: 6 }}>
                          {f.tasteMatchScore || f.tasteCompatibility || 75}% Fit
                        </span>
                      </div>

                      {f.bio && (
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', lineHeight: 1.45, margin: '8px 0 12px' }}>
                          "{f.bio}"
                        </p>
                      )}

                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>
                        Status: <strong style={{ color: isOnline ? '#10b981' : 'rgba(255,255,255,.5)' }}>{isOnline ? '🟢 Active Online' : '⚪ Offline'}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                      <button
                        onClick={() => openChatWithFriend(f)}
                        style={{ flex: 1, background: '#e50914', border: 'none', borderRadius: 8, padding: '9px 0', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      >
                        <span>💬</span> Message
                      </button>
                      <button
                        onClick={() => launchConsensusWithFriend(f)}
                        style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8, padding: '9px 14px', color: 'white', fontSize: 12, cursor: 'pointer' }}
                        title="Start Couch Consensus"
                      >
                        <span>🛋️</span> Consensus
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

          {/* Quick Preload suggestions */}
          {!searchQuery && communityUsers.length > 0 && (
            <div style={{ marginBottom: 24, padding: '16px 20px', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', marginBottom: 10 }}>
                💡 Community Cinephiles to Connect with:
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {communityUsers.map(u => (
                  <button
                    key={u.id || u._id}
                    onClick={() => setSearchQuery(u.username)}
                    style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 20, padding: '5px 12px', color: '#e50914', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                  >
                    @{u.username}
                  </button>
                ))}
              </div>
            </div>
          )}

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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 32 }}>{targetUser.avatar || '🍿'}</span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>{targetUser.displayName || targetUser.name}</span>
                        <span style={{ fontSize: 12, color: '#e50914', fontWeight: 700 }}>@{targetUser.username}</span>
                      </div>
                      {targetUser.bio && (
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>{targetUser.bio}</div>
                      )}
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>
                        CineID: <code style={{ color: '#10b981' }}>{targetId}</code> · Favorite Genres: {(targetUser.favoriteGenres || []).map(id => GN[id]).filter(Boolean).join(', ') || 'Sci-Fi, Thriller'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                        <button
                          onClick={() => openChatWithFriend(targetUser)}
                          style={{ background: 'rgba(229,9,20,.15)', border: '1px solid rgba(229,9,20,.3)', color: '#e50914', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                        >
                          💬 Message
                        </button>
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
                          onClick={() => openChatWithFriend(targetUser)}
                          style={{ background: 'rgba(229,9,20,.15)', border: '1px solid rgba(229,9,20,.3)', color: '#e50914', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                        >
                          💬 Message
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
                        <button
                          onClick={() => openChatWithFriend(targetUser)}
                          style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8, padding: '7px 14px', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                        >
                          💬 Direct Message
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 28 }}>{reqUser.avatar || '🍿'}</span>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>{reqUser.displayName || reqUser.name}</div>
                          <div style={{ fontSize: 11, color: '#e50914' }}>@{reqUser.username}</div>
                          {reqUser.bio && <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>{reqUser.bio}</div>}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 28 }}>{reqUser.avatar || '🍿'}</span>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>{reqUser.displayName || reqUser.name}</div>
                          <div style={{ fontSize: 11, color: '#e50914' }}>@{reqUser.username}</div>
                          <div style={{ fontSize: 10, color: '#fbbf24', marginTop: 3 }}>⏳ Waiting for them to accept</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button
                          onClick={() => openChatWithFriend(reqUser)}
                          style={{ background: 'rgba(229,9,20,.12)', border: '1px solid rgba(229,9,20,.3)', color: '#e50914', borderRadius: 7, padding: '7px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                        >
                          💬 Send Message
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
