// src/pages/ProfilePage.jsx — Cinematic Redesign: Netflix-feel Hero + Clean Glass Profile
import { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useApp } from '@/context/AppContext'
import { GN, imgUrl, MOCK_MOVIES } from '@/data/constants'
import TasteEqualizer from '@/components/TasteEqualizer'
import Spinner from '@/components/Spinner'
import AppleSegmentedControl from '@/components/AppleSegmentedControl'

const CHART_COLORS = ['#e50914', '#d4a843', '#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b']

const tooltipStyle = {
  contentStyle: { background: '#0e0e1c', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8, color: 'white', fontSize: 11 },
  cursor: { fill: 'rgba(255,255,255,.03)' },
}

export default function ProfilePage() {
  const {
    user,
    viewingUser,
    setViewingUser,
    watchlist: myWatchlist,
    toggleWatchlist,
    navigate,
    goBack,
    previousPage,
    setEditProfileModalOpen,
    setAccountSettingsModalOpen,
    setActiveChatFriend,
    realtime
  } = useApp()

  const getBackLabel = () => {
    if (previousPage === 'search') return '← Search'
    if (previousPage === 'friends') return '← Friends'
    if (previousPage === 'messages') return '← Chat'
    if (previousPage === 'watchlist') return '← Watchlist'
    if (previousPage === 'landing') return '← Home'
    if (previousPage === 'own_profile' || previousPage === 'profile') return '← My Profile'
    return '← Back'
  }

  const handleBack = () => {
    setViewingUser(null)
    if (goBack) {
      goBack(previousPage || 'search')
    } else if (previousPage === 'own_profile') {
      navigate('profile')
    } else if (previousPage) {
      navigate(previousPage)
    } else {
      navigate('search')
    }
  }

  const myId = user?.id || user?._id
  const targetId = viewingUser
    ? (typeof viewingUser === 'object' ? (viewingUser.id || viewingUser._id) : String(viewingUser))
    : myId
  const isOwnProfile = !targetId || String(targetId) === String(myId)

  // State
  const [activeTab, setActiveTab] = useState('watchlist')
  const [friends, setFriends] = useState([])
  const [incomingRequests, setIncomingRequests] = useState([])
  const [loadingSocial, setLoadingSocial] = useState(false)
  const [otherProfile, setOtherProfile] = useState(null)
  const [loadingOther, setLoadingOther] = useState(!isOwnProfile)
  const [friendActionStatus, setFriendActionStatus] = useState('')

  // Load own profile social data
  useEffect(() => {
    if (!isOwnProfile || !myId) return
    const fetchMySocial = async () => {
      setLoadingSocial(true)
      try {
        const [fRes, rRes] = await Promise.all([
          fetch(`/api/social/friends?me=${encodeURIComponent(myId)}`).then(r => r.json()).catch(() => ({ friends: [] })),
          fetch(`/api/social/friend-requests?me=${encodeURIComponent(myId)}`).then(r => r.json()).catch(() => ({ requests: { incoming: [] } }))
        ])
        setFriends(fRes.friends || [])
        setIncomingRequests(rRes.requests?.incoming || [])
        const friendIds = (fRes.friends || []).map(f => f.id || f._id).filter(Boolean)
        if (friendIds.length > 0 && realtime?.refreshPresence) {
          realtime.refreshPresence(friendIds)
        }
      } catch (err) {
        console.warn('Error loading own social data:', err)
      } finally {
        setLoadingSocial(false)
      }
    }
    fetchMySocial()
  }, [isOwnProfile, myId, myWatchlist.length])

  // Load other user profile
  useEffect(() => {
    if (isOwnProfile || !targetId) {
      setOtherProfile(null)
      setLoadingOther(false)
      return
    }
    const fetchOtherProfile = async () => {
      setLoadingOther(true)
      try {
        const res = await fetch(`/api/social/profile/${encodeURIComponent(targetId)}?viewerId=${encodeURIComponent(myId || '')}`).then(r => r.json())
        if (res.profile) {
          setOtherProfile(res.profile)
          if (realtime?.refreshPresence) {
            realtime.refreshPresence([targetId])
          }
        }
      } catch (err) {
        console.error('Failed to load friend profile:', err)
      } finally {
        setLoadingOther(false)
      }
    }
    fetchOtherProfile()
  }, [isOwnProfile, targetId, myId, myWatchlist.length])

  const displayUser = isOwnProfile ? user : (otherProfile || (typeof viewingUser === 'object' ? viewingUser : {}))
  const displayWatchlist = isOwnProfile ? myWatchlist : (otherProfile?.watchlist || [])
  const isOnline = realtime?.presenceMap?.[targetId] === 'online'
  const isFriends = isOwnProfile || otherProfile?.friendshipStatus === 'friends'
  const isPrivate = !isOwnProfile && !isFriends

  const genreData = useMemo(() => {
    const c = {}
    displayWatchlist.forEach(m => (m.genre_ids || []).forEach(id => { c[id] = (c[id] || 0) + 1 }))
    return Object.entries(c)
      .map(([id, count]) => ({ name: GN[id] || '?', count }))
      .sort((a, b) => b.count - a.count).slice(0, 6)
  }, [displayWatchlist])

  const favoriteGenres = displayUser?.favoriteGenres || [878, 53]

  const handleMessageFriend = (friend) => {
    setActiveChatFriend(friend)
    navigate('messages')
  }
  const handleConsensusFriend = (friend) => {
    setActiveChatFriend(friend)
    navigate('consensus')
  }

  const handleSendFriendRequest = async () => {
    if (!myId || !targetId || friendActionStatus) return
    setFriendActionStatus('sending')
    try {
      const res = await fetch('/api/social/friend-request/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUserId: myId, toUserId: targetId })
      }).then(r => r.json())
      if (res.success || res.request) {
        setFriendActionStatus('sent')
        const newReqId = res.request?.id || res.request?._id || null
        setOtherProfile(prev => ({ ...prev, friendshipStatus: 'pending_outgoing', pendingRequestId: newReqId }))
      } else {
        alert(res.error || 'Failed to send friend request.')
      }
    } catch {
      setFriendActionStatus('')
    }
  }

  const handleCancelRequest = async () => {
    if (!myId || !targetId || friendActionStatus) return
    setFriendActionStatus('cancelling')
    try {
      let reqId = otherProfile?.pendingRequestId
      if (!reqId) {
        const rRes = await fetch(`/api/social/friend-requests?me=${encodeURIComponent(myId)}`).then(r => r.json())
        const outgoing = rRes.outgoing || []
        const match = outgoing.find(r => String(r.toUserId) === String(targetId) || String(r.user?.id) === String(targetId))
        reqId = match?.id || match?._id
      }
      if (reqId) {
        const res = await fetch('/api/social/friend-request/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requestId: reqId, userId: myId })
        }).then(r => r.json())
        if (res.success) {
          setOtherProfile(prev => ({ ...prev, friendshipStatus: 'none', pendingRequestId: null }))
        } else {
          alert(res.error || 'Failed to cancel friend request.')
        }
      }
    } catch (err) {
      console.error('Error cancelling friend request from profile:', err)
    } finally {
      setFriendActionStatus('')
    }
  }

  const handleRespondIncomingRequest = async (action) => {
    if (!myId || !otherProfile) return
    setFriendActionStatus('responding')
    try {
      let reqId = otherProfile.pendingRequestId
      if (!reqId) {
        const rRes = await fetch(`/api/social/friend-requests?me=${encodeURIComponent(myId)}`).then(r => r.json())
        const incoming = rRes.incoming || []
        const match = incoming.find(r => String(r.fromUserId) === String(targetId) || String(r.user?.id) === String(targetId))
        reqId = match?.id || match?._id
      }
      if (reqId) {
        const res = await fetch('/api/social/friend-request/respond', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requestId: reqId, action, userId: myId })
        }).then(r => r.json())
        if (res.success) {
          if (action === 'accept') {
            try {
              const pRes = await fetch(`/api/social/profile/${encodeURIComponent(targetId)}?viewerId=${encodeURIComponent(myId)}`).then(r => r.json())
              if (pRes.profile) setOtherProfile(pRes.profile)
              else setOtherProfile(prev => ({ ...prev, friendshipStatus: 'friends', isPrivate: false, friendsCount: (prev.friendsCount || 0) + 1 }))
            } catch {
              setOtherProfile(prev => ({ ...prev, friendshipStatus: 'friends', isPrivate: false, friendsCount: (prev.friendsCount || 0) + 1 }))
            }
          } else {
            setOtherProfile(prev => ({ ...prev, friendshipStatus: 'none', pendingRequestId: null }))
          }
        } else {
          alert(res.error || 'Failed to respond to request.')
        }
      } else {
        alert('Could not find friend request ID.')
      }
    } catch (err) {
      console.error('Error responding to friend request from profile:', err)
    } finally {
      setFriendActionStatus('')
    }
  }

  const handleUnfriend = async () => {
    if (!myId || !targetId) return
    const friendName = displayUser?.displayName || displayUser?.name || `@${displayUser?.username || 'user'}`
    if (!window.confirm(`Unfriend ${friendName}? You won't be able to chat until you reconnect.`)) return
    setFriendActionStatus('unfriending')
    try {
      const res = await fetch('/api/social/friend/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: myId, friendId: targetId })
      }).then(r => r.json())
      if (res.success) {
        setOtherProfile(prev => ({ ...prev, friendshipStatus: 'none', friendsCount: Math.max(0, (prev.friendsCount || 1) - 1) }))
      } else {
        alert(res.error || 'Could not unfriend.')
      }
    } catch (err) {
      console.error('Error unfriending:', err)
    } finally {
      setFriendActionStatus('')
    }
  }

  if (!isOwnProfile && loadingOther) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <Spinner size={36} />
        <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 13 }}>Loading profile...</div>
      </div>
    )
  }

  const tasteMatch = otherProfile?.tasteCompatibility ?? otherProfile?.tasteMatchScore ?? 0
  const displayName = displayUser?.displayName || displayUser?.name || 'Cinephile'
  const username = displayUser?.username || 'user'

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── CINEMATIC HERO BANNER ───────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        minHeight: 340,
        background: isOwnProfile
          ? 'linear-gradient(135deg, rgba(229,9,20,.25) 0%, rgba(9,9,16,1) 55%, rgba(139,92,246,.1) 100%)'
          : 'linear-gradient(135deg, rgba(14,165,233,.2) 0%, rgba(9,9,16,1) 55%, rgba(229,9,20,.08) 100%)',
        overflow: 'hidden',
        paddingBottom: 0,
      }}>
        {/* Ambient Glow Orbs */}
        <div style={{
          position: 'absolute', top: -60, left: -60, width: 320, height: 320, borderRadius: '50%',
          background: isOwnProfile ? 'rgba(229,9,20,.18)' : 'rgba(14,165,233,.15)',
          filter: 'blur(80px)', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', top: 20, right: -40, width: 240, height: 240, borderRadius: '50%',
          background: 'rgba(139,92,246,.12)', filter: 'blur(70px)', pointerEvents: 'none'
        }} />

        {/* Back Button (only on other profiles) */}
        {!isOwnProfile && (
          <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
            <button
              onClick={handleBack}
              style={{
                background: 'rgba(0,0,0,.5)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,.2)',
                borderRadius: 100,
                padding: '8px 18px',
                color: 'rgba(255,255,255,.9)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all .2s'
              }}
            >
              {getBackLabel()}
            </button>
          </div>
        )}

        {/* Private Badge */}
        {isPrivate && (
          <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
            <span style={{
              background: 'rgba(239,68,68,.15)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(239,68,68,.35)', color: '#f87171',
              borderRadius: 100, padding: '6px 14px', fontSize: 12, fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', gap: 6
            }}>
              🔒 Private Profile
            </span>
          </div>
        )}

        {/* Hero Content */}
        <div style={{
          position: 'relative', zIndex: 5,
          padding: !isOwnProfile ? '28px 28px 36px' : '16px 28px 36px',
          maxWidth: 1200, margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>

            {/* Avatar */}
            <div className="fu" style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 100, height: 100, borderRadius: 24,
                background: isOwnProfile ? 'rgba(229,9,20,.2)' : 'rgba(14,165,233,.2)',
                border: isOwnProfile ? '2.5px solid rgba(229,9,20,.5)' : '2.5px solid rgba(14,165,233,.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 52, boxShadow: '0 12px 40px rgba(0,0,0,.6)'
              }}>
                {displayUser?.avatar || '🎬'}
              </div>
              <span style={{
                position: 'absolute', bottom: 4, right: 4,
                width: 16, height: 16, borderRadius: '50%',
                background: isOnline ? '#10b981' : '#6b7280',
                border: '3px solid #090910',
                boxShadow: isOnline ? '0 0 8px rgba(16,185,129,.6)' : 'none'
              }} title={isOnline ? 'Online' : 'Offline'} />
            </div>

            {/* Name & Info */}
            <div className="fu d1" style={{ flex: 1, minWidth: 0, paddingBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                <h1 style={{
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: 'clamp(36px, 6vw, 60px)',
                  color: 'white',
                  letterSpacing: 2,
                  margin: 0,
                  lineHeight: 1,
                  textShadow: '0 4px 24px rgba(0,0,0,.6)'
                }}>
                  {displayName}
                </h1>
                {/* Online badge */}
                <span style={{
                  background: isOnline ? 'rgba(16,185,129,.15)' : 'rgba(255,255,255,.07)',
                  border: `1px solid ${isOnline ? 'rgba(16,185,129,.5)' : 'rgba(255,255,255,.15)'}`,
                  color: isOnline ? '#10b981' : 'rgba(255,255,255,.4)',
                  borderRadius: 100, padding: '3px 10px', fontSize: 11, fontWeight: 700
                }}>
                  {isOnline ? '● Online' : '○ Offline'}
                </span>
              </div>

              {/* Username */}
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', fontWeight: 500, marginBottom: 8 }}>
                @{username}
              </div>

              {/* Bio */}
              {(displayUser?.bio || true) && (
                <p style={{
                  color: 'rgba(255,255,255,.65)', fontSize: 14,
                  fontStyle: 'italic', lineHeight: 1.5, margin: '0 0 16px',
                  maxWidth: 520
                }}>
                  "{displayUser?.bio || 'Film enthusiast & cinematic explorer.'}"
                </p>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {isOwnProfile ? (
                  <>
                    <button
                      onClick={() => setEditProfileModalOpen(true)}
                      className="lg-btn"
                      style={{ padding: '9px 18px', fontSize: 13 }}
                    >
                      ✏️ Edit Profile
                    </button>
                    <button
                      onClick={() => setAccountSettingsModalOpen(true)}
                      className="lg-btn"
                      style={{ padding: '9px 18px', fontSize: 13 }}
                    >
                      ⚙️ Settings
                    </button>
                    <button
                      onClick={() => navigate('friends')}
                      className="lg-btn"
                      style={{ padding: '9px 18px', fontSize: 13, background: 'rgba(229,9,20,.15)', borderColor: 'rgba(229,9,20,.4)', color: '#ff6b6b' }}
                    >
                      👥 Find Friends
                    </button>
                  </>
                ) : (
                  <>
                    {otherProfile?.friendshipStatus === 'friends' ? (
                      <>
                        <button
                          onClick={() => handleMessageFriend(displayUser)}
                          style={{
                            background: 'linear-gradient(135deg, #e50914, #b20710)',
                            border: 'none', borderRadius: 12, padding: '10px 20px',
                            color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 6,
                            boxShadow: '0 4px 20px rgba(229,9,20,.4)'
                          }}
                        >
                          💬 Message
                        </button>
                        <button
                          onClick={() => handleConsensusFriend(displayUser)}
                          className="lg-btn"
                          style={{ padding: '10px 16px', fontSize: 13 }}
                        >
                          🛋️ Consensus
                        </button>
                        <span style={{
                          background: 'rgba(16,185,129,.15)', border: '1px solid rgba(16,185,129,.4)',
                          color: '#10b981', borderRadius: 12, padding: '10px 14px', fontSize: 13, fontWeight: 700,
                          display: 'flex', alignItems: 'center', gap: 5
                        }}>
                          ✓ Friends
                        </span>
                        <button
                          onClick={handleUnfriend}
                          disabled={friendActionStatus === 'unfriending'}
                          className="lg-btn"
                          style={{ padding: '10px 14px', fontSize: 13, color: '#f87171', borderColor: 'rgba(239,68,68,.3)' }}
                          title="Unfriend"
                        >
                          {friendActionStatus === 'unfriending' ? '...' : '✕'}
                        </button>
                      </>
                    ) : otherProfile?.friendshipStatus === 'pending_incoming' ? (
                      <>
                        <span style={{
                          background: 'rgba(56,189,248,.12)', border: '1px solid rgba(56,189,248,.3)',
                          color: '#38bdf8', borderRadius: 12, padding: '10px 14px', fontSize: 13, fontWeight: 700,
                          display: 'flex', alignItems: 'center', gap: 6
                        }}>
                          📬 Sent you a request!
                        </span>
                        <button
                          onClick={() => handleRespondIncomingRequest('accept')}
                          disabled={friendActionStatus === 'responding'}
                          style={{
                            background: '#10b981', border: 'none', borderRadius: 12, padding: '10px 20px',
                            color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer'
                          }}
                        >
                          ✓ {friendActionStatus === 'responding' ? 'Accepting...' : 'Accept'}
                        </button>
                        <button
                          onClick={() => handleRespondIncomingRequest('decline')}
                          disabled={friendActionStatus === 'responding'}
                          className="lg-btn"
                          style={{ padding: '10px 14px', fontSize: 13 }}
                        >
                          Decline
                        </button>
                      </>
                    ) : otherProfile?.friendshipStatus === 'pending_outgoing' || friendActionStatus === 'sent' ? (
                      <>
                        <span style={{
                          background: 'rgba(251,191,36,.12)', border: '1px solid rgba(251,191,36,.35)',
                          color: '#fbbf24', borderRadius: 12, padding: '10px 14px', fontSize: 13, fontWeight: 700,
                          display: 'flex', alignItems: 'center', gap: 5
                        }}>
                          ⏳ Request Pending
                        </span>
                        <button
                          onClick={handleCancelRequest}
                          disabled={friendActionStatus === 'cancelling'}
                          className="lg-btn"
                          style={{ padding: '10px 14px', fontSize: 13 }}
                        >
                          {friendActionStatus === 'cancelling' ? 'Cancelling...' : 'Cancel'}
                        </button>
                      </>
                    ) : (
                      <>
                        <span style={{
                          background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)',
                          color: '#f87171', borderRadius: 12, padding: '10px 14px', fontSize: 13, fontWeight: 700,
                          display: 'flex', alignItems: 'center', gap: 5
                        }}>
                          🔒 Chat Locked
                        </span>
                        <button
                          onClick={handleSendFriendRequest}
                          disabled={friendActionStatus === 'sending'}
                          style={{
                            background: 'linear-gradient(135deg, #e50914, #b20710)',
                            border: 'none', borderRadius: 12, padding: '10px 22px',
                            color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 6,
                            boxShadow: '0 4px 20px rgba(229,9,20,.4)'
                          }}
                        >
                          👥 {friendActionStatus === 'sending' ? 'Sending...' : '+ Add Friend'}
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
          background: 'linear-gradient(to bottom, transparent, #090910)',
          pointerEvents: 'none'
        }} />
      </div>

      {/* ── CONTENT AREA ─────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 140px' }}>

        {/* ── STATS PILLS ROW ───────────────────────────────────────────────── */}
        <div className="fu d1" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28, marginTop: -10 }}>
          {/* Friends */}
          <div style={{
            background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)',
            borderRadius: 100, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8
          }}>
            <span style={{ fontSize: 16 }}>👥</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#10b981', lineHeight: 1 }}>
                {isOwnProfile ? (loadingSocial ? '...' : friends.length) : (otherProfile?.friendsCount ?? 0)}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Friends</div>
            </div>
            {isOwnProfile && incomingRequests.length > 0 && (
              <span style={{ background: '#e50914', color: 'white', borderRadius: 10, fontSize: 9, fontWeight: 800, padding: '2px 6px' }}>
                +{incomingRequests.length}
              </span>
            )}
          </div>

          {/* Movies */}
          <div style={{
            background: 'rgba(229,9,20,.1)', border: '1px solid rgba(229,9,20,.25)',
            borderRadius: 100, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8
          }}>
            <span style={{ fontSize: 16 }}>🎬</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#e50914', lineHeight: 1 }}>
                {isOwnProfile ? myWatchlist.length : (otherProfile?.watchlistCount ?? displayWatchlist.length)}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Movies</div>
            </div>
          </div>

          {/* Top Genre */}
          {genreData.length > 0 && (
            <div style={{
              background: 'rgba(14,165,233,.1)', border: '1px solid rgba(14,165,233,.25)',
              borderRadius: 100, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8
            }}>
              <span style={{ fontSize: 16 }}>🎭</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#38bdf8', lineHeight: 1 }}>
                  {genreData[0]?.name}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Top Genre</div>
              </div>
            </div>
          )}

          {/* Taste Match (only for friends viewing other profiles) */}
          {!isOwnProfile && isFriends && tasteMatch > 0 && (
            <div style={{
              background: 'rgba(139,92,246,.12)', border: '1px solid rgba(139,92,246,.3)',
              borderRadius: 100, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8
            }}>
              <span style={{ fontSize: 16 }}>⚡</span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#a78bfa', lineHeight: 1 }}>
                  {tasteMatch}%
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Taste Match</div>
              </div>
            </div>
          )}
        </div>

        {/* ── PRIVATE GATE ──────────────────────────────────────────────────── */}
        {isPrivate ? (
          <div className="fu d2 glass" style={{
            borderRadius: 24, padding: '52px 32px',
            textAlign: 'center',
            background: 'radial-gradient(circle at 50% 0%, rgba(229,9,20,.1) 0%, rgba(14,14,28,.8) 70%)',
            border: '1px solid rgba(255,255,255,.09)',
            maxWidth: 760, margin: '0 auto'
          }}>
            {/* Lock Icon */}
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 34, margin: '0 auto 20px',
              boxShadow: '0 0 28px rgba(229,9,20,.2)'
            }}>
              🔒
            </div>

            <h2 style={{
              fontFamily: "'Bebas Neue', cursive", fontSize: 36,
              color: 'white', letterSpacing: 1, margin: '0 0 10px'
            }}>
              Private Profile
            </h2>

            <p style={{
              color: 'rgba(255,255,255,.6)', fontSize: 14,
              maxWidth: 460, margin: '0 auto 28px', lineHeight: 1.6
            }}>
              {displayName}'s watchlist, taste analysis, and chat are all private.
              Add them as a friend to unlock everything!
            </p>

            {/* CTA */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 36 }}>
              {otherProfile?.friendshipStatus === 'pending_incoming' ? (
                <>
                  <button
                    onClick={() => handleRespondIncomingRequest('accept')}
                    disabled={friendActionStatus === 'responding'}
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      border: 'none', borderRadius: 12, padding: '13px 28px',
                      color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                      boxShadow: '0 6px 20px rgba(16,185,129,.4)'
                    }}
                  >
                    ✓ {friendActionStatus === 'responding' ? 'Accepting...' : 'Accept & Unlock Profile'}
                  </button>
                  <button
                    onClick={() => handleRespondIncomingRequest('decline')}
                    disabled={friendActionStatus === 'responding'}
                    className="lg-btn"
                    style={{ padding: '13px 20px', fontSize: 14 }}
                  >
                    Decline
                  </button>
                </>
              ) : (otherProfile?.friendshipStatus === 'pending_outgoing' || friendActionStatus === 'sent') ? (
                <>
                  <span style={{
                    background: 'rgba(251,191,36,.12)', border: '1px solid rgba(251,191,36,.35)',
                    color: '#fbbf24', borderRadius: 12, padding: '13px 24px',
                    fontSize: 14, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8
                  }}>
                    ⏳ Request Sent — Waiting for @{username}
                  </span>
                  <button
                    onClick={handleCancelRequest}
                    disabled={friendActionStatus === 'cancelling'}
                    className="lg-btn"
                    style={{ padding: '13px 18px', fontSize: 14 }}
                  >
                    {friendActionStatus === 'cancelling' ? 'Cancelling...' : 'Cancel Request'}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSendFriendRequest}
                  disabled={friendActionStatus === 'sending'}
                  style={{
                    background: 'linear-gradient(135deg, #e50914, #b20710)',
                    border: 'none', borderRadius: 12, padding: '14px 32px',
                    color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                    boxShadow: '0 8px 28px rgba(229,9,20,.45)'
                  }}
                >
                  <span>👥</span>
                  <span>{friendActionStatus === 'sending' ? 'Sending...' : 'Send Friend Request'}</span>
                </button>
              )}
            </div>

            {/* What Unlocks */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', paddingTop: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
                Unlocks when you become friends
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
                {[
                  { icon: '🎬', label: 'Watchlist' },
                  { icon: '🎚️', label: 'Taste Match' },
                  { icon: '📊', label: 'Genre Stats' },
                  { icon: '💬', label: 'Direct Chat' },
                ].map(item => (
                  <div key={item.label} style={{
                    background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
                    borderRadius: 12, padding: '14px 12px', textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.7)' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* ── APPLE SEGMENTED CONTROL TABS ──────────────────────────────── */}
            <div className="fu d2" style={{ marginBottom: 24 }}>
              <AppleSegmentedControl
                fullWidth
                size="md"
                options={[
                  { id: 'watchlist', label: '🎬 Watchlist', badge: isOwnProfile ? myWatchlist.length : (otherProfile?.watchlistCount ?? displayWatchlist.length) },
                  { id: 'taste', label: '🎚️ Taste Profile' },
                  ...(isOwnProfile ? [{ id: 'friends', label: '👥 Friends', badge: friends.length }] : []),
                ]}
                value={activeTab}
                onChange={setActiveTab}
              />
            </div>

            {/* ── TAB: WATCHLIST ────────────────────────────────────────────── */}
            {activeTab === 'watchlist' && (
              <div className="fu">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                  <h2 style={{
                    fontFamily: "'Bebas Neue', cursive", fontSize: 28,
                    color: 'white', margin: 0, letterSpacing: 0.5
                  }}>
                    {isOwnProfile ? 'My Watchlist' : `${displayName}'s Watchlist`}
                  </h2>
                  {isOwnProfile && (
                    <button
                      onClick={() => navigate('watchlist')}
                      className="lg-btn"
                      style={{ fontSize: 12, padding: '8px 16px' }}
                    >
                      Open Full Page ➔
                    </button>
                  )}
                </div>

                {displayWatchlist.length === 0 ? (
                  <div className="glass" style={{ padding: 48, textAlign: 'center', borderRadius: 18 }}>
                    <div style={{ fontSize: 44, marginBottom: 12 }}>🎬</div>
                    <h3 style={{ color: 'white', margin: '0 0 8px', fontSize: 18 }}>No movies saved yet</h3>
                    <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 13, maxWidth: 340, margin: '0 auto 20px' }}>
                      {isOwnProfile
                        ? 'Start exploring movies and save your favorites!'
                        : `${displayName} hasn't added any movies yet.`}
                    </p>
                    {isOwnProfile && (
                      <button
                        onClick={() => navigate('landing')}
                        style={{
                          background: '#e50914', border: 'none', borderRadius: 10,
                          padding: '10px 22px', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        Browse Movies
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
                    {displayWatchlist.map(movie => {
                      const isInMyWl = myWatchlist.some(m => m.id === movie.id)
                      return (
                        <div
                          key={movie.id}
                          className="mc"
                          style={{
                            borderRadius: 12, overflow: 'hidden',
                            background: 'rgba(255,255,255,.04)',
                            border: '1px solid rgba(255,255,255,.08)'
                          }}
                        >
                          <div style={{ position: 'relative' }}>
                            <img
                              src={imgUrl(movie.poster_path, 'w342')}
                              alt={movie.title}
                              style={{ width: '100%', height: 230, objectFit: 'cover', display: 'block' }}
                              onError={e => { e.target.style.display = 'none' }}
                            />
                            {isOwnProfile && (
                              <button
                                onClick={() => toggleWatchlist(movie)}
                                style={{
                                  position: 'absolute', top: 7, right: 7, width: 26, height: 26,
                                  borderRadius: '50%', background: 'rgba(0,0,0,.7)',
                                  border: '1px solid rgba(255,255,255,.2)',
                                  color: '#f87171', fontSize: 12, cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                                title="Remove"
                              >✕</button>
                            )}
                            <div style={{
                              position: 'absolute', bottom: 7, left: 7,
                              background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(8px)',
                              padding: '2px 7px', borderRadius: 6,
                              fontSize: 10, fontWeight: 700, color: '#d4a843'
                            }}>
                              ⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : '—'}
                            </div>
                          </div>
                          <div style={{ padding: '10px 10px 12px' }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
                              {movie.title}
                            </div>
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginBottom: 8 }}>
                              {movie.release_date?.split('-')[0] || '—'}
                            </div>
                            <div style={{ display: 'flex', gap: 5 }}>
                              {!isOwnProfile && (
                                <button
                                  onClick={() => toggleWatchlist(movie)}
                                  style={{
                                    flex: 1,
                                    background: isInMyWl ? 'rgba(16,185,129,.15)' : 'rgba(255,255,255,.08)',
                                    border: isInMyWl ? '1px solid rgba(16,185,129,.4)' : '1px solid rgba(255,255,255,.12)',
                                    borderRadius: 6, padding: '5px 0',
                                    color: isInMyWl ? '#10b981' : 'white',
                                    fontSize: 10, fontWeight: 700, cursor: 'pointer'
                                  }}
                                >
                                  {isInMyWl ? '✓ Saved' : '+ Save'}
                                </button>
                              )}
                              <button
                                onClick={() => navigate('movie', movie.id)}
                                style={{
                                  flex: 1, background: '#e50914', border: 'none',
                                  borderRadius: 6, padding: '5px 0',
                                  color: 'white', fontSize: 10, fontWeight: 700, cursor: 'pointer'
                                }}
                              >
                                Details
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: TASTE ────────────────────────────────────────────────── */}
            {activeTab === 'taste' && (
              <div className="fu" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Taste Equalizer */}
                {isOwnProfile ? (
                  <TasteEqualizer />
                ) : (
                  <div className="glass" style={{ borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                      <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: 'white', margin: 0, letterSpacing: 0.5 }}>
                        {displayName}'s Taste Profile
                      </h3>
                      {tasteMatch > 0 && (
                        <span style={{
                          background: 'rgba(139,92,246,.15)', border: '1px solid rgba(139,92,246,.35)',
                          color: '#a78bfa', borderRadius: 10, padding: '4px 12px', fontSize: 12, fontWeight: 700
                        }}>
                          ⚡ {tasteMatch}% Match With You
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                      {Object.entries(otherProfile?.preferences?.tasteSliders || { pacing: 50, darkness: 50, intensity: 50, intellect: 50, nostalgia: 50 }).map(([key, val]) => (
                        <div key={key} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, padding: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'white', fontWeight: 600, textTransform: 'capitalize', marginBottom: 7 }}>
                            <span>{key}</span>
                            <span style={{ color: '#e50914' }}>{val}%</span>
                          </div>
                          <div style={{ width: '100%', height: 5, background: 'rgba(255,255,255,.08)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${val}%`, height: '100%', background: 'linear-gradient(90deg, #e50914, #8b5cf6)', borderRadius: 3 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Genre Chart */}
                {genreData.length > 0 && (
                  <div className="glass" style={{ borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,.08)' }}>
                    <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: 'white', margin: '0 0 18px', letterSpacing: 0.5 }}>
                      Genre Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={genreData} margin={{ top: 0, right: 10, bottom: 0, left: -22 }}>
                        <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'rgba(255,255,255,.4)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip {...tooltipStyle} />
                        <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                          {genreData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Favorite Genres */}
                <div className="glass" style={{ borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,.08)' }}>
                  <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: 'white', margin: '0 0 14px', letterSpacing: 0.5 }}>
                    Favorite Genres
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: !isOwnProfile ? 16 : 0 }}>
                    {favoriteGenres.map(gid => (
                      <span key={gid} style={{
                        background: 'rgba(229,9,20,.12)', border: '1px solid rgba(229,9,20,.3)',
                        borderRadius: 100, padding: '6px 14px', fontSize: 12, fontWeight: 600, color: '#ff6b6b'
                      }}>
                        {GN[gid] || `Genre ${gid}`}
                      </span>
                    ))}
                  </div>
                  {!isOwnProfile && (
                    <button
                      onClick={() => handleConsensusFriend(displayUser)}
                      style={{
                        background: 'rgba(229,9,20,.12)', border: '1px solid rgba(229,9,20,.3)',
                        borderRadius: 10, padding: '10px 18px', color: '#ff6b6b',
                        fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6
                      }}
                    >
                      🛋️ Launch Couch Consensus with {displayName.split(' ')[0]}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── TAB: FRIENDS (Own Profile Only) ──────────────────────────── */}
            {activeTab === 'friends' && isOwnProfile && (
              <div className="fu">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                  <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: 'white', margin: 0 }}>
                    My Friends ({friends.length})
                  </h2>
                  <button
                    onClick={() => navigate('friends')}
                    style={{
                      background: '#e50914', border: 'none', borderRadius: 10,
                      padding: '8px 16px', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    + Find Friends
                  </button>
                </div>

                {loadingSocial ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner size={32} /></div>
                ) : friends.length === 0 ? (
                  <div className="glass" style={{ padding: 48, textAlign: 'center', borderRadius: 18 }}>
                    <div style={{ fontSize: 44, marginBottom: 12 }}>👥</div>
                    <h3 style={{ color: 'white', margin: '0 0 8px', fontSize: 18 }}>No friends yet</h3>
                    <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 13, margin: '0 auto 20px', maxWidth: 360 }}>
                      Connect with cinephiles to chat, share picks, and run Couch Consensus!
                    </p>
                    <button
                      onClick={() => navigate('friends')}
                      style={{
                        background: '#e50914', border: 'none', borderRadius: 10,
                        padding: '10px 22px', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      Explore Cinephiles
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
                    {friends.map(friend => {
                      const fId = friend.id || friend._id
                      const isFriendOnline = realtime?.presenceMap?.[fId] === 'online'
                      const matchScore = friend.tasteMatchScore ?? friend.tasteCompatibility ?? 0
                      return (
                        <div
                          key={fId}
                          className="glass ch"
                          style={{ borderRadius: 14, padding: 16, border: '1px solid rgba(255,255,255,.08)' }}
                        >
                          <div
                            onClick={() => { setViewingUser(friend); navigate('profile', friend) }}
                            style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: 12 }}
                          >
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                              <div style={{ fontSize: 36 }}>{friend.avatar || '🍿'}</div>
                              <span style={{
                                position: 'absolute', bottom: -1, right: -1,
                                width: 10, height: 10, borderRadius: '50%',
                                background: isFriendOnline ? '#10b981' : '#6b7280',
                                border: '2px solid #090910'
                              }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 15, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {friend.displayName || friend.name}
                              </div>
                              <div style={{ fontSize: 12, color: '#e50914', fontWeight: 600 }}>
                                @{friend.username}
                              </div>
                              <div style={{ fontSize: 10, color: isFriendOnline ? '#10b981' : 'rgba(255,255,255,.35)', marginTop: 1 }}>
                                {isFriendOnline ? '● Online Now' : '○ Offline'}
                              </div>
                            </div>
                            {matchScore > 0 && (
                              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div style={{ fontSize: 15, fontWeight: 800, color: '#a78bfa' }}>{matchScore}%</div>
                                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase' }}>Match</div>
                              </div>
                            )}
                          </div>

                          {friend.bio && (
                            <div style={{
                              fontSize: 11, color: 'rgba(255,255,255,.5)', fontStyle: 'italic',
                              background: 'rgba(255,255,255,.03)', padding: '6px 10px',
                              borderRadius: 7, marginBottom: 10, lineHeight: 1.4
                            }}>
                              "{friend.bio}"
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: 7, borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 10 }}>
                            <button
                              onClick={() => { setViewingUser(friend); navigate('profile', friend) }}
                              className="lg-btn"
                              style={{ flex: 1, fontSize: 11, padding: '7px 0', justifyContent: 'center' }}
                            >
                              👤 Profile
                            </button>
                            <button
                              onClick={() => handleMessageFriend(friend)}
                              style={{
                                flex: 1, background: 'rgba(229,9,20,.12)', border: '1px solid rgba(229,9,20,.25)',
                                borderRadius: 8, padding: '7px 0', color: '#ff6b6b',
                                fontSize: 11, fontWeight: 700, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
                              }}
                            >
                              💬 Chat
                            </button>
                            <button
                              onClick={() => handleConsensusFriend(friend)}
                              className="lg-btn"
                              style={{ flex: 1, fontSize: 11, padding: '7px 0', justifyContent: 'center' }}
                            >
                              🛋️ Match
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
