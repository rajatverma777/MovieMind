import { useState, useEffect, useRef, useCallback } from 'react'
import { useApp } from '@/context/AppContext'
import { MOCK_MOVIES, GN } from '@/data/constants'
import MovieCard  from '@/components/MovieCard'
import SearchBar  from '@/components/SearchBar'
import Spinner    from '@/components/Spinner'

export default function SearchPage() {
  const { tmdb, isDemo } = useApp()
  const [q,    setQ]    = useState('')
  const [res,  setRes]  = useState([])
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const debRef = useRef(null)

  const doSearch = useCallback(async query => {
    if (!query.trim()) { setRes([]); setDone(false); return }
    setBusy(true); setDone(true)
    try {
      if (isDemo) { await new Promise(r => setTimeout(r, 380)); setRes(MOCK_MOVIES.filter(m => m.title.toLowerCase().includes(query.toLowerCase()))) }
      else if (tmdb) { const d = await tmdb.search(query); setRes(d.results || []) }
    } catch { setRes(MOCK_MOVIES.filter(m => m.title.toLowerCase().includes(query.toLowerCase()))) }
    finally { setBusy(false) }
  }, [tmdb, isDemo])

  const browseGenre = async id => {
    setBusy(true); setDone(true); setQ('')
    try {
      if (isDemo) setRes(MOCK_MOVIES.filter(m => m.genre_ids?.includes(id)))
      else if (tmdb) { const d = await tmdb.genre([id]); setRes(d.results || []) }
    } catch { setRes(MOCK_MOVIES.filter(m => m.genre_ids?.includes(id))) }
    finally { setBusy(false) }
  }

  useEffect(() => {
    clearTimeout(debRef.current)
    debRef.current = setTimeout(() => doSearch(q), 440)
    return () => clearTimeout(debRef.current)
  }, [q, doSearch])

  return (
    <div style={{ minHeight: '100vh', padding: '88px 24px 56px', maxWidth: 1400, margin: '0 auto' }}>
      <div className="fu" style={{ marginBottom: 26 }}>
        <h1 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 50, letterSpacing: 1, color: 'white', marginBottom: 5 }}>
          Search <span style={{ color: '#e50914' }}>Everything</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,.38)', fontSize: 13 }}>Find by title, browse by genre, or discover something new</p>
      </div>

      <div className="fu d1" style={{ marginBottom: 26 }}>
        <SearchBar value={q} onChange={setQ} />
      </div>

      {/* Genre browser */}
      {!done && (
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

      {/* Results */}
      {!busy && done && (
        <div className="fu" style={{ marginTop: 26 }}>
          {res.length ? (
            <>
              <p style={{ color: 'rgba(255,255,255,.42)', fontSize: 12, marginBottom: 16 }}>
                Found <strong style={{ color: 'white' }}>{res.length}</strong> results
                {q && <> for "<strong style={{ color: '#e50914' }}>{q}</strong>"</>}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(158px,1fr))', gap: 15 }}>
                {res.map(m => <MovieCard key={m.id} movie={m} />)}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '56px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 26, color: 'white' }}>No results found</h3>
              <p style={{ color: 'rgba(255,255,255,.38)', marginTop: 7, fontSize: 13 }}>Try a different title or browse by genre above</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
