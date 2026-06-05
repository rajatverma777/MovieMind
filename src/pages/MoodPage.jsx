import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { MOCK_MOVIES, MOODS } from '@/data/constants'
import MovieCard from '@/components/MovieCard'
import Spinner   from '@/components/Spinner'

export default function MoodPage() {
  const { tmdb, isDemo } = useApp()
  const [sel,   setSel]   = useState(null)
  const [movies, setMovies] = useState([])
  const [busy,  setBusy]  = useState(false)

  const pick = async mood => {
    setSel(mood); setBusy(true)
    try {
      if (isDemo) {
        await new Promise(r => setTimeout(r, 700))
        setMovies(MOCK_MOVIES.filter(m => m.genre_ids?.some(id => mood.genres.includes(id))))
      } else if (tmdb) {
        const d = await tmdb.genre(mood.genres.slice(0, 2))
        setMovies(d.results || [])
      }
    } catch {
      setMovies(MOCK_MOVIES.filter(m => m.genre_ids?.some(id => mood.genres.includes(id))))
    } finally { setBusy(false) }
  }

  return (
    <div style={{ minHeight: '100vh', padding: '88px 24px 56px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div className="fu" style={{ marginBottom: 42 }}>
        <h1 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 50, letterSpacing: 1, color: 'white', marginBottom: 5 }}>
          <span style={{ color: '#e50914' }}>Mood</span> Match
        </h1>
        <p style={{ color: 'rgba(255,255,255,.38)', fontSize: 13 }}>How are you feeling tonight? We'll find the perfect film.</p>
      </div>

      {/* Mood grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(172px,1fr))', gap: 14, marginBottom: 42 }}>
        {MOODS.map((m, i) => (
          <div
            key={m.id}
            className={`mood-c fu d${Math.min(i + 1, 6)}`}
            onClick={() => pick(m)}
            style={{
              borderRadius: 15, padding: '24px 16px', textAlign: 'center',
              background:   sel?.id === m.id ? `${m.color}18` : 'rgba(255,255,255,.025)',
              border:       sel?.id === m.id ? `2px solid ${m.color}` : '2px solid rgba(255,255,255,.06)',
              boxShadow:    sel?.id === m.id ? `0 0 26px ${m.color}42` : 'none',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 10 }}>{m.emoji}</div>
            <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 19, color: sel?.id === m.id ? m.color : 'white', marginBottom: 4, letterSpacing: '.04em' }}>{m.label}</div>
            <div style={{ color: 'rgba(255,255,255,.36)', fontSize: 11 }}>{m.desc}</div>
          </div>
        ))}
      </div>

      {/* Loading */}
      {busy && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 56 }}>
          <div style={{ textAlign: 'center' }}>
            <Spinner size={44} />
            <p style={{ color: 'rgba(255,255,255,.38)', marginTop: 14, fontFamily: "'DM Sans',sans-serif", fontSize: 13 }}>
              Finding {sel?.label} films…
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {!busy && movies.length > 0 && (
        <div className="fu">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
            <h2 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 28, color: 'white' }}>
              {sel?.emoji} {sel?.label} Picks
            </h2>
            <span style={{ background: `${sel?.color}18`, color: sel?.color, border: `1px solid ${sel?.color}36`, fontSize: 11, padding: '3px 12px', borderRadius: 20, fontWeight: 700 }}>
              {movies.length} films
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(158px,1fr))', gap: 16 }}>
            {movies.map(m => <MovieCard key={m.id} movie={m} />)}
          </div>
        </div>
      )}

      {/* Idle prompt */}
      {!sel && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 60, marginBottom: 14, animation: 'floatAnim 4s ease-in-out infinite' }}>🎭</div>
          <p style={{ color: 'rgba(255,255,255,.33)', fontSize: 15 }}>Select a mood above to discover your perfect film tonight</p>
        </div>
      )}
    </div>
  )
}
