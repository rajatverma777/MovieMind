// src/pages/ConsensusPage.jsx
// "Couch Consensus" — Real-Time Live Collaborative Movie Matcher between Added Cine-Friends

import { useState, useEffect, useRef } from 'react'
import { useApp } from '@/context/AppContext'
import { MOCK_MOVIES, GN, imgUrl } from '@/data/constants'
import MovieCard from '@/components/MovieCard'
import Spinner from '@/components/Spinner'
import AppleSegmentedControl from '@/components/AppleSegmentedControl'

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
    <div style={{
      minHeight: '100vh',
      padding: '24px 24px 200px',
      maxWidth: 1400,
      margin: '0 auto',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', -apple-system, sans-serif",
      backgroundImage: 'radial-gradient(ellipse 80% 40% at 50% -10%, rgba(10, 132, 255, 0.08) 0%, transparent 70%), radial-gradient(ellipse 60% 30% at 85% 15%, rgba(139, 92, 246, 0.06) 0%, transparent 60%)'
    }}>
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="fu" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: 9999,
            padding: '5px 14px',
            fontSize: 11.5,
            fontWeight: 650,
            color: '#ffffff',
            marginBottom: 10,
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.2)'
          }}>
            <span>🛋️</span> Real-Time Collaborative Matcher
          </div>
          <h1 style={{
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', sans-serif",
            fontSize: 'clamp(32px, 5vw, 44px)',
            fontWeight: 700,
            letterSpacing: -0.8,
            color: '#ffffff',
            marginBottom: 6,
            lineHeight: 1.15
          }}>
            Couch Consensus
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: 14, maxWidth: 650, margin: 0, fontWeight: 400 }}>
            Sync movie choices with your cine-friend in real time. Our harmonic Pareto engine finds the ideal film compromise.
          </p>
        </div>

        {/* Apple Segmented Control Pill Switcher */}
        <AppleSegmentedControl
          options={[
            { id: 'live', label: '🌐 Live Friend Matcher' },
            { id: 'local', label: '💻 Split-Screen' }
          ]}
          value={mode}
          onChange={setMode}
        />
      </div>

      {/* ── LIVE FRIEND SELECTOR BAR ─────────────────────────────────────── */}
      {mode === 'live' && (
        <div
          className="apple-glass-card fu d1"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.01) 100%)',
            backdropFilter: 'blur(40px) saturate(190%)',
            WebkitBackdropFilter: 'blur(40px) saturate(190%)',
            border: '1.2px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 24,
            padding: '20px 24px',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.35), inset 0 1px 1.5px rgba(255, 255, 255, 0.15)',
            marginBottom: 28
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>👥</span>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: '#ffffff', letterSpacing: -0.2 }}>
                Select Your Movie-Night Partner ({friends.length} Cine-Friends Added):
              </span>
            </div>

            <button
              onClick={() => navigate('friends')}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: 9999,
                padding: '6px 16px',
                fontSize: 12,
                fontWeight: 600,
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.28)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)'
              }}
            >
              + Manage Cine-Friends
            </button>
          </div>

          {/* Friends List Chips */}
          {friends.length > 0 ? (
            <div className="sx" style={{ paddingBottom: 6, display: 'flex', gap: 12 }}>
              {friends.map(f => {
                const fId = f.id || f._id
                const isSelected = selectedFriendId === fId
                const isOnline = realtime?.presenceMap?.[fId] === 'online'

                return (
                  <div
                    key={fId}
                    onClick={() => setSelectedFriend(f)}
                    style={{
                      background: isSelected ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.05)',
                      border: isSelected ? '1.5px solid rgba(255, 255, 255, 0.35)' : '1px solid rgba(255, 255, 255, 0.10)',
                      borderRadius: 20,
                      padding: '10px 18px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      flexShrink: 0,
                      boxShadow: isSelected ? '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.4)' : 'none',
                      transition: 'all 0.22s var(--apple-spring-smooth)'
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <span style={{ fontSize: 26 }}>{f.avatar || '🍿'}</span>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{f.displayName || f.name}</span>
                        {isSelected && (
                          <span style={{ fontSize: 10, background: '#0a84ff', color: 'white', padding: '2px 8px', borderRadius: 9999, fontWeight: 700, boxShadow: '0 2px 6px rgba(10, 132, 255, 0.4)' }}>
                            ✓ Active
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                        <span style={{ fontSize: 11.5, color: '#38bdf8', fontWeight: 600 }}>@{f.username}</span>
                        <span style={{ fontSize: 10, color: '#34d399', background: 'rgba(16,185,129,.14)', border: '1px solid rgba(16,185,129,.3)', padding: '2px 7px', borderRadius: 9999, fontWeight: 700 }}>
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
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.55)' }}>
                You haven't added any cine-friends yet. Connect with other movie buffs in the Community Hub to pair up!
              </div>

              {communityUsers.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', textTransform: 'uppercase', fontWeight: 700 }}>Quick Pair:</span>
                  {communityUsers.slice(0, 3).map(u => (
                    <button
                      key={u.id || u._id}
                      onClick={() => setSelectedFriend(u)}
                      style={{
                        background: (selectedFriend?.id || selectedFriend?._id) === (u.id || u._id) ? 'rgba(10, 132, 255, 0.25)' : 'rgba(255,255,255,.06)',
                        border: (selectedFriend?.id || selectedFriend?._id) === (u.id || u._id) ? '1px solid #0a84ff' : '1px solid rgba(255,255,255,.1)',
                        borderRadius: 9999, padding: '5px 12px',
                        color: 'white', fontSize: 11.5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
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
      <div className="fu d2" style={{ display: 'grid', gridTemplateColumns: mode === 'local' ? '1fr 1fr' : '1fr 380px', gap: 24, marginBottom: 36, alignItems: 'start' }}>
        {/* Your Profile Card */}
        <div
          className="apple-glass-card"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.01) 100%)',
            backdropFilter: 'blur(40px) saturate(190%)',
            WebkitBackdropFilter: 'blur(40px) saturate(190%)',
            border: '1.2px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 26,
            padding: 26,
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.35), inset 0 1px 1.5px rgba(255, 255, 255, 0.15)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 15,
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.25)'
              }}>
                {user?.avatar || '👑'}
              </div>
              <div>
                <input
                  type="text"
                  value={userName}
                  onChange={e => { setUserName(e.target.value); syncUpdate(isReady, selectedMovies, selectedGenres) }}
                  placeholder="Your Name"
                  style={{ background: 'none', border: 'none', borderBottom: '1.5px dashed rgba(255,255,255,.3)', color: 'white', fontSize: 18, fontWeight: 700, outline: 'none', width: 170, fontFamily: 'inherit' }}
                />
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>
                  @{user?.username || 'you'} · Session Host (You)
                </div>
              </div>
            </div>

            {/* Ready Button */}
            <button
              onClick={handleToggleReady}
              style={{
                background: isReady ? '#34d399' : 'rgba(255, 255, 255, 0.09)',
                color: isReady ? '#090910' : 'rgba(255, 255, 255, 0.9)',
                border: isReady ? 'none' : '1px solid rgba(255, 255, 255, 0.16)',
                borderRadius: 9999,
                padding: '8px 22px',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: isReady ? '0 4px 18px rgba(52, 211, 153, 0.45), inset 0 1px 1px #ffffff' : '0 2px 8px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              {isReady ? '✓ You Are Ready!' : 'Mark as Ready'}
            </button>
          </div>

          {/* Genres */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 650, color: 'rgba(255,255,255,.65)', marginBottom: 10, letterSpacing: -0.2 }}>
              Select Favorite Genres Tonight:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {Object.entries(GN).slice(0, 10).map(([id, name]) => {
                const active = selectedGenres.includes(+id)
                return (
                  <button
                    key={id}
                    onClick={() => toggleGenreSelection(+id)}
                    style={{
                      background: active ? 'rgba(10, 132, 255, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                      border: active ? '1px solid rgba(10, 132, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: 9999,
                      padding: '6px 16px',
                      fontSize: 12,
                      color: active ? '#ffffff' : 'rgba(255, 255, 255, 0.75)',
                      cursor: 'pointer',
                      fontWeight: active ? 650 : 500,
                      boxShadow: active ? '0 4px 14px rgba(10, 132, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)' : 'none',
                      transition: 'all 0.2s var(--apple-spring-smooth)'
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
                        e.currentTarget.style.color = '#ffffff'
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)'
                      }
                    }}
                  >
                    {name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected Movies Tray */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 650, color: 'rgba(255,255,255,.65)', marginBottom: 10 }}>
              Your Selected Inspirations ({selectedMovies.length}):
            </div>
            {selectedMovies.length === 0 ? (
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', fontStyle: 'italic', padding: '12px 0' }}>
                No films selected yet. Pick 2-3 films from the catalog below!
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6 }}>
                {selectedMovies.map(m => (
                  <div key={m.id} style={{ position: 'relative', width: 72, flexShrink: 0, textAlign: 'center' }}>
                    <img
                      src={imgUrl(m.poster_path, 'w92') || `https://placehold.co/72x100/222/999?text=${m.title[0]}`}
                      alt={m.title}
                      style={{ width: 72, height: 100, borderRadius: 10, objectFit: 'cover', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}
                    />
                    <button
                      onClick={() => toggleMovieSelection(m)}
                      style={{
                        position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%',
                        background: 'rgba(0, 0, 0, 0.75)', border: '1px solid rgba(255, 255, 255, 0.35)', color: '#ffffff',
                        fontSize: 10, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                      title="Remove film"
                    >
                      ✕
                    </button>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.8)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.title}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Catalog Picker */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'white', letterSpacing: -0.2 }}>
                Quick Movie Picker:
              </span>
              <input
                type="text"
                value={movieQuery}
                onChange={e => setMovieQuery(e.target.value)}
                placeholder="Search catalog..."
                style={{
                  background: 'rgba(255, 255, 255, 0.07)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  borderRadius: 9999,
                  padding: '5px 14px',
                  fontSize: 12,
                  color: 'white',
                  outline: 'none',
                  width: 140
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(115px,1fr))', gap: 10, maxHeight: 230, overflowY: 'auto', paddingRight: 4 }}>
              {filteredCatalog.slice(0, 12).map(m => {
                const isSelected = selectedMovies.some(sm => sm.id === m.id)
                return (
                  <div
                    key={m.id}
                    onClick={() => toggleMovieSelection(m)}
                    style={{
                      background: isSelected ? 'rgba(10, 132, 255, 0.16)' : 'rgba(255,255,255,.03)',
                      border: isSelected ? '1.2px solid rgba(10, 132, 255, 0.5)' : '1px solid rgba(255,255,255,.08)',
                      borderRadius: 12,
                      padding: 7,
                      cursor: 'pointer',
                      textAlign: 'center',
                      boxShadow: isSelected ? '0 4px 14px rgba(10, 132, 255, 0.25)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <img
                      src={imgUrl(m.poster_path, 'w92')}
                      alt={m.title}
                      style={{ width: '100%', height: 74, objectFit: 'cover', borderRadius: 8, marginBottom: 5 }}
                    />
                    <div style={{ fontSize: 10.5, color: 'white', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.title}
                    </div>
                    <div style={{ fontSize: 9.5, fontWeight: 650, marginTop: 2, color: isSelected ? '#38bdf8' : 'rgba(255,255,255,.45)' }}>
                      {isSelected ? '✓ Added' : '+ Add'}
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
            <div
              className="apple-glass-card"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.01) 100%)',
                backdropFilter: 'blur(40px) saturate(190%)',
                WebkitBackdropFilter: 'blur(40px) saturate(190%)',
                border: '1.2px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 26,
                padding: 24,
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.35), inset 0 1px 1.5px rgba(255, 255, 255, 0.15)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
                  }}>
                    {selectedFriend?.avatar || '👥'}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>
                      {selectedFriend?.displayName || selectedFriend?.name || 'No Friend Selected'}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#38bdf8', fontWeight: 600 }}>
                      @{selectedFriend?.username || 'partner'} · {isSelectedFriendOnline ? '🟢 Live Online' : '⚪ Offline'}
                    </div>
                  </div>
                </div>

                {/* Ready Badge */}
                <span style={{
                  fontSize: 10.5, fontWeight: 700, padding: '4px 11px', borderRadius: 9999,
                  background: isPartnerReady ? 'rgba(16,185,129,.18)' : 'rgba(251,191,36,.14)',
                  color: isPartnerReady ? '#34d399' : '#fbbf24',
                  border: `1px solid ${isPartnerReady ? 'rgba(16,185,129,.35)' : 'rgba(251,191,36,.3)'}`,
                  boxShadow: isPartnerReady ? '0 0 12px rgba(16,185,129,.25)' : 'none'
                }}>
                  {isPartnerReady ? '✓ Friend is Ready' : 'Syncing picks'}
                </span>
              </div>

              {/* Quick Live Invite Button */}
              {selectedFriend && (
                <div style={{ marginBottom: 18 }}>
                  <button
                    onClick={sendLiveInviteToFriend}
                    disabled={inviteStatus === 'sending'}
                    style={{
                      width: '100%',
                      background: inviteStatus === 'sent' ? 'rgba(16,185,129,.16)' : 'rgba(255, 255, 255, 0.08)',
                      borderColor: inviteStatus === 'sent' ? 'rgba(16,185,129,.4)' : 'rgba(255, 255, 255, 0.14)',
                      border: '1px solid',
                      borderRadius: 9999,
                      color: inviteStatus === 'sent' ? '#34d399' : '#ffffff',
                      padding: '10px 16px',
                      fontSize: 12.5,
                      fontWeight: 650,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.18)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => {
                      if (inviteStatus !== 'sent') e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                    }}
                    onMouseLeave={e => {
                      if (inviteStatus !== 'sent') e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    <span>{inviteStatus === 'sent' ? '✓ In-App Alert Sent to Friend!' : inviteStatus === 'sending' ? 'Sending Alert...' : `📢 Send Live Alert to @${selectedFriend.username}`}</span>
                  </button>
                </div>
              )}

              {/* Friend's Chosen Genres */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>
                  Friend's Favorite Genres:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {partnerGenres.map(gid => (
                    <span key={gid} style={{ background: 'rgba(255,255,255,.08)', padding: '4px 10px', borderRadius: 9999, fontSize: 11, color: 'rgba(255, 255, 255, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      {GN[gid] || 'Genre'}
                    </span>
                  ))}
                </div>
              </div>

              {/* Friend's Movie Inspirations */}
              <div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>
                  Friend's Movie Picks ({partnerMovies.length}):
                </div>
                {partnerMovies.length === 0 ? (
                  <div style={{ padding: '20px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 14, fontSize: 12, color: 'rgba(255,255,255,0.45)', fontStyle: 'italic', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.08)' }}>
                    No films selected yet by @{selectedFriend?.username || 'partner'}. Once they pick on their screen, their films appear here live!
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
                    {partnerMovies.map(m => (
                      <div key={m.id} style={{ width: 60, flexShrink: 0, textAlign: 'center' }}>
                        <img
                          src={imgUrl(m.poster_path, 'w92') || `https://placehold.co/60x84/222/999?text=${m.title[0]}`}
                          alt={m.title}
                          style={{ width: 60, height: 84, borderRadius: 8, objectFit: 'cover' }}
                        />
                        <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,.75)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
          <div
            className="apple-glass-card"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.01) 100%)',
              backdropFilter: 'blur(40px) saturate(190%)',
              WebkitBackdropFilter: 'blur(40px) saturate(190%)',
              border: '1.2px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 26,
              padding: 26,
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.35), inset 0 1px 1.5px rgba(255, 255, 255, 0.15)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 15,
                  background: 'rgba(167, 139, 250, 0.12)',
                  border: '1px solid rgba(167, 139, 250, 0.28)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
                }}>
                  👥
                </div>
                <div>
                  <input
                    type="text"
                    value={localNameB}
                    onChange={e => setLocalNameB(e.target.value)}
                    style={{ background: 'none', border: 'none', borderBottom: '1.5px dashed rgba(255,255,255,.3)', color: 'white', fontSize: 18, fontWeight: 700, outline: 'none', width: 170 }}
                    placeholder="Partner Name"
                  />
                  <div style={{ fontSize: 11, color: '#c4b5fd', marginTop: 2 }}>
                    Couch Partner · Split Screen
                  </div>
                </div>
              </div>

              {/* Ready Button for Partner */}
              <button
                onClick={() => setIsReadyB(!isReadyB)}
                style={{
                  background: isReadyB ? '#34d399' : 'rgba(255, 255, 255, 0.09)',
                  color: isReadyB ? '#090910' : 'rgba(255, 255, 255, 0.9)',
                  border: isReadyB ? 'none' : '1px solid rgba(255, 255, 255, 0.16)',
                  borderRadius: 9999,
                  padding: '8px 22px',
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: isReadyB ? '0 4px 18px rgba(52, 211, 153, 0.45)' : '0 2px 8px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.2s ease'
                }}
              >
                {isReadyB ? '✓ Partner is Ready!' : 'Mark as Ready'}
              </button>
            </div>

            {/* Genres B */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 650, color: 'rgba(255,255,255,.65)', marginBottom: 10 }}>
                Select Favorite Genres:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {Object.entries(GN).slice(0, 10).map(([id, name]) => {
                  const active = localGenresB.includes(+id)
                  return (
                    <button
                      key={id}
                      onClick={() => setLocalGenresB(prev => prev.includes(+id) ? prev.filter(x => x !== +id) : [...prev, +id])}
                      style={{
                        background: active ? 'rgba(167, 139, 250, 0.25)' : 'rgba(255,255,255,.06)',
                        border: active ? '1px solid rgba(167, 139, 250, 0.5)' : '1px solid rgba(255,255,255,.12)',
                        borderRadius: 9999,
                        padding: '6px 16px',
                        fontSize: 12,
                        color: active ? '#ffffff' : 'rgba(255,255,255,.75)',
                        cursor: 'pointer',
                        fontWeight: active ? 650 : 500,
                        boxShadow: active ? '0 4px 14px rgba(167, 139, 250, 0.3)' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Movies B Inspirations Tray */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 650, color: 'rgba(255,255,255,.65)', marginBottom: 10 }}>
                Partner's Selected Inspirations ({localMoviesB.length}):
              </div>
              {localMoviesB.length === 0 ? (
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', fontStyle: 'italic', padding: '12px 0' }}>
                  No films selected yet. Pick 2-3 films from the catalog below!
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6 }}>
                  {localMoviesB.map(m => (
                    <div key={m.id} style={{ position: 'relative', width: 72, flexShrink: 0, textAlign: 'center' }}>
                      <img
                        src={imgUrl(m.poster_path, 'w92') || `https://placehold.co/72x100/222/999?text=${m.title[0]}`}
                        alt={m.title}
                        style={{ width: 72, height: 100, borderRadius: 10, objectFit: 'cover' }}
                      />
                      <button
                        onClick={() => toggleMovieBSelection(m)}
                        style={{
                          position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%',
                          background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(255,255,255,0.35)', color: 'white',
                          fontSize: 10, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                        title="Remove movie"
                      >
                        ✕
                      </button>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.8)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.title}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Catalog Picker for Partner B */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>
                  Partner Movie Picker:
                </span>
                <input
                  type="text"
                  value={movieQueryB}
                  onChange={e => setMovieQueryB(e.target.value)}
                  placeholder="Search catalog..."
                  style={{
                    background: 'rgba(255, 255, 255, 0.07)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    borderRadius: 9999,
                    padding: '5px 14px',
                    fontSize: 12,
                    color: 'white',
                    outline: 'none',
                    width: 140
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(115px,1fr))', gap: 10, maxHeight: 230, overflowY: 'auto', paddingRight: 4 }}>
                {filteredCatalogB.slice(0, 12).map(m => {
                  const isSelected = localMoviesB.some(sm => sm.id === m.id)
                  return (
                    <div
                      key={m.id}
                      onClick={() => toggleMovieBSelection(m)}
                      style={{
                        background: isSelected ? 'rgba(167, 139, 250, 0.16)' : 'rgba(255,255,255,.03)',
                        border: isSelected ? '1.2px solid rgba(167, 139, 250, 0.5)' : '1px solid rgba(255,255,255,.08)',
                        borderRadius: 12,
                        padding: 7,
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <img
                        src={imgUrl(m.poster_path, 'w92')}
                        alt={m.title}
                        style={{ width: '100%', height: 74, objectFit: 'cover', borderRadius: 8, marginBottom: 5 }}
                      />
                      <div style={{ fontSize: 10.5, color: 'white', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.title}
                      </div>
                      <div style={{ fontSize: 9.5, fontWeight: 650, marginTop: 2, color: isSelected ? '#c4b5fd' : 'rgba(255,255,255,.45)' }}>
                        {isSelected ? '✓ Added' : '+ Add'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── ACTION TRIGGER (Apple Liquid Glass Pill CTA) ──────────────────── */}
      <div style={{ textAlign: 'center', marginTop: 36, marginBottom: 48, position: 'relative', zIndex: 10 }}>
        <button
          onClick={handleCompute}
          disabled={busy}
          className="apple-glass-pill"
          style={{
            background: (mode === 'live' ? (isReady && isPartnerReady) : (isReady && isReadyB))
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(10, 132, 255, 0.95) 100%)'
              : 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(30px) saturate(200%)',
            WebkitBackdropFilter: 'blur(30px) saturate(200%)',
            border: '1.2px solid rgba(255, 255, 255, 0.28)',
            borderRadius: 9999,
            padding: '16px 48px',
            color: 'white',
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: (mode === 'live' ? (isReady && isPartnerReady) : (isReady && isReadyB))
              ? '0 16px 44px rgba(16, 185, 129, 0.45), inset 0 1.5px 2px rgba(255, 255, 255, 0.6)'
              : '0 16px 44px rgba(0, 0, 0, 0.45), inset 0 1.5px 2px rgba(255, 255, 255, 0.35)',
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
          <div
            className="apple-glass-card"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(40px)',
              border: '1.2px solid rgba(255, 255, 255, 0.14)',
              borderRadius: 24,
              padding: '24px 28px',
              marginBottom: 32,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.35), inset 0 1px 1.5px rgba(255, 255, 255, 0.18)'
            }}
          >
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '.6px' }}>
                Algorithmic Agreement Found
              </div>
              <div style={{ fontSize: 22, color: 'white', fontWeight: 700, marginTop: 4, letterSpacing: -0.4 }}>
                Shared Common Ground: {results.sharedGenres?.join(' & ') || 'High-Stakes Dramatic Alignment'}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', marginTop: 4 }}>
                Calculated using harmonic distance minimization so both {userName} and {selectedFriend?.displayName || selectedFriend?.name || localNameB} are equally satisfied.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#34d399' }}>
                  {Math.round((results.recommendations[0]?.consensusScore || 0.88) * 100)}%
                </div>
                <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', fontWeight: 650 }}>Consensus Match</div>
              </div>
              <div style={{ width: 1, height: 38, background: 'rgba(255,255,255,.14)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#38bdf8' }}>
                  {results.recommendations?.length || 0}
                </div>
                <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', fontWeight: 650 }}>Films Agreed</div>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
            {results.recommendations.map(m => (
              <div
                key={m.id}
                className="apple-glass-card"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1.2px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 20,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
                  transition: 'all 0.22s var(--apple-spring)'
                }}
              >
                <div style={{ display: 'flex', gap: 14, padding: 16 }}>
                  <img
                    src={imgUrl(m.poster_path, 'w185') || `https://placehold.co/74x110/222/999?text=${m.title[0]}`}
                    alt={m.title}
                    onClick={() => navigate('movie', m.id)}
                    style={{ width: 76, height: 112, borderRadius: 10, objectFit: 'cover', cursor: 'pointer', flexShrink: 0, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4
                      onClick={() => navigate('movie', m.id)}
                      style={{ fontSize: 15.5, fontWeight: 700, color: 'white', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {m.title}
                    </h4>

                    <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>
                      ⭐ {m.vote_average?.toFixed(1)} · {m.release_date?.split('-')[0]}
                    </div>

                    <div style={{ marginTop: 8, display: 'inline-block', background: 'rgba(16,185,129,.14)', border: '1px solid rgba(16,185,129,.35)', borderRadius: 8, padding: '3px 9px', fontSize: 11, fontWeight: 700, color: '#34d399' }}>
                      ⚡ {Math.round(m.consensusScore * 100)}% Consensus Match
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 7, fontSize: 10.5, color: 'rgba(255,255,255,.55)' }}>
                      <span>{userName}: <strong style={{ color: '#38bdf8' }}>{Math.round(m.userAScore * 100)}%</strong></span>
                      <span>{selectedFriend?.displayName || selectedFriend?.name || localNameB}: <strong style={{ color: '#c4b5fd' }}>{Math.round(m.userBScore * 100)}%</strong></span>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,.2)', borderTop: '1px solid rgba(255,255,255,.06)', flex: 1, fontSize: 11.5, color: 'rgba(255,255,255,.75)', lineHeight: 1.45 }}>
                  💡 {m.compromiseReason}
                </div>

                <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,.06)', display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => navigate('movie', m.id)}
                    style={{
                      flex: 1,
                      background: '#0a84ff',
                      border: 'none',
                      borderRadius: 9999,
                      padding: '8px 0',
                      color: 'white',
                      fontSize: 12,
                      fontWeight: 650,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(10, 132, 255, 0.35)'
                    }}
                  >
                    View Movie
                  </button>
                  <button
                    onClick={() => toggleWatchlist(m)}
                    style={{
                      background: 'rgba(255,255,255,.08)',
                      border: '1px solid rgba(255,255,255,.14)',
                      borderRadius: 9999,
                      padding: '8px 16px',
                      color: 'white',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
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
