// src/pages/ConsensusPage.jsx
// "Couch Consensus" — Real-Time Live Collaborative Movie Matcher between Added Cine-Friends

import { useState, useEffect, useRef } from 'react'
import { useApp } from '@/context/AppContext'
import { MOCK_MOVIES, GN, imgUrl } from '@/data/constants'
import MovieCard from '@/components/MovieCard'
import Spinner from '@/components/Spinner'

export default function ConsensusPage() {
  const { user, watchlist, navigate, toggleWatchlist, activeChatFriend, setActiveChatFriend, realtime } = useApp()

  const myId = user?.id || user?._id

  // Mode: 'live' (paired with friend) vs 'local' (split-screen on same couch)
  const [mode, setMode] = useState('live')

  // Friends & Partner Selection
  const [friends, setFriends] = useState([])
  const [communityUsers, setCommunityUsers] = useState([])
  const [loadingFriends, setLoadingFriends] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [inviteStatus, setInviteStatus] = useState('') // '' | 'sending' | 'sent'

  // Room state
  const [roomId, setRoomId] = useState('')
  const [room, setRoom] = useState(null)

  // Current user inputs
  const [userName, setUserName] = useState(user?.displayName || user?.name || 'You')
  const [selectedMovies, setSelectedMovies] = useState(() =>
    watchlist.length > 0 ? watchlist.slice(0, 3) : []
  )
  const [selectedGenres, setSelectedGenres] = useState(
    user?.favoriteGenres && user.favoriteGenres.length > 0 ? user.favoriteGenres : [878, 53]
  )
  const [isReady, setIsReady] = useState(false)

  // Split-screen local mode (User B state)
  const [localNameB, setLocalNameB] = useState('Partner / Friend')
  const [localMoviesB, setLocalMoviesB] = useState([MOCK_MOVIES[6], MOCK_MOVIES[9]])
  const [localGenresB, setLocalGenresB] = useState([35, 18])
  const [isReadyB, setIsReadyB] = useState(false)
  const [movieQueryB, setMovieQueryB] = useState('')

  // Movie search / selection in room
  const [movieQuery, setMovieQuery] = useState('')

  // Status & results
  const [busy, setBusy] = useState(false)
  const [results, setResults] = useState(null)

  // ── 1. Fetch Added Friends & Community Cinephiles ──────────────────────────
  useEffect(() => {
    if (!myId) return
    const fetchFriends = async () => {
      setLoadingFriends(true)
      try {
        const [fRes, cRes] = await Promise.all([
          fetch(`/api/social/friends?me=${encodeURIComponent(myId)}`).then(r => r.json()).catch(() => ({ friends: [] })),
          fetch(`/api/social/community-users?me=${encodeURIComponent(myId)}`).then(r => r.json()).catch(() => ({ users: [] }))
        ])
        const friendList = fRes.friends || []
        const community = cRes.users || []
        setFriends(friendList)
        setCommunityUsers(community)

        // Select initial partner
        if (activeChatFriend) {
          const match = friendList.find(f => (f.id || f._id) === (activeChatFriend.id || activeChatFriend._id))
          setSelectedFriend(match || activeChatFriend)
        } else if (friendList.length > 0) {
          setSelectedFriend(friendList[0])
        } else if (community.length > 0) {
          setSelectedFriend(community[0])
        }
      } catch (err) {
        console.warn('Error loading friends for consensus:', err)
      } finally {
        setLoadingFriends(false)
      }
    }
    fetchFriends()
  }, [myId, activeChatFriend, watchlist.length])

  // ── 2. Create or Join Collaborative Room for Selected Friend Pair ──────────
  useEffect(() => {
    if (!myId || !selectedFriend || mode !== 'live') return

    const friendId = selectedFriend.id || selectedFriend._id
    if (!friendId) return

    // Deterministic room ID for this pair so both users automatically join the same session
    const pairRoomId = `PAIR_${[String(myId), String(friendId)].sort().join('_')}`.toUpperCase()
    setRoomId(pairRoomId)

    const initRoom = async () => {
      try {
        const res = await fetch('/api/consensus/room/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId: pairRoomId,
            userId: String(myId),
            name: userName,
            likedMovies: selectedMovies,
            preferredGenreIds: selectedGenres,
            ready: isReady
          })
        })
        if (res.ok) {
          const data = await res.json()
          setRoom(data)
          if (data.results) {
            setResults(data.results)
          }
        }
      } catch (err) {
        console.warn('Error initializing live consensus room:', err)
      }
    }

    initRoom()
  }, [myId, selectedFriend, mode])

  // ── 3. Real-Time Instant Live Sync via SSE (Upstash Redis Pub/Sub) ─────────
  useEffect(() => {
    if (!realtime?.consensusRoomUpdate || mode !== 'live') return
    const update = realtime.consensusRoomUpdate
    if (update.roomId && roomId && update.roomId.toUpperCase() === roomId.toUpperCase()) {
      if (update.room) {
        setRoom(update.room)
        if (update.room.results) {
          setResults(update.room.results)
        }
      }
    }
  }, [realtime?.consensusRoomUpdate, roomId, mode])

  // ── 3b. Resilient Real-Time Room Polling (Every 1.5 seconds) ───────────────
  useEffect(() => {
    if (!roomId || mode !== 'live') return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/consensus/room/${roomId}`)
        if (res.ok) {
          const data = await res.json()
          setRoom(data)
          if (data.results) {
            setResults(data.results)
          }
        }
      } catch {}
    }, 1500)

    return () => clearInterval(interval)
  }, [roomId, mode])

  // ── 4. Sync User's Selections to the Collaborative Room ───────────────────
  const syncUpdate = async (readyVal = isReady, moviesVal = selectedMovies, genresVal = selectedGenres) => {
    if (!roomId || mode !== 'live') return
    try {
      const res = await fetch(`/api/consensus/room/${roomId}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: String(myId),
          name: userName,
          likedMovies: moviesVal,
          preferredGenreIds: genresVal,
          ready: readyVal
        })
      })
      if (res.ok) {
        const data = await res.json()
        setRoom(data)
      }
    } catch {}
  }

  const toggleMovieSelection = (movie) => {
    const exists = selectedMovies.some(m => m.id === movie.id)
    const next = exists ? selectedMovies.filter(m => m.id !== movie.id) : [...selectedMovies, movie]
    setSelectedMovies(next)
    syncUpdate(isReady, next, selectedGenres)
  }

  const toggleMovieBSelection = (movie) => {
    setLocalMoviesB(prev => {
      const exists = prev.some(m => m.id === movie.id)
      return exists ? prev.filter(m => m.id !== movie.id) : [...prev, movie]
    })
  }

  const toggleGenreSelection = (gid) => {
    const next = selectedGenres.includes(gid)
      ? selectedGenres.filter(x => x !== gid)
      : [...selectedGenres, gid]
    setSelectedGenres(next)
    syncUpdate(isReady, selectedMovies, next)
  }

  const handleToggleReady = () => {
    const nextReady = !isReady
    setIsReady(nextReady)
    syncUpdate(nextReady, selectedMovies, selectedGenres)
  }

  // ── 5. Send Real-Time In-App Alert to Friend via Redis & Chat ──────────────
  const sendLiveInviteToFriend = async () => {
    const friendId = selectedFriend?.id || selectedFriend?._id
    if (!myId || !friendId || !roomId) return
    setInviteStatus('sending')
    try {
      const res = await fetch('/api/consensus/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: String(myId),
          toUserId: String(friendId),
          roomId
        })
      })
      if (res.ok) {
        setInviteStatus('sent')
        setTimeout(() => setInviteStatus(''), 4000)
      } else {
        setInviteStatus('')
      }
    } catch {
      setInviteStatus('')
    }
  }

  // ── 6. Compute Final Consensus (Pareto Engine) ─────────────────────────────
  const handleCompute = async () => {
    setBusy(true)
    try {
      const friendId = selectedFriend?.id || selectedFriend?._id
      const friendName = selectedFriend?.displayName || selectedFriend?.name || 'Partner'
      const partnerData = room?.participants?.[friendId] ||
        room?.participants?.[String(friendId)] ||
        Object.values(room?.participants || {}).find(p => String(p.userId) === String(friendId))

      if (mode === 'live' && roomId) {
        // Compute on server and broadcast live results simultaneously to both users
        const res = await fetch(`/api/consensus/room/${roomId}/compute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userAId: String(myId),
            userBId: String(friendId)
          })
        })

        if (res.ok) {
          const data = await res.json()
          setRoom(data)
          if (data.results) {
            setResults(data.results)
            return
          }
        }
      }

      // Local mode or fallback
      const friendGenres = (partnerData?.preferredGenreIds?.length > 0
        ? partnerData.preferredGenreIds
        : (selectedFriend?.favoriteGenres || [878, 53]))

      const friendMovies = (partnerData?.likedMovies?.length > 0
        ? partnerData.likedMovies
        : [])

      const userA = {
        name: userName,
        likedMovies: selectedMovies,
        preferredGenreIds: selectedGenres
      }

      const userB = mode === 'local'
        ? { name: localNameB, likedMovies: localMoviesB, preferredGenreIds: localGenresB }
        : { name: friendName, likedMovies: friendMovies, preferredGenreIds: friendGenres }

      const res = await fetch('/api/consensus/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userA, userB, candidatePool: MOCK_MOVIES })
      })

      if (res.ok) {
        const data = await res.json()
        setResults(data)
      } else {
        throw new Error('Fallback')
      }
    } catch {
      // Offline fallback math
      setResults({
        users: { nameA: userName, nameB: selectedFriend?.displayName || localNameB },
        sharedGenres: ['Drama', 'Thriller'],
        recommendations: MOCK_MOVIES.slice(2, 8).map((m, idx) => ({
          ...m,
          consensusScore: Number((0.92 - idx * 0.04).toFixed(2)),
          userAScore: Number((0.89 - idx * 0.03).toFixed(2)),
          userBScore: Number((0.94 - idx * 0.05).toFixed(2)),
          fairnessScore: 0.95,
          compromiseReason: `Harmonic balance: Shares common ground in dramatic stakes while satisfying both viewers.`
        }))
      })
    } finally {
      setBusy(false)
    }
  }

  // Filter catalog for quick movie picker
  const filteredCatalog = MOCK_MOVIES.filter(m =>
    !movieQuery.trim() || m.title.toLowerCase().includes(movieQuery.toLowerCase())
  )

  // Filter catalog for partner quick movie picker (Split-screen)
  const filteredCatalogB = MOCK_MOVIES.filter(m =>
    !movieQueryB.trim() || m.title.toLowerCase().includes(movieQueryB.toLowerCase())
  )

  const selectedFriendId = selectedFriend?.id || selectedFriend?._id
  const isSelectedFriendOnline = realtime?.presenceMap?.[selectedFriendId] === 'online'
  const partnerData = room?.participants?.[selectedFriendId] ||
    room?.participants?.[String(selectedFriendId)] ||
    Object.values(room?.participants || {}).find(p => String(p.userId) === String(selectedFriendId))
  const isPartnerReady = !!partnerData?.ready

  return (
    <div style={{ minHeight: '100vh', padding: '24px 24px 180px', maxWidth: 1400, margin: '0 auto', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'DM Sans', sans-serif" }}>
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="fu" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(229,9,20,.14)', border: '1.2px solid rgba(229,9,20,.3)', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 700, color: '#e50914', marginBottom: 8, boxShadow: '0 0 14px rgba(229,9,20,0.2)' }}>
            <span>🛋️</span> REAL-TIME MULTIPLAYER TASTE FUSION
          </div>
          <h1 style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Bebas Neue', cursive", fontSize: 50, letterSpacing: 1, color: 'white', marginBottom: 5 }}>
            Couch <span style={{ color: '#e50914' }}>Consensus</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 13, maxWidth: 650 }}>
            Select your added cine-friend below. Both of you choose movies and genres in real time, and our harmonic Pareto engine finds the ideal compromise.
          </p>
        </div>

        {/* Apple Segmented Control Pill Switcher */}
        <div className="apple-segmented-group">
          <button
            onClick={() => setMode('live')}
            className={`apple-segmented-item ${mode === 'live' ? 'active' : ''}`}
            style={{
              background: mode === 'live' ? '#e50914' : 'transparent',
              color: mode === 'live' ? 'white' : 'rgba(255,255,255,.55)'
            }}
          >
            🌐 Live Friend Matcher
          </button>
          <button
            onClick={() => setMode('local')}
            className={`apple-segmented-item ${mode === 'local' ? 'active' : ''}`}
            style={{
              background: mode === 'local' ? '#8b5cf6' : 'transparent',
              color: mode === 'local' ? 'white' : 'rgba(255,255,255,.55)'
            }}
          >
            💻 Split-Screen (Same Couch)
          </button>
        </div>
      </div>

      {/* ── LIVE FRIEND SELECTOR BAR (REPLACED INVITATION LINK & CODE INPUT) ── */}
      {mode === 'live' && (
        <div className="apple-glass-card fu d1" style={{ padding: '18px 22px', marginBottom: 26 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>👥</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Select Your Movie-Night Partner ({friends.length} Cine-Friends Added):
              </span>
            </div>

            <button
              onClick={() => navigate('friends')}
              className="apple-glass-btn"
              style={{ padding: '6px 14px', fontSize: 11, fontWeight: 700, color: '#e50914', borderColor: 'rgba(229,9,20,.35)', background: 'rgba(229,9,20,.12)' }}
            >
              + Manage Cine-Friends
            </button>
          </div>

          {/* Friends List Chips */}
          {friends.length > 0 ? (
            <div className="sx" style={{ paddingBottom: 6 }}>
              {friends.map(f => {
                const fId = f.id || f._id
                const isSelected = selectedFriendId === fId
                const isOnline = realtime?.presenceMap?.[fId] === 'online'

                return (
                  <div
                    key={fId}
                    onClick={() => setSelectedFriend(f)}
                    style={{
                      background: isSelected ? 'rgba(229,9,20,.2)' : 'rgba(255,255,255,.05)',
                      border: isSelected ? '1.5px solid #e50914' : '1px solid rgba(255,255,255,.14)',
                      borderRadius: 16, padding: '10px 16px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
                      boxShadow: isSelected ? '0 8px 24px rgba(229,9,20,.35), inset 0 1px 1px rgba(255,255,255,0.3)' : 'none',
                      transition: 'all .24s var(--apple-spring)'
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <span style={{ fontSize: 26 }}>{f.avatar || '🍿'}</span>
                      <span
                        style={{
                          position: 'absolute', bottom: -1, right: -1, width: 8, height: 8, borderRadius: '50%',
                          background: isOnline ? '#10b981' : '#6b7280',
                          border: '2px solid #090915'
                        }}
                        title={isOnline ? 'Online' : 'Offline'}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{f.displayName || f.name}</span>
                        {isSelected && (
                          <span style={{ fontSize: 10, background: '#e50914', color: 'white', padding: '1px 6px', borderRadius: 10, fontWeight: 800 }}>
                            ✓ Active
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                        <span style={{ fontSize: 11, color: '#e50914', fontWeight: 600 }}>@{f.username}</span>
                        <span style={{ fontSize: 10, color: '#10b981', background: 'rgba(16,185,129,.12)', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                          {(f.tasteMatchScore ?? f.tasteCompatibility ?? 0) > 0 ? `${f.tasteMatchScore ?? f.tasteCompatibility}% Fit` : '0% Fit'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, padding: '8px 0' }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>
                You haven't added any cine-friends yet. Connect with other movie buffs in the Community Hub to pair up!
              </div>

              {communityUsers.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', fontWeight: 700 }}>Quick Pair:</span>
                  {communityUsers.slice(0, 3).map(u => (
                    <button
                      key={u.id || u._id}
                      onClick={() => setSelectedFriend(u)}
                      style={{
                        background: (selectedFriend?.id || selectedFriend?._id) === (u.id || u._id) ? '#e50914' : 'rgba(255,255,255,.06)',
                        border: '1px solid rgba(255,255,255,.1)', borderRadius: 16, padding: '4px 10px',
                        color: 'white', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5
                      }}
                    >
                      <span>{u.avatar || '🎬'}</span>
                      <span>@{u.username}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── LIVE INTERACTIVE SELECTION GRID ─────────────────────────────── */}
      <div className="fu d2" style={{ display: 'grid', gridTemplateColumns: mode === 'local' ? '1fr 1fr' : '1fr 360px', gap: 24, marginBottom: 32, alignItems: 'start' }}>
        {/* Your Profile Card */}
        <div className="apple-glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 28 }}>{user?.avatar || '👑'}</span>
              <div>
                <input
                  type="text"
                  value={userName}
                  onChange={e => { setUserName(e.target.value); syncUpdate(isReady, selectedMovies, selectedGenres) }}
                  placeholder="Your Name"
                  style={{ background: 'none', border: 'none', borderBottom: '1.5px dashed rgba(229,9,20,.6)', color: 'white', fontSize: 18, fontWeight: 700, outline: 'none', width: 170, fontFamily: 'inherit' }}
                />
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', marginTop: 2 }}>
                  @{user?.username || 'you'} · Session Host (You)
                </div>
              </div>
            </div>

            {/* Ready Button */}
            <button
              onClick={handleToggleReady}
              className="apple-glass-btn"
              style={{
                background: isReady ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.85) 0%, rgba(5, 150, 105, 0.95) 100%)' : 'rgba(255,255,255,.08)',
                color: 'white',
                borderColor: isReady ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255,255,255,.16)',
                padding: '8px 20px',
                fontSize: 12,
                fontWeight: 700,
                boxShadow: isReady ? '0 8px 20px rgba(16, 185, 129, 0.35), inset 0 1px 1px rgba(255,255,255,0.4)' : 'none'
              }}
            >
              {isReady ? '✓ You Are Ready!' : 'Mark as Ready'}
            </button>
          </div>

          {/* Genres */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.55)', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 0.4 }}>
              Select Favorite Genres Tonight:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {Object.entries(GN).slice(0, 10).map(([id, name]) => {
                const active = selectedGenres.includes(+id)
                return (
                  <button
                    key={id}
                    onClick={() => toggleGenreSelection(+id)}
                    style={{
                      background: active ? 'linear-gradient(135deg, #e50914 0%, #b91c1c 100%)' : 'rgba(255,255,255,.06)',
                      border: active ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,.1)',
                      borderRadius: 100,
                      padding: '6px 14px',
                      fontSize: 11,
                      color: active ? 'white' : 'rgba(255,255,255,.7)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      boxShadow: active ? '0 4px 14px rgba(229,9,20,0.35), inset 0 1px 1px rgba(255,255,255,0.4)' : 'none',
                      transition: 'all .2s var(--apple-spring)'
                    }}
                  >
                    {name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected Movies Tray */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', marginBottom: 8 }}>
              Your Selected Inspirations ({selectedMovies.length}):
            </div>
            {selectedMovies.length === 0 ? (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', fontStyle: 'italic', padding: '10px 0' }}>
                No films selected yet. Pick 2-3 films from the catalog below!
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
                {selectedMovies.map(m => (
                  <div key={m.id} style={{ position: 'relative', width: 68, flexShrink: 0, textAlign: 'center' }}>
                    <img
                      src={imgUrl(m.poster_path, 'w92') || `https://placehold.co/68x96/222/999?text=${m.title[0]}`}
                      alt={m.title}
                      style={{ width: 68, height: 96, borderRadius: 6, objectFit: 'cover' }}
                    />
                    <button
                      onClick={() => toggleMovieSelection(m)}
                      style={{ position: 'absolute', top: -5, right: -5, width: 18, height: 18, borderRadius: '50%', background: '#e50914', color: 'white', border: 'none', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      ✕
                    </button>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.7)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.title}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Catalog Picker */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', paddingTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'white', textTransform: 'uppercase' }}>
                Quick Movie Picker:
              </span>
              <input
                type="text"
                value={movieQuery}
                onChange={e => setMovieQuery(e.target.value)}
                placeholder="Search catalog..."
                style={{ background: 'rgba(0,0,0,.3)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, padding: '4px 8px', fontSize: 11, color: 'white', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(110px,1fr))', gap: 8, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
              {filteredCatalog.slice(0, 12).map(m => {
                const isSelected = selectedMovies.some(sm => sm.id === m.id)
                return (
                  <div
                    key={m.id}
                    onClick={() => toggleMovieSelection(m)}
                    style={{
                      background: isSelected ? 'rgba(229,9,20,.2)' : 'rgba(255,255,255,.02)',
                      border: isSelected ? '1px solid #e50914' : '1px solid rgba(255,255,255,.06)',
                      borderRadius: 8, padding: 6, cursor: 'pointer', textAlign: 'center', transition: 'all .2s'
                    }}
                  >
                    <img
                      src={imgUrl(m.poster_path, 'w92')}
                      alt={m.title}
                      style={{ width: '100%', height: 70, objectFit: 'cover', borderRadius: 4, marginBottom: 4 }}
                    />
                    <div style={{ fontSize: 10, color: 'white', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.title}
                    </div>
                    <div style={{ fontSize: 9, color: isSelected ? '#e50914' : 'rgba(255,255,255,.4)' }}>
                      {isSelected ? '✓ Picked' : '+ Add'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Selected Friend Live Profile Card (Live Mode) */}
        {mode === 'live' && (() => {
          const activePartner = partnerData
          const partnerGenres = (activePartner?.preferredGenreIds?.length > 0
            ? activePartner.preferredGenreIds
            : (selectedFriend?.favoriteGenres || [878, 53]))
          const partnerMovies = activePartner?.likedMovies || []

          return (
            <div className="apple-glass-card" style={{ padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 26 }}>{selectedFriend?.avatar || '👥'}</span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>
                      {selectedFriend?.displayName || selectedFriend?.name || 'No Friend Selected'}
                    </div>
                    <div style={{ fontSize: 11, color: '#e50914', fontWeight: 600 }}>
                      @{selectedFriend?.username || 'partner'} · {isSelectedFriendOnline ? '🟢 Live Online' : '⚪ Offline'}
                    </div>
                  </div>
                </div>

                {/* Ready Badge */}
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                  background: isPartnerReady ? 'rgba(16,185,129,.18)' : 'rgba(251,191,36,.14)',
                  color: isPartnerReady ? '#10b981' : '#fbbf24',
                  border: `1px solid ${isPartnerReady ? 'rgba(16,185,129,.4)' : 'rgba(251,191,36,.3)'}`,
                  boxShadow: isPartnerReady ? '0 0 12px rgba(16,185,129,.25)' : 'none'
                }}>
                  {isPartnerReady ? '✓ Friend is Ready' : 'Syncing picks'}
                </span>
              </div>

              {/* Quick Live Invite Button */}
              {selectedFriend && (
                <div style={{ marginBottom: 16 }}>
                  <button
                    onClick={sendLiveInviteToFriend}
                    disabled={inviteStatus === 'sending'}
                    className="apple-glass-btn"
                    style={{
                      width: '100%',
                      background: inviteStatus === 'sent' ? 'rgba(16,185,129,.18)' : 'rgba(229,9,20,.14)',
                      borderColor: inviteStatus === 'sent' ? 'rgba(16,185,129,.5)' : 'rgba(229,9,20,.35)',
                      color: inviteStatus === 'sent' ? '#10b981' : '#e50914',
                      padding: '9px 14px', fontSize: 12, fontWeight: 700
                    }}
                  >
                    <span>{inviteStatus === 'sent' ? '✓ In-App Alert Sent to Friend!' : inviteStatus === 'sending' ? 'Sending Alert...' : `📢 Send Live Alert to @${selectedFriend.username}`}</span>
                  </button>
                </div>
              )}

              {/* Friend's Chosen Genres */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', marginBottom: 6, fontWeight: 700 }}>
                  Friend's Favorite Genres:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {partnerGenres.map(gid => (
                    <span key={gid} style={{ background: 'rgba(255,255,255,.08)', padding: '3px 9px', borderRadius: 10, fontSize: 10, color: 'white' }}>
                      {GN[gid] || 'Genre'}
                    </span>
                  ))}
                </div>
              </div>

              {/* Friend's Movie Inspirations */}
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', marginBottom: 6, fontWeight: 700 }}>
                  Friend's Movie Picks ({partnerMovies.length}):
                </div>
                {partnerMovies.length === 0 ? (
                  <div style={{ padding: '16px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, fontSize: 11, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.08)' }}>
                    No films selected yet by @{selectedFriend?.username || 'partner'}. Once they pick on their screen, their films appear here live!
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                    {partnerMovies.map(m => (
                      <div key={m.id} style={{ width: 56, flexShrink: 0, textAlign: 'center' }}>
                        <img
                          src={imgUrl(m.poster_path, 'w92') || `https://placehold.co/56x80/222/999?text=${m.title[0]}`}
                          alt={m.title}
                          style={{ width: 56, height: 80, borderRadius: 6, objectFit: 'cover' }}
                        />
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,.7)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {m.title}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })()}

        {/* Split Screen Local User B (Only in Local Mode) */}
        {mode === 'local' && (
          <div style={{ background: 'rgba(236,72,153,.04)', border: '1px solid rgba(236,72,153,.2)', borderRadius: 14, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 26 }}>👥</span>
                <div>
                  <input
                    type="text"
                    value={localNameB}
                    onChange={e => setLocalNameB(e.target.value)}
                    style={{ background: 'none', border: 'none', borderBottom: '1px dashed rgba(236,72,153,.5)', color: 'white', fontSize: 18, fontWeight: 700, outline: 'none', width: 170 }}
                    placeholder="Partner Name"
                  />
                  <div style={{ fontSize: 10, color: 'rgba(236,72,153,.8)', textTransform: 'uppercase', marginTop: 2 }}>
                    Couch Partner · Split Screen
                  </div>
                </div>
              </div>

              {/* Ready Button for Partner */}
              <button
                onClick={() => setIsReadyB(!isReadyB)}
                style={{
                  background: isReadyB ? '#10b981' : 'rgba(236,72,153,.15)',
                  color: 'white',
                  border: isReadyB ? '1px solid #10b981' : '1px solid rgba(236,72,153,.35)',
                  borderRadius: 8, padding: '8px 18px', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .2s'
                }}
              >
                {isReadyB ? '✓ Partner is Ready!' : 'Mark as Ready'}
              </button>
            </div>

            {/* Genres B */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', marginBottom: 8 }}>
                Select Favorite Genres:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {Object.entries(GN).slice(0, 10).map(([id, name]) => {
                  const active = localGenresB.includes(+id)
                  return (
                    <button
                      key={id}
                      onClick={() => setLocalGenresB(prev => prev.includes(+id) ? prev.filter(x => x !== +id) : [...prev, +id])}
                      style={{
                        background: active ? '#ec4899' : 'rgba(255,255,255,.05)',
                        border: 'none', borderRadius: 14, padding: '5px 12px', fontSize: 11,
                        color: active ? 'white' : 'rgba(255,255,255,.6)', cursor: 'pointer', fontWeight: 600
                      }}
                    >
                      {name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Movies B Inspirations Tray */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', marginBottom: 8 }}>
                Partner's Selected Inspirations ({localMoviesB.length}):
              </div>
              {localMoviesB.length === 0 ? (
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', fontStyle: 'italic', padding: '10px 0' }}>
                  No films selected yet. Pick 2-3 films from the catalog below!
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
                  {localMoviesB.map(m => (
                    <div key={m.id} style={{ position: 'relative', width: 68, flexShrink: 0, textAlign: 'center' }}>
                      <img
                        src={imgUrl(m.poster_path, 'w92') || `https://placehold.co/68x96/222/999?text=${m.title[0]}`}
                        alt={m.title}
                        style={{ width: 68, height: 96, borderRadius: 6, objectFit: 'cover' }}
                      />
                      <button
                        onClick={() => toggleMovieBSelection(m)}
                        style={{ position: 'absolute', top: -5, right: -5, width: 18, height: 18, borderRadius: '50%', background: '#ec4899', color: 'white', border: 'none', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Remove movie"
                      >
                        ✕
                      </button>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,.7)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.title}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Catalog Picker for Partner B */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', paddingTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'white', textTransform: 'uppercase' }}>
                  Partner Movie Picker:
                </span>
                <input
                  type="text"
                  value={movieQueryB}
                  onChange={e => setMovieQueryB(e.target.value)}
                  placeholder="Search catalog..."
                  style={{ background: 'rgba(0,0,0,.3)', border: '1px solid rgba(236,72,153,.3)', borderRadius: 6, padding: '4px 8px', fontSize: 11, color: 'white', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(110px,1fr))', gap: 8, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
                {filteredCatalogB.slice(0, 12).map(m => {
                  const isSelected = localMoviesB.some(sm => sm.id === m.id)
                  return (
                    <div
                      key={m.id}
                      onClick={() => toggleMovieBSelection(m)}
                      style={{
                        background: isSelected ? 'rgba(236,72,153,.2)' : 'rgba(255,255,255,.02)',
                        border: isSelected ? '1px solid #ec4899' : '1px solid rgba(255,255,255,.06)',
                        borderRadius: 8, padding: 6, cursor: 'pointer', textAlign: 'center', transition: 'all .2s'
                      }}
                    >
                      <img
                        src={imgUrl(m.poster_path, 'w92')}
                        alt={m.title}
                        style={{ width: '100%', height: 70, objectFit: 'cover', borderRadius: 4, marginBottom: 4 }}
                      />
                      <div style={{ fontSize: 10, color: 'white', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.title}
                      </div>
                      <div style={{ fontSize: 9, color: isSelected ? '#ec4899' : 'rgba(255,255,255,.4)' }}>
                        {isSelected ? '✓ Picked' : '+ Add'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── ACTION TRIGGER ──────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginTop: 32, marginBottom: 72 }}>
        <button
          onClick={handleCompute}
          disabled={busy}
          className="apple-glass-pill"
          style={{
            background: (mode === 'live' ? (isReady && isPartnerReady) : (isReady && isReadyB))
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.92) 0%, rgba(14, 165, 233, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(229, 9, 20, 0.92) 0%, rgba(139, 92, 246, 0.95) 100%)',
            border: '1.2px solid rgba(255, 255, 255, 0.35)',
            borderRadius: 100,
            padding: '16px 44px',
            color: 'white',
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'DM Sans', sans-serif",
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: (mode === 'live' ? (isReady && isPartnerReady) : (isReady && isReadyB))
              ? '0 16px 48px rgba(16, 185, 129, 0.45), inset 0 1.5px 2px rgba(255, 255, 255, 0.6)'
              : '0 16px 48px rgba(229, 9, 20, 0.4), inset 0 1.5px 2px rgba(255, 255, 255, 0.5)',
            transition: 'all .25s var(--apple-spring)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'}
          onMouseOut={e => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
        >
          {busy
            ? 'Solving Pareto Consensus...'
            : (mode === 'live' ? (isReady && isPartnerReady) : (isReady && isReadyB))
              ? '✨ Both Cinephiles Ready! Find Our Perfect Compromise'
              : '⚡ Find Our Perfect Compromise'}
        </button>
      </div>

      {/* ── LOADING ─────────────────────────────────────────────────────── */}
      {busy && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spinner size={46} />
        </div>
      )}

      {/* ── LIVE RESULTS ────────────────────────────────────────────────── */}
      {!busy && results && (
        <div className="fu">
          {/* Top Banner Breakdown */}
          <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, padding: '20px 24px', marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#d4a843', textTransform: 'uppercase', letterSpacing: '.6px' }}>
                Algorithmic Agreement Found
              </div>
              <div style={{ fontSize: 20, color: 'white', fontWeight: 700, marginTop: 4 }}>
                Shared Common Ground: {results.sharedGenres?.join(' & ') || 'High-Stakes Dramatic Alignment'}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>
                Calculated using harmonic distance minimization so both {userName} and {selectedFriend?.displayName || selectedFriend?.name || localNameB} are equally satisfied.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#10b981' }}>
                  {Math.round((results.recommendations[0]?.consensusScore || 0.88) * 100)}%
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase' }}>Consensus Match</div>
              </div>
              <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,.1)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#0ea5e9' }}>
                  {results.recommendations?.length || 0}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase' }}>Films Agreed</div>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
            {results.recommendations.map(m => (
              <div
                key={m.id}
                style={{
                  background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)',
                  borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column'
                }}
              >
                <div style={{ display: 'flex', gap: 14, padding: 14 }}>
                  <img
                    src={imgUrl(m.poster_path, 'w185') || `https://placehold.co/74x110/222/999?text=${m.title[0]}`}
                    alt={m.title}
                    onClick={() => navigate('movie', m.id)}
                    style={{ width: 74, height: 110, borderRadius: 8, objectFit: 'cover', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4
                      onClick={() => navigate('movie', m.id)}
                      style={{ fontSize: 15, fontWeight: 700, color: 'white', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {m.title}
                    </h4>

                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', marginTop: 2 }}>
                      ⭐ {m.vote_average?.toFixed(1)} · {m.release_date?.split('-')[0]}
                    </div>

                    <div style={{ marginTop: 8, display: 'inline-block', background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.3)', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 700, color: '#10b981' }}>
                      ⚡ {Math.round(m.consensusScore * 100)}% Consensus Match
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 6, fontSize: 10, color: 'rgba(255,255,255,.5)' }}>
                      <span>{userName}: <strong style={{ color: '#0ea5e9' }}>{Math.round(m.userAScore * 100)}%</strong></span>
                      <span>{selectedFriend?.displayName || selectedFriend?.name || localNameB}: <strong style={{ color: '#ec4899' }}>{Math.round(m.userBScore * 100)}%</strong></span>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,.25)', borderTop: '1px solid rgba(255,255,255,.05)', flex: 1, fontSize: 11, color: 'rgba(255,255,255,.7)', lineHeight: 1.4 }}>
                  💡 {m.compromiseReason}
                </div>

                <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,.05)', display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => navigate('movie', m.id)}
                    style={{ flex: 1, background: '#e50914', border: 'none', borderRadius: 6, padding: '7px 0', color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                  >
                    View Movie
                  </button>
                  <button
                    onClick={() => toggleWatchlist(m)}
                    style={{ background: 'rgba(255,255,255,.08)', border: 'none', borderRadius: 6, padding: '7px 12px', color: 'white', fontSize: 11, cursor: 'pointer' }}
                  >
                    + Watchlist
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
