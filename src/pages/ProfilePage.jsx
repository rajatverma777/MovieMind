// src/pages/ProfilePage.jsx — Full-Page Cinephile Profile & Integrated Dashboard (Self & Friends)
import { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useApp } from '@/context/AppContext'
import { GN, imgUrl, MOCK_MOVIES } from '@/data/constants'
import TasteEqualizer from '@/components/TasteEqualizer'
import Spinner from '@/components/Spinner'

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
    setEditProfileModalOpen,
    setAccountSettingsModalOpen,
    setActiveChatFriend,
    realtime
  } = useApp()

  const myId = user?.id || user?._id

  // Target User determination
  const targetId = viewingUser
    ? (typeof viewingUser === 'object' ? (viewingUser.id || viewingUser._id) : String(viewingUser))
    : myId

  const isOwnProfile = !targetId || String(targetId) === String(myId)

  // Tab State
  const [activeTab, setActiveTab] = useState('overview')

  // Own Social Data (when isOwnProfile is true)
  const [friends, setFriends] = useState([])
  const [incomingRequests, setIncomingRequests] = useState([])
  const [loadingSocial, setLoadingSocial] = useState(false)
  const [copiedId, setCopiedId] = useState(false)

  // Other User Data (when isOwnProfile is false)
  const [otherProfile, setOtherProfile] = useState(null)
  const [loadingOther, setLoadingOther] = useState(!isOwnProfile)
  const [friendActionStatus, setFriendActionStatus] = useState('') // '' | 'sending' | 'sent'

  // ── 1. Load Data for Own Profile ──────────────────────────────────────────
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
  }, [isOwnProfile, myId])

  // ── 2. Load Data for Another User / Friend Profile ────────────────────────
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
  }, [isOwnProfile, targetId, myId])

  // Active Display User Object
  const displayUser = isOwnProfile ? user : (otherProfile || (typeof viewingUser === 'object' ? viewingUser : {}))
  const displayWatchlist = isOwnProfile ? myWatchlist : (otherProfile?.watchlist || [])
  const isOnline = realtime?.presenceMap?.[targetId] === 'online'

  // Watchlist Analytics
  const genreData = useMemo(() => {
    const c = {}
    displayWatchlist.forEach(m => (m.genre_ids || []).forEach(id => { c[id] = (c[id] || 0) + 1 }))
    return Object.entries(c)
      .map(([id, count]) => ({ name: GN[id] || '?', count }))
      .sort((a, b) => b.count - a.count).slice(0, 6)
  }, [displayWatchlist])

  const avgRating = useMemo(() => {
    if (!displayWatchlist.length) return '—'
    const total = displayWatchlist.reduce((s, m) => s + (m.vote_average || 0), 0)
    return (total / displayWatchlist.length).toFixed(1)
  }, [displayWatchlist])

  const favoriteGenres = displayUser?.favoriteGenres || [878, 53]

  // Copy User ID
  const handleCopyId = () => {
    if (displayUser?.id) {
      navigator.clipboard.writeText(String(displayUser.id))
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    }
  }

  // Quick message friend
  const handleMessageFriend = (friend) => {
    setActiveChatFriend(friend)
    navigate('messages')
  }

  // Quick Couch Consensus with friend
  const handleConsensusFriend = (friend) => {
    setActiveChatFriend(friend)
    navigate('consensus')
  }

  // Send friend request if not friends
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
        if (otherProfile) {
          setOtherProfile(prev => ({ ...prev, friendshipStatus: 'pending_outgoing' }))
        }
      }
    } catch {
      setFriendActionStatus('')
    }
  }

  // Accept or decline incoming friend request from this user's profile
  const handleRespondIncomingRequest = async (action) => {
    if (!myId || !otherProfile) return
    setFriendActionStatus('responding')
    try {
      let reqId = otherProfile.pendingRequestId
      if (!reqId) {
        const rRes = await fetch(`/api/social/friend-requests?me=${encodeURIComponent(myId)}`).then(r => r.json())
        const incoming = rRes.incoming || []
        const match = incoming.find(r =>
          String(r.fromUserId) === String(targetId) ||
          String(r.user?.id) === String(targetId)
        )
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
            setOtherProfile(prev => ({
              ...prev,
              friendshipStatus: 'friends',
              friendsCount: (prev.friendsCount || 0) + 1
            }))
          } else {
            setOtherProfile(prev => ({
              ...prev,
              friendshipStatus: 'none'
            }))
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

  // Unfriend this friend
  const handleUnfriend = async () => {
    if (!myId || !targetId) return
    const friendName = displayUser?.displayName || displayUser?.name || `@${displayUser?.username || 'user'}`
    if (!window.confirm(`Are you sure you want to unfriend ${friendName}? You will not be able to chat with them until you become friends again.`)) {
      return
    }

    setFriendActionStatus('unfriending')
    try {
      const res = await fetch('/api/social/friend/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: myId, friendId: targetId })
      }).then(r => r.json())

      if (res.success) {
        setOtherProfile(prev => ({
          ...prev,
          friendshipStatus: 'none',
          friendsCount: Math.max(0, (prev.friendsCount || 1) - 1)
        }))
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
      <div style={{ minHeight: '100vh', padding: '120px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <Spinner size={36} />
        <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 13 }}>Loading Cinephile Profile...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', padding: '88px 24px 64px', maxWidth: 1400, margin: '0 auto', fontFamily: "'DM Sans', sans-serif" }}>
      {/* ── BREADCRUMB / BACK BAR (When viewing a friend's profile) ──────────── */}
      {!isOwnProfile && (
        <div className="fu" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => { setViewingUser(null); navigate('profile') }}
            style={{
              background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)',
              borderRadius: 8, padding: '7px 14px', color: 'white', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all .2s'
            }}
          >
            <span>←</span> Back to My Profile
          </button>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Public Cinephile Profile
          </div>
        </div>
      )}

      {/* ── 1. HERO PROFILE BANNER ───────────────────────────────────────────── */}
      <div
        className="fu glass"
        style={{
          borderRadius: 20,
          background: isOwnProfile
            ? 'linear-gradient(135deg, rgba(229,9,20,.12) 0%, rgba(14,14,28,.95) 50%, rgba(139,92,246,.08) 100%)'
            : 'linear-gradient(135deg, rgba(14,165,233,.12) 0%, rgba(14,14,28,.95) 50%, rgba(229,9,20,.08) 100%)',
          border: '1px solid rgba(255,255,255,.1)',
          padding: '36px 32px',
          marginBottom: 28,
          boxShadow: '0 20px 48px rgba(0,0,0,.6)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24 }}>
          {/* Left: Avatar & Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 24,
                  background: isOwnProfile ? 'rgba(229,9,20,.18)' : 'rgba(14,165,233,.18)',
                  border: isOwnProfile ? '2px solid rgba(229,9,20,.45)' : '2px solid rgba(14,165,233,.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 48,
                  boxShadow: '0 10px 28px rgba(0,0,0,.4)'
                }}
              >
                {displayUser?.avatar || '🎬'}
              </div>
              <span
                style={{
                  position: 'absolute', bottom: 2, right: 2, width: 14, height: 14,
                  borderRadius: '50%', background: isOnline ? '#10b981' : '#6b7280',
                  border: '3px solid #090915'
                }}
                title={isOnline ? 'Online' : 'Offline'}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 42, color: 'white', letterSpacing: 1, margin: 0 }}>
                  {displayUser?.displayName || displayUser?.name || 'Cinephile'}
                </h1>
                <span style={{ background: 'rgba(229,9,20,.18)', border: '1px solid rgba(229,9,20,.35)', color: '#e50914', borderRadius: 14, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
                  @{displayUser?.username || 'user'}
                </span>
                <span style={{ background: isOnline ? 'rgba(16,185,129,.15)' : 'rgba(255,255,255,.06)', border: `1px solid ${isOnline ? '#10b981' : 'rgba(255,255,255,.15)'}`, color: isOnline ? '#10b981' : 'rgba(255,255,255,.5)', borderRadius: 14, padding: '2px 10px', fontSize: 10, fontWeight: 700 }}>
                  {isOnline ? '● Online Now' : '○ Offline'}
                </span>
                {!isOwnProfile && otherProfile?.tasteCompatibility && (
                  <span style={{ background: 'rgba(16,185,129,.2)', border: '1px solid rgba(16,185,129,.4)', color: '#10b981', borderRadius: 14, padding: '2px 10px', fontSize: 11, fontWeight: 800 }}>
                    ⚡ {otherProfile.tasteCompatibility}% Match With You
                  </span>
                )}
              </div>

              {/* Bio */}
              <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 13, lineHeight: 1.5, maxWidth: 650, margin: '8px 0 12px' }}>
                {displayUser?.bio ? `"${displayUser.bio}"` : 'Film enthusiast, cinematic explorer, and storytelling critic.'}
              </p>

              {/* User ID & Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', fontSize: 11, color: 'rgba(255,255,255,.4)' }}>
                <span
                  onClick={handleCopyId}
                  style={{
                    cursor: 'pointer', fontFamily: 'monospace', background: 'rgba(255,255,255,.05)',
                    padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,.08)',
                    display: 'inline-flex', alignItems: 'center', gap: 6
                  }}
                  title="Click to copy User ID"
                >
                  <span>🆔 UID: {displayUser?.id || displayUser?._id || 'atlas_session'}</span>
                  <span style={{ color: copiedId ? '#10b981' : 'rgba(255,255,255,.6)' }}>
                    {copiedId ? '✓ Copied' : '📋'}
                  </span>
                </span>
                <span>·</span>
                {/* Personal email is ONLY shown if viewing own profile for privacy */}
                {isOwnProfile && displayUser?.email ? (
                  <>
                    <span>📧 {displayUser.email}</span>
                    <span>·</span>
                  </>
                ) : null}
                <span>🗄️ MongoDB Atlas Permanent Storage</span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {isOwnProfile ? (
              <>
                <button
                  onClick={() => setEditProfileModalOpen(true)}
                  style={{
                    background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.16)',
                    borderRadius: 8, padding: '9px 16px', color: 'white', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all .2s'
                  }}
                >
                  <span>✏️</span> Edit Profile
                </button>
                <button
                  onClick={() => setAccountSettingsModalOpen(true)}
                  style={{
                    background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.16)',
                    borderRadius: 8, padding: '9px 16px', color: 'white', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all .2s'
                  }}
                >
                  <span>⚙️</span> Settings
                </button>
                <button
                  onClick={() => navigate('friends')}
                  style={{
                    background: '#e50914', border: 'none', borderRadius: 8, padding: '9px 18px',
                    color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6, transition: 'all .2s'
                  }}
                >
                  <span>👥</span> Find Friends
                </button>
              </>
            ) : (
              <>
                {/* Friend Actions when viewing other user */}
                {otherProfile?.friendshipStatus === 'friends' ? (
                  <>
                    <button
                      onClick={() => handleMessageFriend(displayUser)}
                      style={{
                        background: '#e50914', border: 'none', borderRadius: 8, padding: '10px 18px',
                        color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6, transition: 'all .2s',
                        boxShadow: '0 4px 16px rgba(229,9,20,.35)'
                      }}
                    >
                      <span>💬</span> Send Message
                    </button>
                    <button
                      onClick={() => handleConsensusFriend(displayUser)}
                      style={{
                        background: 'rgba(229,9,20,.12)', border: '1px solid rgba(229,9,20,.35)',
                        borderRadius: 8, padding: '9px 16px', color: '#ff6b6b', fontSize: 12, fontWeight: 700,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all .2s'
                      }}
                    >
                      <span>🛋️</span> Couch Consensus
                    </button>
                    <span style={{ background: 'rgba(16,185,129,.15)', border: '1px solid #10b981', color: '#10b981', borderRadius: 8, padding: '9px 14px', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span>✓</span> Cine-Friends
                    </span>
                    <button
                      onClick={handleUnfriend}
                      disabled={friendActionStatus === 'unfriending'}
                      style={{
                        background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.35)',
                        color: '#f87171', borderRadius: 8, padding: '9px 14px', fontSize: 12, fontWeight: 700,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'all .2s'
                      }}
                      title="Unfriend this user"
                    >
                      <span>✕</span> {friendActionStatus === 'unfriending' ? 'Removing...' : 'Unfriend'}
                    </button>
                  </>
                ) : otherProfile?.friendshipStatus === 'pending_incoming' ? (
                  <>
                    <span style={{ background: 'rgba(56,189,248,.12)', border: '1px solid rgba(56,189,248,.3)', color: '#38bdf8', borderRadius: 8, padding: '9px 14px', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>📬</span> Sent you a Friend Request!
                    </span>
                    <button
                      onClick={() => handleRespondIncomingRequest('accept')}
                      disabled={friendActionStatus === 'responding'}
                      style={{
                        background: '#10b981', border: 'none',
                        borderRadius: 8, padding: '9px 18px', color: 'white', fontSize: 12, fontWeight: 700,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                        boxShadow: '0 4px 14px rgba(16,185,129,.35)'
                      }}
                    >
                      <span>✓</span> {friendActionStatus === 'responding' ? 'Accepting...' : 'Accept Friend Request'}
                    </button>
                    <button
                      onClick={() => handleRespondIncomingRequest('decline')}
                      disabled={friendActionStatus === 'responding'}
                      style={{
                        background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)',
                        borderRadius: 8, padding: '9px 14px', color: 'rgba(255,255,255,.7)', fontSize: 12,
                        cursor: 'pointer'
                      }}
                    >
                      Decline
                    </button>
                  </>
                ) : otherProfile?.friendshipStatus === 'pending_outgoing' || friendActionStatus === 'sent' ? (
                  <>
                    <span style={{ background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)', color: '#f87171', borderRadius: 8, padding: '9px 14px', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span>🔒</span> Chat Disabled
                    </span>
                    <span style={{ background: 'rgba(251,191,36,.15)', border: '1px solid #fbbf24', color: '#fbbf24', borderRadius: 8, padding: '9px 14px', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span>⏳</span> Request Sent (Waiting for acceptance)
                    </span>
                  </>
                ) : (
                  <>
                    <span style={{ background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)', color: '#f87171', borderRadius: 8, padding: '9px 14px', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span>🔒</span> Chat Disabled
                    </span>
                    <button
                      onClick={handleSendFriendRequest}
                      disabled={friendActionStatus === 'sending'}
                      style={{
                        background: '#e50914', border: 'none',
                        borderRadius: 8, padding: '9px 18px', color: 'white', fontSize: 12, fontWeight: 700,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                        boxShadow: '0 4px 16px rgba(229,9,20,.35)'
                      }}
                    >
                      <span>👥</span> {friendActionStatus === 'sending' ? 'Sending Request...' : '+ Add Friend to Chat'}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. QUICK GLANCE STATS METRICS ────────────────────────────────────── */}
      <div className="fu d1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 14, marginBottom: 28 }}>
        {/* Friends Count */}
        <div
          onClick={() => isOwnProfile && setActiveTab('friends')}
          className="glass ch"
          style={{
            borderRadius: 14, padding: '20px 22px',
            cursor: isOwnProfile ? 'pointer' : 'default',
            border: activeTab === 'friends' && isOwnProfile ? '1px solid #10b981' : '1px solid rgba(255,255,255,.08)',
            transition: 'all .2s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>👥</span>
            {isOwnProfile && incomingRequests.length > 0 && (
              <span style={{ fontSize: 10, background: '#e50914', color: 'white', padding: '1px 6px', borderRadius: 10, fontWeight: 800 }}>
                +{incomingRequests.length} Req
              </span>
            )}
          </div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 36, color: '#10b981', lineHeight: 1, marginBottom: 4 }}>
            {isOwnProfile ? (loadingSocial ? '...' : friends.length) : (otherProfile?.friendsCount ?? 0)}
          </div>
          <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {isOwnProfile ? 'Cine-Friends' : 'Friends in Circle'}
          </div>
        </div>

        {/* Watchlist Size */}
        <div
          onClick={() => setActiveTab('watchlist')}
          className="glass ch"
          style={{
            borderRadius: 14, padding: '20px 22px', cursor: 'pointer',
            border: activeTab === 'watchlist' ? '1px solid #e50914' : '1px solid rgba(255,255,255,.08)',
            transition: 'all .2s'
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 6 }}>🎬</div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 36, color: '#e50914', lineHeight: 1, marginBottom: 4 }}>
            {isOwnProfile ? myWatchlist.length : (otherProfile?.watchlistCount ?? displayWatchlist.length)}
          </div>
          <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {isOwnProfile ? 'Saved Movies' : 'Public Watchlist'}
          </div>
        </div>

        {/* Avg Film Rating */}
        <div
          onClick={() => setActiveTab('overview')}
          className="glass ch"
          style={{
            borderRadius: 14, padding: '20px 22px', cursor: 'pointer',
            border: '1px solid rgba(255,255,255,.08)', transition: 'all .2s'
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 6 }}>⭐</div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 36, color: '#d4a843', lineHeight: 1, marginBottom: 4 }}>
            {avgRating}
          </div>
          <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Average Watchlist Rating
          </div>
        </div>

        {/* Top Genre */}
        <div
          onClick={() => setActiveTab('overview')}
          className="glass ch"
          style={{
            borderRadius: 14, padding: '20px 22px', cursor: 'pointer',
            border: '1px solid rgba(255,255,255,.08)', transition: 'all .2s'
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 6 }}>🎭</div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 32, color: '#0ea5e9', lineHeight: 1, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {genreData[0]?.name || (GN[favoriteGenres[0]] || 'Cinema')}
          </div>
          <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Primary Genre Affinity
          </div>
        </div>

        {/* Action Link: Chat or Messenger (Only enabled for mutual friends or own profile) */}
        <div
          onClick={() => {
            if (isOwnProfile) {
              navigate('messages')
            } else if (otherProfile?.friendshipStatus === 'friends') {
              handleMessageFriend(displayUser)
            }
          }}
          className="glass ch"
          style={{
            borderRadius: 14, padding: '20px 22px',
            cursor: (isOwnProfile || otherProfile?.friendshipStatus === 'friends') ? 'pointer' : 'default',
            opacity: (!isOwnProfile && otherProfile?.friendshipStatus !== 'friends') ? 0.6 : 1,
            border: '1px solid rgba(255,255,255,.08)', transition: 'all .2s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>💬</span>
            <span style={{ fontSize: 9, background: isOnline ? 'rgba(16,185,129,.15)' : 'rgba(255,255,255,.08)', color: isOnline ? '#10b981' : 'rgba(255,255,255,.5)', padding: '1px 7px', borderRadius: 8, fontWeight: 700 }}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 32, color: '#8b5cf6', lineHeight: 1, marginBottom: 4 }}>
            {isOwnProfile ? 'CineChat' : (otherProfile?.friendshipStatus === 'friends' ? 'Chat with ' + (displayUser.displayName?.split(' ')[0] || 'Friend') : 'Chat Disabled')}
          </div>
          <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {isOwnProfile || otherProfile?.friendshipStatus === 'friends' ? 'Direct Messenger ➔' : '🔒 Friend Request Required'}
          </div>
        </div>
      </div>

      {/* ── 3. INTERACTIVE PROFILE TABS ──────────────────────────────────────── */}
      <div className="fu d2" style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,.09)', marginBottom: 26, gap: 10 }}>
        {[
          { id: 'overview', label: '📊 Taste & Dashboard Info', icon: '📊', show: true },
          { id: 'friends', label: `👥 Cine-Friends (${friends.length})`, icon: '👥', show: isOwnProfile },
          { id: 'watchlist', label: `🎬 ${isOwnProfile ? 'Saved Watchlist' : 'Watchlist'} (${isOwnProfile ? myWatchlist.length : (otherProfile?.watchlistCount ?? displayWatchlist.length)})`, icon: '🎬', show: true },
          { id: 'account', label: '🛡️ Account & Session', icon: '🛡️', show: isOwnProfile },
        ].filter(t => t.show).map(tab => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: isActive ? 'rgba(229,9,20,.12)' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '3px solid #e50914' : '3px solid transparent',
                borderRadius: '8px 8px 0 0',
                padding: '12px 18px',
                color: isActive ? '#ffffff' : 'rgba(255,255,255,.6)',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all .2s'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── 4. TAB CONTENTS ─────────────────────────────────────────────────── */}

      {/* TAB 1: OVERVIEW & DASHBOARD INFO */}
      {activeTab === 'overview' && (
        <div className="fu">
          {/* Taste Tuning Console (Only editable if own profile; visual representation for friend) */}
          <div style={{ marginBottom: 28 }}>
            {isOwnProfile ? (
              <TasteEqualizer />
            ) : (
              <div className="glass" style={{ borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 24, color: 'white', margin: 0, letterSpacing: 0.5 }}>
                      {displayUser.displayName}'s Cinematic Taste Equalizer
                    </h3>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>
                      Harmonic slider preferences calibrated in MongoDB Atlas
                    </div>
                  </div>
                  <span style={{ fontSize: 11, background: 'rgba(16,185,129,.15)', color: '#10b981', padding: '4px 10px', borderRadius: 8, fontWeight: 700 }}>
                    ⚡ {otherProfile?.tasteCompatibility || 75}% Taste Match With You
                  </span>
                </div>

                {/* Taste Sliders Display */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                  {Object.entries(otherProfile?.preferences?.tasteSliders || { pacing: 50, darkness: 50, intensity: 50, intellect: 50, nostalgia: 50 }).map(([key, val]) => (
                    <div key={key} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, padding: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'white', fontWeight: 600, textTransform: 'capitalize', marginBottom: 6 }}>
                        <span>{key}</span>
                        <span style={{ color: '#e50914' }}>{val}%</span>
                      </div>
                      <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,.1)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${val}%`, height: '100%', background: 'linear-gradient(90deg, #e50914, #8b5cf6)', borderRadius: 3 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Charts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: displayWatchlist.length > 1 ? '1fr 1fr' : '1fr', gap: 20, marginBottom: 28 }}>
            {/* Genre Breakdown */}
            <div className="glass" style={{ borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: 'white', margin: 0, letterSpacing: 0.5 }}>
                  Genre Distribution
                </h3>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>Top Preferences</span>
              </div>

              {genreData.length === 0 ? (
                <div style={{ padding: 36, textAlign: 'center', color: 'rgba(255,255,255,.3)', fontSize: 12 }}>
                  {isOwnProfile ? 'Add at least 2 films to your Watchlist to visualize your cinematic genre breakdown!' : 'No public genre breakdown available yet.'}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={genreData} margin={{ top: 0, right: 10, bottom: 0, left: -22 }}>
                    <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,.4)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {genreData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Favorite Genres Chips & Algorithm Info */}
            <div className="glass" style={{ borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,.08)' }}>
              <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: 'white', margin: '0 0 14px', letterSpacing: 0.5 }}>
                {isOwnProfile ? 'Your Declared Favorite Genres' : `${displayUser.displayName}'s Favorite Genres`}
              </h3>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', lineHeight: 1.5, margin: '0 0 16px' }}>
                These genres drive personal AI recommendations and calculate harmonic taste compatibility across MovieMind.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {favoriteGenres.map(gid => (
                  <span
                    key={gid}
                    style={{
                      background: 'rgba(229,9,20,.14)',
                      border: '1px solid rgba(229,9,20,.35)',
                      borderRadius: 12,
                      padding: '5px 14px',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#ff6b6b'
                    }}
                  >
                    🎭 {GN[gid] || `Genre ${gid}`}
                  </span>
                ))}
              </div>

              {!isOwnProfile && (
                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                  <button
                    onClick={() => handleConsensusFriend(displayUser)}
                    style={{
                      flex: 1, background: 'rgba(229,9,20,.15)', border: '1px solid rgba(229,9,20,.35)',
                      borderRadius: 8, padding: '10px 0', color: '#ff6b6b', fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                    }}
                  >
                    <span>🛋️</span> Launch Couch Consensus with {displayUser.displayName?.split(' ')[0]}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CINE-FRIENDS & SOCIAL CIRCLE (Only on own profile) */}
      {activeTab === 'friends' && isOwnProfile && (
        <div className="fu">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 32, color: 'white', margin: 0, letterSpacing: 0.5 }}>
                My Cine-Circle ({friends.length})
              </h2>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>
                Click on any friend to view their public profile and film collection
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => navigate('friends')}
                style={{ background: '#e50914', border: 'none', borderRadius: 8, padding: '8px 16px', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                + Find New Friends
              </button>
            </div>
          </div>

          {loadingSocial ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
              <Spinner size={32} />
            </div>
          ) : friends.length === 0 ? (
            <div className="glass" style={{ padding: 48, textAlign: 'center', borderRadius: 16 }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>👥</div>
              <h3 style={{ color: 'white', margin: '0 0 6px', fontSize: 18 }}>No Friends Added Yet</h3>
              <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 13, maxWidth: 400, margin: '0 auto 18px' }}>
                Connect with other movie enthusiasts to chat, share movie recommendations, and run Couch Consensus sessions!
              </p>
              <button
                onClick={() => navigate('friends')}
                style={{ background: '#e50914', border: 'none', borderRadius: 8, padding: '10px 22px', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                Explore Cinephiles
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {friends.map(friend => {
                const fId = friend.id || friend._id
                const isFriendOnline = realtime?.presenceMap?.[fId] === 'online'
                const matchScore = friend.tasteMatchScore || friend.tasteCompatibility || 75

                return (
                  <div
                    key={fId}
                    className="glass ch"
                    style={{
                      borderRadius: 14,
                      padding: 18,
                      border: '1px solid rgba(255,255,255,.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 14
                    }}
                  >
                    <div
                      onClick={() => { setViewingUser(friend); navigate('profile', friend) }}
                      style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
                      title="Click to view friend's profile"
                    >
                      <div style={{ position: 'relative' }}>
                        <div style={{ fontSize: 34 }}>{friend.avatar || '🍿'}</div>
                        <span
                          style={{
                            position: 'absolute', bottom: -1, right: -1, width: 10, height: 10,
                            borderRadius: '50%', background: isFriendOnline ? '#10b981' : '#6b7280',
                            border: '2px solid #090915'
                          }}
                          title={isFriendOnline ? 'Online' : 'Offline'}
                        />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {friend.displayName || friend.name}
                        </div>
                        <div style={{ fontSize: 12, color: '#e50914', fontWeight: 600 }}>
                          @{friend.username}
                        </div>
                        <div style={{ fontSize: 10, color: isFriendOnline ? '#10b981' : 'rgba(255,255,255,.4)', marginTop: 2 }}>
                          {isFriendOnline ? '● Active Now' : '○ Offline'}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#10b981' }}>
                          {matchScore}%
                        </div>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase' }}>
                          Taste Match
                        </div>
                      </div>
                    </div>

                    {friend.bio && (
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', fontStyle: 'italic', background: 'rgba(255,255,255,.02)', padding: '6px 10px', borderRadius: 6, lineHeight: 1.4 }}>
                        "{friend.bio}"
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 8, borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 12 }}>
                      <button
                        onClick={() => { setViewingUser(friend); navigate('profile', friend) }}
                        style={{
                          flex: 1, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)',
                          borderRadius: 6, padding: '7px 0', color: 'white', fontSize: 11, fontWeight: 600,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5
                        }}
                      >
                        <span>👤</span> Profile
                      </button>
                      <button
                        onClick={() => handleMessageFriend(friend)}
                        style={{
                          flex: 1, background: 'rgba(229,9,20,.14)', border: '1px solid rgba(229,9,20,.3)',
                          borderRadius: 6, padding: '7px 0', color: '#ff6b6b', fontSize: 11, fontWeight: 700,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5
                        }}
                      >
                        <span>💬</span> Chat
                      </button>
                      <button
                        onClick={() => handleConsensusFriend(friend)}
                        style={{
                          flex: 1, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)',
                          borderRadius: 6, padding: '7px 0', color: 'white', fontSize: 11, fontWeight: 600,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5
                        }}
                      >
                        <span>🛋️</span> Match
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: WATCHLIST SHOWCASE (Personal or Friend's Public Watchlist) */}
      {activeTab === 'watchlist' && (
        <div className="fu">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 32, color: 'white', margin: 0, letterSpacing: 0.5 }}>
                {isOwnProfile ? 'Personal Saved Watchlist' : `${displayUser.displayName}'s Public Watchlist`} ({displayWatchlist.length})
              </h2>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>
                {isOwnProfile ? 'Stored permanently in MongoDB Atlas under your User ID' : 'Films curated by ' + (displayUser.displayName || 'friend')}
              </div>
            </div>

            {isOwnProfile && (
              <button
                onClick={() => navigate('watchlist')}
                style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 8, padding: '8px 16px', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                Open Full Watchlist Page ➔
              </button>
            )}
          </div>

          {displayWatchlist.length === 0 ? (
            <div className="glass" style={{ padding: 48, textAlign: 'center', borderRadius: 16 }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🎬</div>
              <h3 style={{ color: 'white', margin: '0 0 6px', fontSize: 18 }}>Watchlist is Empty</h3>
              <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 13, maxWidth: 380, margin: '0 auto 18px' }}>
                {isOwnProfile ? 'Browse mood recommendations or search movies to add your favorites!' : 'This cinephile has not added any public films to their watchlist yet.'}
              </p>
              {isOwnProfile && (
                <button
                  onClick={() => navigate('landing')}
                  style={{ background: '#e50914', border: 'none', borderRadius: 8, padding: '10px 22px', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                >
                  Browse Movies
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 18 }}>
              {displayWatchlist.map(movie => {
                const isInMyWl = myWatchlist.some(m => m.id === movie.id)
                return (
                  <div
                    key={movie.id}
                    className="glass ch"
                    style={{
                      borderRadius: 12,
                      overflow: 'hidden',
                      border: '1px solid rgba(255,255,255,.08)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <img
                        src={imgUrl(movie.poster_path, 'w342')}
                        alt={movie.title}
                        style={{ width: '100%', height: 250, objectFit: 'cover' }}
                      />
                      {isOwnProfile && (
                        <button
                          onClick={() => toggleWatchlist(movie)}
                          style={{
                            position: 'absolute', top: 8, right: 8, width: 26, height: 26,
                            borderRadius: '50%', background: 'rgba(0,0,0,.75)', border: '1px solid rgba(255,255,255,.2)',
                            color: '#ff6b6b', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                          title="Remove from watchlist"
                        >
                          ✕
                        </button>
                      )}
                      <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,.75)', padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, color: '#d4a843' }}>
                        ⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : '—'}
                      </div>
                    </div>

                    <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {movie.title}
                        </div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>
                          {movie.release_date ? movie.release_date.split('-')[0] : 'Feature Film'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                        {!isOwnProfile && (
                          <button
                            onClick={() => toggleWatchlist(movie)}
                            style={{
                              flex: 1, background: isInMyWl ? 'rgba(16,185,129,.15)' : 'rgba(255,255,255,.08)',
                              border: isInMyWl ? '1px solid #10b981' : '1px solid rgba(255,255,255,.15)',
                              borderRadius: 6, padding: '6px 0', color: isInMyWl ? '#10b981' : 'white', fontSize: 10, fontWeight: 700, cursor: 'pointer'
                            }}
                          >
                            {isInMyWl ? '✓ In Mine' : '+ Add'}
                          </button>
                        )}
                        <button
                          onClick={() => navigate('movie', movie.id)}
                          style={{
                            flex: isOwnProfile ? 1 : 1, background: '#e50914',
                            border: 'none', borderRadius: 6, padding: '6px 0',
                            color: 'white', fontSize: 10, fontWeight: 700, cursor: 'pointer'
                          }}
                        >
                          Details ➔
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

      {/* TAB 4: ACCOUNT & SECURITY (Own Profile Only) */}
      {activeTab === 'account' && isOwnProfile && (
        <div className="fu">
          <div className="glass" style={{ borderRadius: 16, padding: 28, maxWidth: 700, border: '1px solid rgba(255,255,255,.09)' }}>
            <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 26, color: 'white', margin: '0 0 16px', letterSpacing: 0.5 }}>
              Account & Cloud Database Security
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,.03)', borderRadius: 10 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>Full Name</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>{user?.displayName || user?.name}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,.03)', borderRadius: 10 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>Username</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#e50914' }}>@{user?.username}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,.03)', borderRadius: 10 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>Registered Email</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'white' }}>{user?.email}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,.03)', borderRadius: 10 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>Persistent User ID</span>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#38bdf8' }}>{user?.id}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,.03)', borderRadius: 10 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>Session Architecture</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>Better Auth + MongoDB Atlas Sessions</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button
                onClick={() => setEditProfileModalOpen(true)}
                style={{ background: '#e50914', border: 'none', borderRadius: 8, padding: '10px 20px', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                Edit Profile Info
              </button>
              <button
                onClick={() => setAccountSettingsModalOpen(true)}
                style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 8, padding: '10px 20px', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                Change Password / Account Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
