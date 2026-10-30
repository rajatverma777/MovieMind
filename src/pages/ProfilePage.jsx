// src/pages/ProfilePage.jsx — Full-Page Cinephile Profile & Integrated Dashboard
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
    watchlist,
    toggleWatchlist,
    navigate,
    setEditProfileModalOpen,
    setAccountSettingsModalOpen,
    setActiveChatFriend,
    realtime
  } = useApp()

  const myId = user?.id || user?._id

  // Active Profile Tab: 'overview' | 'friends' | 'watchlist' | 'account'
  const [activeTab, setActiveTab] = useState('overview')

  // Social Data: Friends & Requests
  const [friends, setFriends] = useState([])
  const [incomingRequests, setIncomingRequests] = useState([])
  const [loadingSocial, setLoadingSocial] = useState(true)
  const [copiedId, setCopiedId] = useState(false)

  // Fetch Friends & Social Info from MongoDB
  useEffect(() => {
    if (!myId) return
    const fetchSocialData = async () => {
      setLoadingSocial(true)
      try {
        const [fRes, rRes] = await Promise.all([
          fetch(`/api/social/friends?me=${encodeURIComponent(myId)}`).then(r => r.json()).catch(() => ({ friends: [] })),
          fetch(`/api/social/friend-requests?me=${encodeURIComponent(myId)}`).then(r => r.json()).catch(() => ({ requests: { incoming: [] } }))
        ])
        setFriends(fRes.friends || [])
        setIncomingRequests(rRes.requests?.incoming || [])

        // Refresh presence for friends
        const friendIds = (fRes.friends || []).map(f => f.id || f._id).filter(Boolean)
        if (friendIds.length > 0 && realtime?.refreshPresence) {
          realtime.refreshPresence(friendIds)
        }
      } catch (err) {
        console.warn('Error loading profile social data:', err)
      } finally {
        setLoadingSocial(false)
      }
    }
    fetchSocialData()
  }, [myId])

  // Watchlist Analytics
  const genreData = useMemo(() => {
    const c = {}
    watchlist.forEach(m => (m.genre_ids || []).forEach(id => { c[id] = (c[id] || 0) + 1 }))
    return Object.entries(c)
      .map(([id, count]) => ({ name: GN[id] || '?', count }))
      .sort((a, b) => b.count - a.count).slice(0, 6)
  }, [watchlist])

  const avgRating = useMemo(() => {
    if (!watchlist.length) return '—'
    const total = watchlist.reduce((s, m) => s + (m.vote_average || 0), 0)
    return (total / watchlist.length).toFixed(1)
  }, [watchlist])

  const favoriteGenres = user?.favoriteGenres || [878, 53]

  // Copy User ID
  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(String(user.id))
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

  return (
    <div style={{ minHeight: '100vh', padding: '88px 24px 64px', maxWidth: 1400, margin: '0 auto', fontFamily: "'DM Sans', sans-serif" }}>
      {/* ── 1. HERO PROFILE BANNER ───────────────────────────────────────────── */}
      <div
        className="fu glass"
        style={{
          borderRadius: 20,
          background: 'linear-gradient(135deg, rgba(229,9,20,.12) 0%, rgba(14,14,28,.95) 50%, rgba(139,92,246,.08) 100%)',
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
                  background: 'rgba(229,9,20,.18)',
                  border: '2px solid rgba(229,9,20,.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 48,
                  boxShadow: '0 10px 28px rgba(229,9,20,.25)'
                }}
              >
                {user?.avatar || '🎬'}
              </div>
              <span
                style={{
                  position: 'absolute', bottom: 2, right: 2, width: 14, height: 14,
                  borderRadius: '50%', background: '#10b981', border: '3px solid #090915'
                }}
                title="Active MongoDB Session"
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 42, color: 'white', letterSpacing: 1, margin: 0 }}>
                  {user?.displayName || user?.name || 'Cinephile'}
                </h1>
                <span style={{ background: 'rgba(229,9,20,.18)', border: '1px solid rgba(229,9,20,.35)', color: '#e50914', borderRadius: 14, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
                  @{user?.username || 'user'}
                </span>
                <span style={{ background: 'rgba(16,185,129,.15)', border: '1px solid rgba(16,185,129,.35)', color: '#10b981', borderRadius: 14, padding: '2px 10px', fontSize: 10, fontWeight: 700 }}>
                  ● Verified Member
                </span>
              </div>

              {/* Bio */}
              <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 13, lineHeight: 1.5, maxWidth: 650, margin: '8px 0 12px' }}>
                {user?.bio ? `"${user.bio}"` : 'Film critic, cinema explorer, and lover of deep storytelling.'}
              </p>

              {/* User ID & Persistence Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', fontSize: 11, color: 'rgba(255,255,255,.4)' }}>
                <span
                  onClick={handleCopyId}
                  style={{
                    cursor: 'pointer', fontFamily: 'monospace', background: 'rgba(255,255,255,.05)',
                    padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,.08)',
                    display: 'inline-flex', alignItems: 'center', gap: 6
                  }}
                  title="Click to copy Persistent User ID"
                >
                  <span>🆔 UID: {user?.id || 'atlas_session'}</span>
                  <span style={{ color: copiedId ? '#10b981' : 'rgba(255,255,255,.6)' }}>
                    {copiedId ? '✓ Copied' : '📋'}
                  </span>
                </span>
                <span>·</span>
                <span>📧 {user?.email || 'Authenticated User'}</span>
                <span>·</span>
                <span>🗄️ MongoDB Atlas Permanent Storage</span>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Controls */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
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
          </div>
        </div>
      </div>

      {/* ── 2. QUICK GLANCE STATS METRICS ────────────────────────────────────── */}
      <div className="fu d1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 14, marginBottom: 28 }}>
        {/* Friends Count */}
        <div
          onClick={() => setActiveTab('friends')}
          className="glass ch"
          style={{
            borderRadius: 14, padding: '20px 22px', cursor: 'pointer',
            border: activeTab === 'friends' ? '1px solid #10b981' : '1px solid rgba(255,255,255,.08)',
            transition: 'all .2s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>👥</span>
            {incomingRequests.length > 0 && (
              <span style={{ fontSize: 10, background: '#e50914', color: 'white', padding: '1px 6px', borderRadius: 10, fontWeight: 800 }}>
                +{incomingRequests.length} Req
              </span>
            )}
          </div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 36, color: '#10b981', lineHeight: 1, marginBottom: 4 }}>
            {loadingSocial ? '...' : friends.length}
          </div>
          <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Cine-Friends
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
            {watchlist.length}
          </div>
          <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Saved Movies
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

        {/* Real-time Messenger */}
        <div
          onClick={() => navigate('messages')}
          className="glass ch"
          style={{
            borderRadius: 14, padding: '20px 22px', cursor: 'pointer',
            border: '1px solid rgba(255,255,255,.08)', transition: 'all .2s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>💬</span>
            <span style={{ fontSize: 9, background: 'rgba(16,185,129,.15)', color: '#10b981', padding: '1px 7px', borderRadius: 8, fontWeight: 700 }}>
              Live Redis
            </span>
          </div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 36, color: '#8b5cf6', lineHeight: 1, marginBottom: 4 }}>
            CineChat
          </div>
          <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Direct Messenger ➔
          </div>
        </div>
      </div>

      {/* ── 3. INTERACTIVE PROFILE TABS ──────────────────────────────────────── */}
      <div className="fu d2" style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,.09)', marginBottom: 26, gap: 10 }}>
        {[
          { id: 'overview', label: '📊 Taste & Dashboard Info', icon: '📊' },
          { id: 'friends', label: `👥 Cine-Friends (${friends.length})`, icon: '👥' },
          { id: 'watchlist', label: `🎬 Saved Watchlist (${watchlist.length})`, icon: '🎬' },
          { id: 'account', label: '🛡️ Account & Session', icon: '🛡️' },
        ].map(tab => {
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
          {/* Taste Equalizer Console */}
          <div style={{ marginBottom: 28 }}>
            <TasteEqualizer />
          </div>

          {/* Charts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: watchlist.length > 1 ? '1fr 1fr' : '1fr', gap: 20, marginBottom: 28 }}>
            {/* Genre Breakdown */}
            <div className="glass" style={{ borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: 'white', margin: 0, letterSpacing: 0.5 }}>
                  Genre Distribution in Watchlist
                </h3>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>Top Preferences</span>
              </div>

              {genreData.length === 0 ? (
                <div style={{ padding: 36, textAlign: 'center', color: 'rgba(255,255,255,.3)', fontSize: 12 }}>
                  Add at least 2 films to your Watchlist to visualize your cinematic genre breakdown!
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

            {/* Favorite Genres Chips & Philosophy */}
            <div className="glass" style={{ borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,.08)' }}>
              <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: 'white', margin: '0 0 14px', letterSpacing: 0.5 }}>
                Your Declared Favorite Genres
              </h3>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', lineHeight: 1.5, margin: '0 0 16px' }}>
                These genres drive your AI recommendation engine and calculate harmonic taste compatibility with other cinephiles.
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

              <div style={{ padding: 14, background: 'rgba(255,255,255,.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,.06)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'white', marginBottom: 4 }}>
                  ⚡ CineMind Taste Matching Algorithm
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', lineHeight: 1.4 }}>
                  Your taste vector combines direct genre picks, watchlist additions, and slider weights to compute instant Pareto-optimal recommendations in Couch Consensus.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CINE-FRIENDS & SOCIAL CIRCLE */}
      {activeTab === 'friends' && (
        <div className="fu">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 32, color: 'white', margin: 0, letterSpacing: 0.5 }}>
                My Cine-Circle ({friends.length})
              </h2>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>
                Authenticated friends with live taste compatibility & real-time messaging
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
                const isOnline = realtime?.presenceMap?.[fId] === 'online'
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ position: 'relative' }}>
                        <div style={{ fontSize: 34 }}>{friend.avatar || '🍿'}</div>
                        <span
                          style={{
                            position: 'absolute', bottom: -1, right: -1, width: 10, height: 10,
                            borderRadius: '50%', background: isOnline ? '#10b981' : '#6b7280',
                            border: '2px solid #090915'
                          }}
                          title={isOnline ? 'Online' : 'Offline'}
                        />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {friend.displayName || friend.name}
                        </div>
                        <div style={{ fontSize: 12, color: '#e50914', fontWeight: 600 }}>
                          @{friend.username}
                        </div>
                        <div style={{ fontSize: 10, color: isOnline ? '#10b981' : 'rgba(255,255,255,.4)', marginTop: 2 }}>
                          {isOnline ? '● Active Now' : '○ Offline'}
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
                        onClick={() => handleMessageFriend(friend)}
                        style={{
                          flex: 1, background: 'rgba(229,9,20,.14)', border: '1px solid rgba(229,9,20,.3)',
                          borderRadius: 6, padding: '7px 0', color: '#ff6b6b', fontSize: 11, fontWeight: 700,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                        }}
                      >
                        <span>💬</span> CineChat
                      </button>
                      <button
                        onClick={() => handleConsensusFriend(friend)}
                        style={{
                          flex: 1, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)',
                          borderRadius: 6, padding: '7px 0', color: 'white', fontSize: 11, fontWeight: 600,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                        }}
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

      {/* TAB 3: WATCHLIST SHOWCASE */}
      {activeTab === 'watchlist' && (
        <div className="fu">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 32, color: 'white', margin: 0, letterSpacing: 0.5 }}>
                Personal Saved Watchlist ({watchlist.length})
              </h2>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>
                Stored permanently in MongoDB Atlas under your User ID
              </div>
            </div>

            <button
              onClick={() => navigate('watchlist')}
              style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 8, padding: '8px 16px', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              Open Full Watchlist Page ➔
            </button>
          </div>

          {watchlist.length === 0 ? (
            <div className="glass" style={{ padding: 48, textAlign: 'center', borderRadius: 16 }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🎬</div>
              <h3 style={{ color: 'white', margin: '0 0 6px', fontSize: 18 }}>Your Watchlist is Empty</h3>
              <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 13, maxWidth: 380, margin: '0 auto 18px' }}>
                Browse our mood recommendations or search movies to add your favorites to your personal watchlist!
              </p>
              <button
                onClick={() => navigate('landing')}
                style={{ background: '#e50914', border: 'none', borderRadius: 8, padding: '10px 22px', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                Browse Movies
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 18 }}>
              {watchlist.map(movie => (
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

                    <button
                      onClick={() => navigate('movie', movie.id)}
                      style={{
                        marginTop: 10, width: '100%', background: 'rgba(255,255,255,.06)',
                        border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, padding: '6px 0',
                        color: 'white', fontSize: 10, fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      View Details ➔
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ACCOUNT & SECURITY */}
      {activeTab === 'account' && (
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
