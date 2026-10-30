import { useState, useEffect, useRef, useCallback } from 'react'
import { useApp } from '@/context/AppContext'
import { MOCK_MOVIES, GN } from '@/data/constants'
import MovieCard  from '@/components/MovieCard'
import SearchBar  from '@/components/SearchBar'
import Spinner    from '@/components/Spinner'

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
  const { tmdb, isDemo } = useApp()
  const [mode, setMode]   = useState('title') // 'title' | 'vague'
  const [q,    setQ]      = useState('')
  const [res,  setRes]    = useState([])
  const [busy, setBusy]   = useState(false)
  const [done, setDone]   = useState(false)
  const [explanation, setExplanation] = useState('')
  const debRef = useRef(null)

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
      // Fetch from our backend semantic search route with candidate pool fallback
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
    } catch (err) {
      // Local zero-lag fallback
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
    clearTimeout(debRef.current)
    if (mode === 'title') {
      debRef.current = setTimeout(() => doTitleSearch(q), 350)
    } else {
      debRef.current = setTimeout(() => doSemanticSearch(q), 500)
    }
    return () => clearTimeout(debRef.current)
  }, [q, mode, doTitleSearch, doSemanticSearch])

  return (
    <div style={{ minHeight: '100vh', padding: '88px 24px 56px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div className="fu" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 50, letterSpacing: 1, color: 'white', marginBottom: 5 }}>
            Discovery & <span style={{ color: '#e50914' }}>Search</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 13 }}>
            Find films by exact title, or describe that vague scene or plot you vaguely remember.
          </p>
        </div>

        {/* Mode Switcher */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,.05)', padding: 4, borderRadius: 10, border: '1px solid rgba(255,255,255,.08)' }}>
          <button
            onClick={() => { setMode('title'); setDone(false); setQ('') }}
            style={{
              padding: '8px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
              background: mode === 'title' ? '#e50914' : 'transparent',
              color: mode === 'title' ? 'white' : 'rgba(255,255,255,.5)',
              fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, transition: 'all .2s'
            }}
          >
            🔍 Title & Genre
          </button>
          <button
            onClick={() => { setMode('vague'); setDone(false); setQ('') }}
            style={{
              padding: '8px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
              background: mode === 'vague' ? 'linear-gradient(135deg,#8b5cf6,#e50914)' : 'transparent',
              color: mode === 'vague' ? 'white' : 'rgba(255,255,255,.5)',
              fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, transition: 'all .2s',
              display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <span>🧠 Vague Memory AI</span>
            <span style={{ fontSize: 9, background: 'rgba(255,255,255,.2)', padding: '1px 6px', borderRadius: 10 }}>NEW</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="fu d1" style={{ marginBottom: 20 }}>
        {mode === 'title' ? (
          <SearchBar value={q} onChange={setQ} />
        ) : (
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(139,92,246,.06)', border: '1px solid rgba(139,92,246,.3)', borderRadius: 12, padding: '12px 18px', gap: 12, boxShadow: '0 8px 32px rgba(139,92,246,.08)' }}>
              <span style={{ fontSize: 20 }}>🧠</span>
              <input
                type="text"
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Describe that film you can't remember... (e.g. 'time loop on an alien beach', 'guy trapped in phone booth')"
                style={{
                  width: '100%', background: 'none', border: 'none', outline: 'none',
                  color: 'white', fontFamily: "'DM Sans',sans-serif", fontSize: 14
                }}
              />
              {q && (
                <button
                  onClick={() => setQ('')}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', cursor: 'pointer', fontSize: 16 }}
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
              <p style={{ color: 'rgba(255,255,255,.42)', fontSize: 12, marginBottom: 16 }}>
                Found <strong style={{ color: 'white' }}>{res.length}</strong> {mode === 'vague' ? 'semantic matches' : 'results'}
                {q && <> for "<strong style={{ color: mode === 'vague' ? '#a78bfa' : '#e50914' }}>{q}</strong>"</>}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(168px,1fr))', gap: 16 }}>
                {res.map(m => (
                  <div key={m.id} style={{ position: 'relative' }}>
                    <MovieCard movie={m} />
                    {/* Semantic match reason badge if present */}
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
    </div>
  )
}
