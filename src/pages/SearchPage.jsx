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
    <div style={{
      minHeight: '100vh',
      padding: '24px 20px 140px',
      maxWidth: 1200,
      margin: '0 auto',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', -apple-system, sans-serif",
      backgroundImage: 'radial-gradient(ellipse 80% 40% at 50% -10%, rgba(10, 132, 255, 0.08) 0%, transparent 70%)'
    }}>
      {/* ── Top Level Category Switcher: Movies (Default) vs Cinephiles ─────────── */}
      <div className="fu" style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <AppleSegmentedControl
          options={[
            { id: 'movies', label: '🎬 Movies' },
            { id: 'users', label: '👤 Cinephiles' }
          ]}
          value={searchCategory}
          onChange={setSearchCategory}
        />
        {searchCategory === 'movies' && (
          <AppleSegmentedControl
            options={[
              { id: 'title', label: '🔍 Title' },
              { id: 'vague', label: '🧠 AI Concept' }
            ]}
            value={mode}
            onChange={val => { setMode(val); setDone(false); setQ('') }}
          />
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ── 1. MOVIES SEARCH VIEW (DEFAULT) ─────────────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {searchCategory === 'movies' && (
        <>
          {/* Header */}
          <div className="fu" style={{ marginBottom: 28 }}>
            <h1 style={{
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', sans-serif",
              fontSize: 'clamp(32px, 5vw, 44px)',
              fontWeight: 700,
              letterSpacing: -0.8,
              color: '#ffffff',
              marginBottom: 6,
              lineHeight: 1.15
            }}>
              Discovery & Search
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: 14, margin: 0, fontWeight: 400 }}>
              {mode === 'title'
                ? 'Explore cinema by title, actors, directors, or curated genres.'
                : 'Describe that elusive scene or narrative premise in your own words.'}
            </p>
          </div>

          {/* Search Input (Apple visionOS Proportioned Centered Search Bar) */}
          <div style={{ maxWidth: 680, margin: '0 auto 32px', position: 'relative', zIndex: 100 }}>
            {mode === 'title' ? (
              <SearchBar value={q} onChange={setQ} />
            ) : (
              <div
                className="apple-glass-card"
                style={{
                  background: 'rgba(139, 92, 246, 0.05)',
                  backgroundImage: 'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(139, 92, 246, 0.14) 0%, rgba(255, 255, 255, 0.01) 100%)',
                  backdropFilter: 'blur(40px) saturate(200%)',
                  WebkitBackdropFilter: 'blur(40px) saturate(200%)',
                  border: '1.2px solid rgba(167, 139, 250, 0.28)',
                  borderRadius: 26,
                  padding: '24px 20px',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 1.5px rgba(255, 255, 255, 0.2)'
                }}
              >
                {/* Apple Intelligence Pill Input */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: 52,
                    borderRadius: 9999,
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(28px) saturate(190%)',
                    WebkitBackdropFilter: 'blur(28px) saturate(190%)',
                    border: '1.2px solid rgba(167, 139, 250, 0.38)',
                    padding: '0 20px',
                    gap: 14,
                    boxShadow: '0 4px 24px rgba(139, 92, 246, 0.22), inset 0 1px 1.5px rgba(255, 255, 255, 0.22)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: 20, color: '#a78bfa', filter: 'drop-shadow(0 0 8px rgba(167, 139, 250, 0.6))' }}>🧠</span>
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
                      color: '#ffffff',
                      caretColor: '#a78bfa',
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
                      fontSize: 14.5,
                      fontWeight: 450
                    }}
                  />
                  {q && (
                    <button
                      onClick={() => setQ('')}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.16)',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.85)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: 10,
                        fontWeight: 800,
                        padding: 0
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Vague Preset Chips */}
                <div style={{ marginTop: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 12.5, color: '#c4b5fd', fontWeight: 600 }}>✨ Narrative Presets:</span>
                    <span style={{ fontSize: 11.5, color: 'rgba(255, 255, 255, 0.45)' }}>Tap to test AI reasoning</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {VAGUE_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => setQ(p.query)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: 9999,
                          padding: '7px 15px',
                          fontSize: 12,
                          fontWeight: 550,
                          color: 'rgba(255, 255, 255, 0.85)',
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
                          transition: 'all 0.2s var(--apple-spring-smooth)'
                        }}
                        onMouseOver={e => {
                          e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)'
                          e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.5)'
                          e.currentTarget.style.color = '#ffffff'
                          e.currentTarget.style.transform = 'translateY(-2px)'
                          e.currentTarget.style.boxShadow = '0 6px 18px rgba(139, 92, 246, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'
                          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)'
                          e.currentTarget.style.transform = 'none'
                          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.15)'
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Genre browser (Only in Title mode when not searching) - Apple Liquid Glass Section */}
          {mode === 'title' && !done && (
            <div
              className="fu d2 apple-glass-card"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.01) 100%)',
                backdropFilter: 'blur(40px) saturate(190%)',
                WebkitBackdropFilter: 'blur(40px) saturate(190%)',
                border: '1.2px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 24,
                padding: '28px 24px',
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.35), inset 0 1px 1.5px rgba(255, 255, 255, 0.15)',
                marginTop: 12
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, border: '1px solid rgba(255, 255, 255, 0.12)' }}>
                    🎬
                  </div>
                  <div>
                    <h2 style={{
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
                      fontSize: 18,
                      fontWeight: 700,
                      letterSpacing: -0.4,
                      color: '#ffffff',
                      margin: 0
                    }}>
                      Browse by Genre
                    </h2>
                    <p style={{ margin: 0, fontSize: 12.5, color: 'rgba(255, 255, 255, 0.5)' }}>
                      Explore cinema catalogue by curated mood and genre
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255, 255, 255, 0.45)' }}>
                  {Object.keys(GN).length} Genres
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {Object.entries(GN).map(([id, name]) => (
                  <button
                    key={id}
                    onClick={() => browseGenre(+id)}
                    style={{
                      padding: '9px 20px',
                      borderRadius: 9999,
                      background: 'rgba(255, 255, 255, 0.06)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      cursor: 'pointer',
                      color: 'rgba(255, 255, 255, 0.85)',
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                      fontSize: 13,
                      fontWeight: 550,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.18)',
                      transition: 'all 0.22s var(--apple-spring-smooth)'
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.35)'
                      e.currentTarget.style.color = '#ffffff'
                      e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)'
                      e.currentTarget.style.transform = 'none'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.18)'
                    }}
                  >
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
            <div className="fu" style={{ marginTop: 24, position: 'relative', zIndex: 1 }}>
              {res.length ? (
                <>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 16,
                      marginBottom: 24,
                      paddingBottom: 16,
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 14, margin: 0, fontWeight: 500, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                      Found <strong style={{ color: '#ffffff', fontWeight: 700 }}>{res.filter(m => !minRating || (m.vote_average || 0) >= minRating).length}</strong> {mode === 'vague' ? 'semantic matches' : 'results'}
                      {q && <> for &ldquo;<strong style={{ color: mode === 'vague' ? '#a78bfa' : '#0a84ff', fontWeight: 600 }}>{q}</strong>&rdquo;</>}
                    </p>

                    {/* Apple Liquid Glass Slider for Minimum Rating Filter */}
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '6px 16px',
                        borderRadius: 9999,
                        background: 'rgba(255, 255, 255, 0.07)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.14)',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25)'
                      }}
                    >
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap' }}>
                        ⭐ Min Rating: <strong style={{ color: '#fbbf24', marginLeft: 2 }}>{minRating > 0 ? `${minRating.toFixed(1)}+` : 'All'}</strong>
                      </span>
                      <div style={{ width: 120 }}>
                        <AppleSlider
                          min={0}
                          max={9}
                          step={0.5}
                          value={minRating}
                          onChange={setMinRating}
                          color="#0a84ff"
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
                <div
                  className="apple-glass-card"
                  style={{
                    maxWidth: 600,
                    margin: '40px auto',
                    textAlign: 'center',
                    padding: '48px 24px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    backdropFilter: 'blur(30px)',
                    border: '1.2px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 24
                  }}
                >
                  <div style={{ fontSize: 44, marginBottom: 12 }}>🔍</div>
                  <h3 style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif", fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 6 }}>
                    No movies found
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,.48)', marginTop: 6, fontSize: 13.5 }}>
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
          <div style={{ marginBottom: 28 }}>
            <h1 style={{
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', sans-serif",
              fontSize: 'clamp(32px, 5vw, 44px)',
              fontWeight: 700,
              letterSpacing: -0.8,
              color: '#ffffff',
              marginBottom: 6,
              lineHeight: 1.15
            }}>
              Find Cinephiles
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: 14, margin: 0, fontWeight: 400 }}>
              Search by @username or name, check cinematic taste compatibility, and connect.
            </p>
          </div>

          {/* User Search Input (Apple Liquid Glass Capsule Centered) */}
          <div style={{ maxWidth: 680, margin: '0 auto 32px', position: 'relative' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: 52,
                borderRadius: 9999,
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(30px) saturate(190%)',
                WebkitBackdropFilter: 'blur(30px) saturate(190%)',
                border: '1.2px solid rgba(56, 189, 248, 0.35)',
                padding: '0 20px',
                gap: 12,
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.35), inset 0 1px 1.5px rgba(255, 255, 255, 0.22)',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: 16, color: '#38bdf8' }}>🔍</span>
              <input
                type="text"
                value={userQuery}
                onChange={e => setUserQuery(e.target.value)}
                placeholder="Search cinephiles by @username or name (e.g. alok, pratik, rajat)..."
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  caretColor: '#38bdf8',
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
                  fontSize: 14.5,
                  fontWeight: 450
                }}
              />
              {userQuery && (
                <button
                  onClick={() => { setUserQuery(''); setUserResults([]); setUserSearchDone(false); }}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.16)',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: 10,
                    fontWeight: 800,
                    padding: 0
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Searching Spinner */}
          {searchingUsers && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 56 }}>
              <Spinner size={38} />
            </div>
          )}

          {/* Empty initial state before typing - Apple Liquid Glass Showcase Card */}
          {!searchingUsers && !userQuery && (
            <div
              className="fu apple-glass-card"
              style={{
                maxWidth: 680,
                margin: '0 auto',
                textAlign: 'center',
                padding: '48px 32px',
                background: 'rgba(255, 255, 255, 0.04)',
                backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.01) 100%)',
                backdropFilter: 'blur(40px) saturate(190%)',
                WebkitBackdropFilter: 'blur(40px) saturate(190%)',
                border: '1.2px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 24,
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35), inset 0 1px 1.5px rgba(255, 255, 255, 0.16)'
              }}
            >
              <div style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.28)',
                boxShadow: '0 8px 24px rgba(56, 189, 248, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 30,
                marginBottom: 16
              }}>
                👥
              </div>
              <h3 style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: -0.4,
                color: '#ffffff',
                marginBottom: 8
              }}>
                Discover Fellow Cinephiles
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: 14, maxWidth: 440, margin: '0 auto 24px', lineHeight: 1.5 }}>
                Type any username or name above to find other movie lovers, evaluate live taste fit, and initiate friend requests.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.45)', fontWeight: 550 }}>Suggested:</span>
                {['alok', 'pratik', 'rajat'].map(u => (
                  <button
                    key={u}
                    onClick={() => setUserQuery(u)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.14)',
                      borderRadius: 9999,
                      padding: '6px 16px',
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: '#38bdf8',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(56, 189, 248, 0.16)'
                      e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)'
                      e.currentTarget.style.transform = 'none'
                    }}
                  >
                    @{u}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* User Results List */}
          {!searchingUsers && userSearchDone && (
            <div>
              {userResults.length > 0 ? (
                <>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
                    paddingBottom: 14,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 14, margin: 0, fontWeight: 500 }}>
                      Found <strong style={{ color: '#ffffff', fontWeight: 700 }}>{userResults.length}</strong> cinephile{userResults.length !== 1 ? 's' : ''} for &ldquo;<strong style={{ color: '#38bdf8' }}>{userQuery}</strong>&rdquo;
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
                          className="apple-glass-card"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.01) 100%)',
                            backdropFilter: 'blur(30px) saturate(190%)',
                            WebkitBackdropFilter: 'blur(30px) saturate(190%)',
                            border: '1.2px solid rgba(255, 255, 255, 0.14)',
                            borderRadius: 22,
                            padding: '18px 24px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 16,
                            boxShadow: '0 10px 36px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.18)',
                            transition: 'all 0.22s var(--apple-spring-smooth)'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.26)'
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3)'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)'
                            e.currentTarget.style.transform = 'none'
                            e.currentTarget.style.boxShadow = '0 10px 36px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.18)'
                          }}
                        >
                          {/* User Info */}
                          <div
                            onClick={() => navigate('profile', targetUser)}
                            style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
                            title={`View @${targetUser.username}'s public profile`}
                          >
                            <div
                              style={{
                                width: 52,
                                height: 52,
                                borderRadius: 16,
                                background: 'rgba(255, 255, 255, 0.09)',
                                border: '1.2px solid rgba(255, 255, 255, 0.2)',
                                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 26,
                                flexShrink: 0
                              }}
                            >
                              {targetUser.avatar || '🍿'}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', letterSpacing: -0.3 }}>
                                  {targetUser.displayName || targetUser.name}
                                </span>
                                <span style={{ fontSize: 13, color: '#38bdf8', fontWeight: 600 }}>
                                  @{targetUser.username}
                                </span>
                                {isAlreadyFriend ? (
                                  <span
                                    style={{
                                      fontSize: 10.5,
                                      fontWeight: 700,
                                      color: matchScore > 0 ? '#34d399' : 'rgba(255, 255, 255, 0.5)',
                                      background: matchScore > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                                      border: `1px solid ${matchScore > 0 ? 'rgba(16, 185, 129, 0.35)' : 'rgba(255, 255, 255, 0.12)'}`,
                                      padding: '2px 9px',
                                      borderRadius: 10,
                                      boxShadow: matchScore > 0 ? '0 0 10px rgba(16, 185, 129, 0.25)' : 'none'
                                    }}
                                  >
                                    {matchScore > 0 ? `⚡ ${matchScore}% Fit` : '0% Fit'}
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      fontSize: 10.5,
                                      fontWeight: 700,
                                      color: '#f87171',
                                      background: 'rgba(239, 68, 68, 0.12)',
                                      border: '1px solid rgba(239, 68, 68, 0.28)',
                                      padding: '2px 9px',
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
                                <div style={{ fontSize: 12.5, color: 'rgba(255, 255, 255, 0.65)', marginTop: 3 }}>
                                  {targetUser.bio}
                                </div>
                              )}
                              <div style={{ fontSize: 11.5, color: 'rgba(255, 255, 255, 0.45)', marginTop: 4 }}>
                                {isAlreadyFriend
                                  ? `Favorite Genres: ${(targetUser.favoriteGenres || []).map(id => GN[id]).filter(Boolean).slice(0, 3).join(' · ') || 'Cinema Enthusiast'}`
                                  : '🔒 Details & live sync private until friend request accepted'}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <button
                              onClick={() => navigate('profile', targetUser)}
                              style={{
                                background: 'rgba(255, 255, 255, 0.08)',
                                backdropFilter: 'blur(16px)',
                                border: '1px solid rgba(255, 255, 255, 0.16)',
                                borderRadius: 9999,
                                padding: '8px 18px',
                                color: '#ffffff',
                                fontSize: 12.5,
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                                transition: 'all 0.18s ease'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)'
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)'
                              }}
                            >
                              <span>👤</span>
                              <span>Profile</span>
                            </button>

                            {isAlreadyFriend ? (
                              <button
                                onClick={() => openChatWithFriend(targetUser)}
                                style={{
                                  background: '#0a84ff',
                                  border: 'none',
                                  borderRadius: 9999,
                                  padding: '8px 20px',
                                  color: '#ffffff',
                                  fontSize: 12.5,
                                  fontWeight: 650,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  boxShadow: '0 4px 14px rgba(10, 132, 255, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.35)',
                                  transition: 'all 0.18s ease'
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                              >
                                <span>💬</span>
                                <span>Chat</span>
                              </button>
                            ) : outgoingReq || status === 'sent' ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: 11.5, color: '#fbbf24', fontWeight: 700, background: 'rgba(251,191,36,.14)', border: '1px solid rgba(251,191,36,.3)', padding: '6px 14px', borderRadius: 9999 }}>
                                  ⏳ Requested
                                </span>
                                {outgoingReq && (
                                  <button
                                    onClick={() => handleCancelRequest(outgoingReq.id, targetId)}
                                    style={{
                                      background: 'rgba(255,255,255,0.06)',
                                      border: '1px solid rgba(255,255,255,0.14)',
                                      color: 'rgba(255,255,255,0.7)',
                                      borderRadius: 9999,
                                      padding: '6px 12px',
                                      fontSize: 11.5,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            ) : incomingReq ? (
                              <span style={{ fontSize: 11.5, color: '#34d399', fontWeight: 700, background: 'rgba(16,185,129,.16)', border: '1px solid rgba(16,185,129,.35)', padding: '6px 14px', borderRadius: 9999 }}>
                                📩 Incoming Request
                              </span>
                            ) : (
                              <button
                                onClick={() => handleSendFriendRequest(targetUser)}
                                disabled={status === 'sending'}
                                style={{
                                  background: '#ffffff',
                                  border: 'none',
                                  borderRadius: 9999,
                                  padding: '8px 20px',
                                  color: '#090910',
                                  fontSize: 12.5,
                                  fontWeight: 650,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35), inset 0 1px 1px #ffffff',
                                  transition: 'all 0.18s ease'
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
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
                <div
                  className="apple-glass-card"
                  style={{
                    maxWidth: 600,
                    margin: '32px auto',
                    textAlign: 'center',
                    padding: '48px 24px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    backdropFilter: 'blur(30px)',
                    border: '1.2px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 24
                  }}
                >
                  <div style={{ fontSize: 44, marginBottom: 12 }}>🔍</div>
                  <h3 style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif", fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 6 }}>
                    No Cinephiles Found
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,.45)', marginTop: 6, fontSize: 13.5 }}>
                    No users matching &ldquo;@{userQuery}&rdquo;. Try checking the spelling of their username.
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
