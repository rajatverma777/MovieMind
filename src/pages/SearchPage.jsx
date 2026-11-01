import { useState, useEffect, useRef, useCallback } from 'react'
import { useApp } from '@/context/AppContext'
import { MOCK_MOVIES, GN } from '@/data/constants'
import MovieCard from '@/components/MovieCard'
import SearchBar from '@/components/SearchBar'
import Spinner from '@/components/Spinner'
import AppleSegmentedControl from '@/components/AppleSegmentedControl'
import AppleSlider from '@/components/AppleSlider'

const VAGUE_PRESETS = [
  { label: '📞 Phone booth with sniper', query: 'trapped in a phone booth with a sniper on the phone' },
  { label: '🌀 Dreams inside dreams', query: 'entering dreams to plant an idea subconscious heist' },
  { label: '🤖 Cyberpunk red pill', query: 'dystopian computer hacker joins rebellion against machines' },
  { label: '🥁 Ruthless jazz instructor', query: 'ruthless music teacher drives young drummer to obsession' },
  { label: '🔪 Mansion family murder', query: 'eccentric detective investigates wealthy novelist death in mansion' },
  { label: '🌌 Black hole & time travel', query: 'explorers travel through wormhole to save humanity space time dilation' },
  { label: '🧼 Underground fight therapy', query: 'insomniac office worker starts underground bare-knuckle fighting club' },
  { label: '🏠 Imposter family in basement', query: 'poor family infiltrates wealthy household and finds secret basement' },
]

export default function SearchPage() {
  const { user, tmdb, isDemo, navigate, setActiveChatFriend } = useApp()
  const myId = user?.id || user?._id

  // ── Top-level Search Category: 'movies' (Default) | 'users' ───────────────
  const [searchCategory, setSearchCategoryState] = useState(() => {
    try {
      return sessionStorage.getItem('cm_search_category') || 'movies'
    } catch {
      return 'movies'
    }
  })

  const setSearchCategory = (cat) => {
    setSearchCategoryState(cat)
    try {
      sessionStorage.setItem('cm_search_category', cat)
    } catch {}
  }

  // ── Movies Search State ───────────────────────────────────────────────────
  const [mode, setMode] = useState('title') // 'title' | 'vague'
  const [q, setQ] = useState('')
  const [res, setRes] = useState([])
  const [minRating, setMinRating] = useState(0)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [explanation, setExplanation] = useState('')
  const debRef = useRef(null)

  // ── User / Cinephiles Search State ────────────────────────────────────────
  const [userQuery, setUserQueryState] = useState(() => {
    try {
      return sessionStorage.getItem('cm_search_user_query') || ''
    } catch {
      return ''
    }
  })

  const setUserQuery = (val) => {
    setUserQueryState(val)
    try {
      sessionStorage.setItem('cm_search_user_query', val)
    } catch {}
  }
  const [userResults, setUserResults] = useState([])
  const [searchingUsers, setSearchingUsers] = useState(false)
  const [userSearchDone, setUserSearchDone] = useState(false)
  const [friends, setFriends] = useState([])
  const [outgoingRequests, setOutgoingRequests] = useState([])
  const [incomingRequests, setIncomingRequests] = useState([])
  const [actionStatus, setActionStatus] = useState({})

  // Load existing friends and requests for accurate status buttons
  useEffect(() => {
    if (!myId) return
    const loadSocial = async () => {
      try {
        const [fRes, rRes] = await Promise.all([
          fetch(`/api/social/friends?me=${encodeURIComponent(myId)}`).then(r => r.json()).catch(() => ({ friends: [] })),
          fetch(`/api/social/friend-requests?me=${encodeURIComponent(myId)}`).then(r => r.json()).catch(() => ({ incoming: [], outgoing: [] }))
        ])
        setFriends(fRes.friends || [])
        setIncomingRequests(rRes.incoming || [])
        setOutgoingRequests(rRes.outgoing || [])
      } catch (err) {
        console.warn('Error loading social state in search:', err)
      }
    }
    loadSocial()
  }, [myId])

  // User search debounced effect
  useEffect(() => {
    if (searchCategory !== 'users') return
    const trimmed = userQuery.trim()
    if (!trimmed) {
      setUserResults([])
      setSearchingUsers(false)
      setUserSearchDone(false)
      return
    }

    setSearchingUsers(true)
    setUserSearchDone(true)
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/social/users/search?q=${encodeURIComponent(trimmed)}&me=${encodeURIComponent(myId || '')}`).then(r => r.json())
        setUserResults(res.users || [])
      } catch (err) {
        console.warn('Error searching cinephiles:', err)
        setUserResults([])
      } finally {
        setSearchingUsers(false)
      }
    }, 300)

    return () => clearTimeout(t)
  }, [userQuery, searchCategory, myId])

  // Friend actions
  const handleSendFriendRequest = async (targetUser) => {
    const targetId = targetUser.id || targetUser._id
    if (!myId || !targetId) return
    setActionStatus(prev => ({ ...prev, [targetId]: 'sending' }))
    try {
      const res = await fetch('/api/social/friend-request/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUserId: myId, toUserId: targetId })
      }).then(r => r.json())
      if (res.success) {
        setActionStatus(prev => ({ ...prev, [targetId]: 'sent' }))
        setOutgoingRequests(prev => [
          ...prev,
          {
            id: res.request?.id || `req_${Date.now()}`,
            fromUserId: myId,
            toUserId: targetId,
            status: 'pending'
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
      }
    } catch (err) {
      console.warn('Error canceling request:', err)
    }
  }

  const openChatWithFriend = (targetUser) => {
    setActiveChatFriend(targetUser)
    navigate('messages')
  }

  // ── Movies Search Callbacks ───────────────────────────────────────────────
  const doTitleSearch = useCallback(async query => {
    if (!query.trim()) { setRes([]); setDone(false); setExplanation(''); return }
    setBusy(true); setDone(true); setExplanation('')
    try {
      if (isDemo) {
        await new Promise(r => setTimeout(r, 200))
        setRes(MOCK_MOVIES.filter(m => m.title.toLowerCase().includes(query.toLowerCase())))
      } else if (tmdb) {
        const d = await tmdb.search(query)
        setRes(d.results || [])
      }
    } catch {
      setRes(MOCK_MOVIES.filter(m => m.title.toLowerCase().includes(query.toLowerCase())))
    } finally {
      setBusy(false)
    }
  }, [tmdb, isDemo])

  const doSemanticSearch = useCallback(async query => {
    if (!query.trim()) { setRes([]); setDone(false); setExplanation(''); return }
    setBusy(true); setDone(true)
    try {
      const response = await fetch('/api/search/semantic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          candidatePool: MOCK_MOVIES,
          limit: 12
        })
      })

      if (response.ok) {
        const data = await response.json()
        setRes(data.results || [])
        setExplanation(data.explanation || '')
      } else {
        throw new Error('Server semantic search failed')
      }
    } catch {
      const qLower = query.toLowerCase()
      const words = qLower.split(/\s+/).filter(w => w.length > 2)
      const matches = MOCK_MOVIES.map(m => {
        const text = `${m.title} ${m.overview}`.toLowerCase()
        const hits = words.filter(w => text.includes(w)).length
        return {
          ...m,
          semanticScore: hits > 0 ? Math.min(0.95, (hits / words.length)) : 0,
          matchReason: hits > 0 ? `Matched ${hits} narrative keywords in plot` : 'Broad thematic similarity'
        }
      })
      .filter(m => m.semanticScore > 0)
      .sort((a, b) => b.semanticScore - a.semanticScore)

      setRes(matches)
      setExplanation(`Found ${matches.length} conceptually matched films.`)
    } finally {
      setBusy(false)
    }
  }, [])

  const browseGenre = async id => {
    setBusy(true); setDone(true); setQ(''); setExplanation('')
    try {
      if (isDemo) setRes(MOCK_MOVIES.filter(m => m.genre_ids?.includes(id)))
      else if (tmdb) { const d = await tmdb.genre([id]); setRes(d.results || []) }
    } catch {
      setRes(MOCK_MOVIES.filter(m => m.genre_ids?.includes(id)))
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (searchCategory !== 'movies') return
    clearTimeout(debRef.current)
    if (mode === 'title') {
      debRef.current = setTimeout(() => doTitleSearch(q), 350)
    } else {
      debRef.current = setTimeout(() => doSemanticSearch(q), 500)
    }
    return () => clearTimeout(debRef.current)
  }, [q, mode, searchCategory, doTitleSearch, doSemanticSearch])

  return (
    <div style={{ minHeight: '100vh', padding: '24px 20px 140px', maxWidth: 1200, margin: '0 auto', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'DM Sans', sans-serif" }}>
      {/* ── Top Level Category Switcher: Movies (Default) vs Users ─────────── */}
      <div className="fu" style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
        <AppleSegmentedControl
          options={[
            { id: 'movies', label: '🎬 Movies' },
            { id: 'users', label: '👤 People' }
          ]}
          value={searchCategory}
          onChange={setSearchCategory}
        />
      </div>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ── 1. MOVIES SEARCH VIEW (DEFAULT) ─────────────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {searchCategory === 'movies' && (
        <>
          {/* Header */}
          <div className="fu" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Bebas Neue', cursive", fontSize: 'clamp(36px,6vw,52px)', letterSpacing: 1.5, color: 'white', marginBottom: 4, lineHeight: 1 }}>
                Discovery & <span style={{ color: '#e50914' }}>Search</span>
              </h1>
              <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 13 }}>
                Search by title, or describe a scene you vaguely remember.
              </p>
            </div>

            {/* Apple Segmented Control Mode Switcher */}
            <AppleSegmentedControl
              options={[
                { id: 'title', label: '🔍 Title' },
                { id: 'vague', label: '🧠 AI Search' }
              ]}
              value={mode}
              onChange={val => { setMode(val); setDone(false); setQ('') }}
            />
          </div>

          {/* Search Input */}
          <div className="fu d1" style={{ marginBottom: 20 }}>
            {mode === 'title' ? (
              <SearchBar value={q} onChange={setQ} />
            ) : (
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: 50,
                    borderRadius: 9999,
                    background: 'rgba(139, 92, 246, 0.08)',
                    backgroundImage: 'linear-gradient(135deg, rgba(139, 92, 246, 0.14) 0%, rgba(255, 255, 255, 0.02) 100%)',
                    backdropFilter: 'blur(28px) saturate(190%)',
                    WebkitBackdropFilter: 'blur(28px) saturate(190%)',
                    border: '1.2px solid rgba(139, 92, 246, 0.35)',
                    padding: '0 16px',
                    gap: 12,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35), inset 0 1px 1.5px rgba(255, 255, 255, 0.22)'
                  }}
                >
                  <span style={{ fontSize: 18, color: '#a78bfa' }}>🧠</span>
                  <input
                    type="text"
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    placeholder="Describe that film you can't remember... (e.g. 'time loop on an alien beach')"
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      outline: 'none',
                      color: 'white',
                      caretColor: '#a78bfa',
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'DM Sans', sans-serif",
                      fontSize: 14.5
                    }}
                  />
                  {q && (
                    <button
                      onClick={() => setQ('')}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.16)',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: 10.5,
                        fontWeight: 800,
                        padding: 0
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Vague Preset Chips */}
                <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', fontWeight: 600 }}>Try asking:</span>
                  {VAGUE_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQ(p.query)}
                      style={{
                        background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
                        borderRadius: 16, padding: '4px 12px', fontSize: 11, color: 'rgba(255,255,255,.7)',
                        cursor: 'pointer', transition: 'all .2s'
                      }}
                      onMouseOver={e => { e.currentTarget.style.background = 'rgba(139,92,246,.15)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,.4)' }}
                      onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)' }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Genre browser (Only in Title mode when not searching) */}
          {mode === 'title' && !done && (
            <div className="fu d2">
              <h2 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 24, color: 'white', marginBottom: 13 }}>Browse by Genre</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {Object.entries(GN).map(([id, name]) => (
                  <button key={id} onClick={() => browseGenre(+id)}
                    style={{ padding: '8px 17px', borderRadius: 22, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', cursor: 'pointer', color: 'rgba(255,255,255,.68)', fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 500, transition: 'all .2s' }}
                    onMouseOver={e => { e.target.style.borderColor = 'rgba(229,9,20,.42)'; e.target.style.color = 'white'; e.target.style.background = 'rgba(229,9,20,.07)' }}
                    onMouseOut={e =>  { e.target.style.borderColor = 'rgba(255,255,255,.08)'; e.target.style.color = 'rgba(255,255,255,.68)'; e.target.style.background = 'rgba(255,255,255,.04)' }}>
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {busy && <div style={{ display: 'flex', justifyContent: 'center', padding: 56 }}><Spinner size={44} /></div>}

          {/* AI Explanation Callout for Vague Search */}
          {!busy && done && explanation && (
            <div className="fu" style={{ marginBottom: 20, padding: '14px 18px', background: 'rgba(139,92,246,.08)', border: '1px solid rgba(139,92,246,.25)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>💡</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '.6px' }}>AI Semantic Reasoning</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.85)', marginTop: 2 }}>{explanation}</div>
              </div>
            </div>
          )}

          {/* Results */}
          {!busy && done && (
            <div className="fu" style={{ marginTop: 16 }}>
              {res.length ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 16 }}>
                    <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 13, margin: 0 }}>
                      Found <strong style={{ color: 'white' }}>{res.filter(m => !minRating || (m.vote_average || 0) >= minRating).length}</strong> {mode === 'vague' ? 'semantic matches' : 'results'}
                      {q && <> for "<strong style={{ color: mode === 'vague' ? '#a78bfa' : '#e50914' }}>{q}</strong>"</>}
                    </p>

                    {/* Apple Liquid Glass Slider for Minimum Rating Filter */}
                    <div className="apple-glass-card" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '6px 16px', borderRadius: 100 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>
                        ⭐ Min Rating: <strong style={{ color: '#fbbf24' }}>{minRating > 0 ? `${minRating.toFixed(1)}+` : 'All'}</strong>
                      </span>
                      <div style={{ width: 120 }}>
                        <AppleSlider
                          min={0}
                          max={9}
                          step={0.5}
                          value={minRating}
                          onChange={setMinRating}
                          color="#007aff"
                        />
                      </div>
                      {minRating > 0 && (
                        <button
                          onClick={() => setMinRating(0)}
                          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 11, padding: 0 }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(168px,1fr))', gap: 16 }}>
                    {res.filter(m => !minRating || (m.vote_average || 0) >= minRating).map(m => (
                      <div key={m.id} style={{ position: 'relative' }}>
                        <MovieCard movie={m} />
                        {m.matchReason && (
                          <div style={{ marginTop: 6, padding: '5px 8px', background: 'rgba(139,92,246,.12)', border: '1px solid rgba(139,92,246,.2)', borderRadius: 6, fontSize: 10, color: '#c4b5fd', lineHeight: 1.3 }}>
                            🎯 {m.matchReason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '56px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                  <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 26, color: 'white' }}>No movies found</h3>
                  <p style={{ color: 'rgba(255,255,255,.38)', marginTop: 7, fontSize: 13 }}>
                    {mode === 'vague' ? 'Try describing the plot using specific keywords, character goals, or setting details.' : 'Try a different title or browse by genre above.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ── 2. CINEPHILES & USERS SEARCH VIEW ───────────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {searchCategory === 'users' && (
        <div className="fu">
          {/* Header */}
          <div style={{ marginBottom: 22 }}>
            <h1 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 'clamp(36px,6vw,52px)', letterSpacing: 1.5, color: 'white', marginBottom: 4, lineHeight: 1 }}>
              Find <span style={{ color: '#38bdf8' }}>Cinephiles</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 13 }}>
              Search by @username or name, check compatibility, and connect.
            </p>
          </div>

          {/* User Search Input (Apple Liquid Glass Capsule) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              height: 50,
              borderRadius: 9999,
              background: 'rgba(56, 189, 248, 0.08)',
              backgroundImage: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(255, 255, 255, 0.02) 100%)',
              border: '1.2px solid rgba(56, 189, 248, 0.35)',
              padding: '0 16px',
              gap: 12,
              backdropFilter: 'blur(28px) saturate(190%)',
              WebkitBackdropFilter: 'blur(28px) saturate(190%)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35), inset 0 1px 1.5px rgba(255, 255, 255, 0.22)',
              marginBottom: 24
            }}
          >
            <span style={{ fontSize: 18, color: '#38bdf8' }}>🔍</span>
            <input
              type="text"
              value={userQuery}
              onChange={e => setUserQuery(e.target.value)}
              placeholder="Search cinephiles by unique @username or name (e.g. alok, pratik, rajat)..."
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                outline: 'none',
                color: 'white',
                caretColor: '#38bdf8',
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'DM Sans', sans-serif",
                fontSize: 14.5
              }}
            />
            {userQuery && (
              <button
                onClick={() => { setUserQuery(''); setUserResults([]); setUserSearchDone(false); }}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.16)',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: 10.5,
                  fontWeight: 800,
                  padding: 0
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Searching Spinner */}
          {searchingUsers && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
              <Spinner size={36} />
            </div>
          )}

          {/* Empty initial state before typing */}
          {!searchingUsers && !userQuery && (
            <div style={{ textAlign: 'center', padding: '64px 0' }} className="fu">
              <div style={{ fontSize: 44, marginBottom: 12 }}>👤</div>
              <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 26, color: 'white', marginBottom: 6 }}>
                Discover Fellow Cinephiles
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, maxWidth: 440, margin: '0 auto' }}>
                Type any username or name above to find other movie buffs, check taste compatibility, and send friend requests.
              </p>
            </div>
          )}

          {/* User Results List */}
          {!searchingUsers && userSearchDone && (
            <div>
              {userResults.length > 0 ? (
                <>
                  <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 12, marginBottom: 16 }}>
                    Found <strong style={{ color: 'white' }}>{userResults.length}</strong> cinephile{userResults.length !== 1 ? 's' : ''} for "<strong style={{ color: '#38bdf8' }}>{userQuery}</strong>"
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {userResults.map(targetUser => {
                      const targetId = targetUser.id || targetUser._id
                      const isAlreadyFriend = friends.some(f => (f.id || f._id) === targetId)
                      const outgoingReq = outgoingRequests.find(r => r.toUserId === targetId || (r.user?.id || r.user?._id) === targetId)
                      const incomingReq = incomingRequests.find(r => r.fromUserId === targetId || (r.user?.id || r.user?._id) === targetId)
                      const status = actionStatus[targetId]
                      const matchScore = targetUser.tasteMatchScore ?? targetUser.tasteCompatibility ?? 0

                      return (
                        <div
                          key={targetId}
                          style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: 16,
                            padding: '16px 20px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 14,
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {/* User Info */}
                          <div
                            onClick={() => navigate('profile', targetUser)}
                            style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
                            title={`View @${targetUser.username}'s public profile`}
                          >
                            <div
                              style={{
                                width: 48,
                                height: 48,
                                borderRadius: 14,
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.14)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 24,
                                flexShrink: 0
                              }}
                            >
                              {targetUser.avatar || '🍿'}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>
                                  {targetUser.displayName || targetUser.name}
                                </span>
                                <span style={{ fontSize: 12, color: '#38bdf8', fontWeight: 600 }}>
                                  @{targetUser.username}
                                </span>
                                {isAlreadyFriend ? (
                                  <span
                                    style={{
                                      fontSize: 10,
                                      fontWeight: 700,
                                      color: matchScore > 0 ? '#34d399' : 'rgba(255, 255, 255, 0.4)',
                                      background: matchScore > 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                                      border: `1px solid ${matchScore > 0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.1)'}`,
                                      padding: '1px 8px',
                                      borderRadius: 10
                                    }}
                                  >
                                    {matchScore > 0 ? `⚡ ${matchScore}% Fit` : '0% Fit'}
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      fontSize: 10,
                                      fontWeight: 700,
                                      color: '#f87171',
                                      background: 'rgba(239, 68, 68, 0.12)',
                                      border: '1px solid rgba(239, 68, 68, 0.28)',
                                      padding: '1px 8px',
                                      borderRadius: 10,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 4
                                    }}
                                  >
                                    <span>🔒</span> Private
                                  </span>
                                )}
                              </div>
                              {targetUser.bio && (
                                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.6)', marginTop: 2 }}>
                                  {targetUser.bio}
                                </div>
                              )}
                              <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.4)', marginTop: 4 }}>
                                {isAlreadyFriend
                                  ? `Favorite Genres: ${(targetUser.favoriteGenres || []).map(id => GN[id]).filter(Boolean).slice(0, 3).join(' · ') || 'Cinema Enthusiast'}`
                                  : '🔒 Details & chat private until friend request accepted'}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button
                              onClick={() => navigate('profile', targetUser)}
                              style={{
                                background: 'rgba(255, 255, 255, 0.06)',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                borderRadius: 10,
                                padding: '8px 14px',
                                color: 'white',
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                transition: 'all 0.2s'
                              }}
                            >
                              <span>👤</span>
                              <span>Profile</span>
                            </button>

                            {isAlreadyFriend ? (
                              <button
                                onClick={() => openChatWithFriend(targetUser)}
                                style={{
                                  background: '#38bdf8',
                                  border: 'none',
                                  borderRadius: 10,
                                  padding: '8px 16px',
                                  color: '#090910',
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6
                                }}
                              >
                                <span>💬</span>
                                <span>Chat</span>
                              </button>
                            ) : outgoingReq || status === 'sent' ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: 11, color: '#fbbf24', fontWeight: 700, background: 'rgba(251,191,36,.12)', border: '1px solid rgba(251,191,36,.25)', padding: '5px 12px', borderRadius: 8 }}>
                                  ⏳ Requested
                                </span>
                                {outgoingReq && (
                                  <button
                                    onClick={() => handleCancelRequest(outgoingReq.id, targetId)}
                                    style={{
                                      background: 'rgba(255,255,255,0.06)',
                                      border: '1px solid rgba(255,255,255,0.12)',
                                      color: 'rgba(255,255,255,0.6)',
                                      borderRadius: 8,
                                      padding: '5px 10px',
                                      fontSize: 11,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            ) : incomingReq ? (
                              <span style={{ fontSize: 11, color: '#10b981', fontWeight: 700, background: 'rgba(16,185,129,.15)', border: '1px solid rgba(16,185,129,.3)', padding: '5px 12px', borderRadius: 8 }}>
                                📩 Incoming Request
                              </span>
                            ) : (
                              <button
                                onClick={() => handleSendFriendRequest(targetUser)}
                                disabled={status === 'sending'}
                                style={{
                                  background: 'rgba(255, 255, 255, 0.92)',
                                  border: 'none',
                                  borderRadius: 10,
                                  padding: '8px 16px',
                                  color: '#090910',
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  transition: 'all 0.2s'
                                }}
                              >
                                <span>+</span>
                                <span>{status === 'sending' ? 'Sending...' : 'Add Friend'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '56px 0' }}>
                  <div style={{ fontSize: 44, marginBottom: 12 }}>🔍</div>
                  <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 26, color: 'white' }}>
                    No Cinephiles Found
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,.38)', marginTop: 6, fontSize: 13 }}>
                    No users matching "@{userQuery}". Try checking the spelling of their username.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
