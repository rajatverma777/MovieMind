import { useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import { GN } from '@/data/constants'
import MovieCard from '@/components/MovieCard'

export default function WatchlistPage() {
  const { watchlist, toggleWatchlist, navigate } = useApp()

  const genreStats = useMemo(() => {
    const c = {}
    watchlist.forEach(m => (m.genre_ids || []).forEach(id => { c[id] = (c[id] || 0) + 1 }))
    return Object.entries(c)
      .sort((a, b) => b[1] - a[1]).slice(0, 6)
      .map(([id, count]) => ({ id: +id, name: GN[id] || '?', count }))
  }, [watchlist])

  const topGenre = genreStats[0]?.name || 'eclectic'

  return (
    <div style={{ minHeight: '100vh', padding: '88px 24px 56px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div className="fu" style={{ marginBottom: 34 }}>
        <h1 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 50, letterSpacing: 1, color: 'white', marginBottom: 5 }}>
          My <span style={{ color: '#e50914' }}>Watchlist</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,.38)', fontSize: 13 }}>
          {watchlist.length} movie{watchlist.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {/* Empty state */}
      {!watchlist.length ? (
        <div style={{ textAlign: 'center', padding: '76px 0' }} className="fu">
          <div style={{ fontSize: 64, marginBottom: 20 }}>🎬</div>
          <h2 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 32, color: 'white', marginBottom: 9 }}>Your watchlist is empty</h2>
          <p style={{ color: 'rgba(255,255,255,.42)', marginBottom: 22, fontSize: 13 }}>
            Hover over any movie card and click "+ Watchlist" to save films
          </p>
          <button className="btn-r" onClick={() => navigate('landing')} style={{ border: 'none', padding: '12px 28px', borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans',sans-serif", fontWeight: 700 }}>
            Discover Movies
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
          {/* Movie grid */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 18 }}>
              {watchlist.map((m, i) => (
                <div key={m.id} className="fu" style={{ animationDelay: `${i * 0.04}s` }}>
                  <MovieCard movie={m} />
                  <button
                    onClick={() => toggleWatchlist(m)}
                    style={{ width: '100%', marginTop: 7, padding: '5px', background: 'rgba(229,9,20,.07)', border: '1px solid rgba(229,9,20,.22)', borderRadius: 7, cursor: 'pointer', color: '#e50914', fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, transition: 'all .2s' }}
                    onMouseOver={e => e.target.style.background = 'rgba(229,9,20,.18)'}
                    onMouseOut={e =>  e.target.style.background = 'rgba(229,9,20,.07)'}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ width: 260, flexShrink: 0 }}>
            {/* Genre mix */}
            <div className="glass ch" style={{ borderRadius: 16, padding: 22, marginBottom: 16 }}>
              <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 20, color: 'white', marginBottom: 15 }}>📊 Genre Mix</h3>
              {genreStats.map(g => (
                <div key={g.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: 'rgba(255,255,255,.72)', fontSize: 12, fontWeight: 500 }}>{g.name}</span>
                    <span style={{ color: '#d4a843', fontSize: 11 }}>{g.count}</span>
                  </div>
                  <div style={{ height: 3, background: 'rgba(255,255,255,.07)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(g.count / watchlist.length) * 100}%`, background: 'linear-gradient(90deg,#e50914,#d4a843)', borderRadius: 2, transition: 'width .8s ease' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* AI insight */}
            <div className="glass ch" style={{ borderRadius: 16, padding: 22 }}>
              <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 20, color: 'white', marginBottom: 8 }}>🤖 AI Insight</h3>
              <p style={{ color: 'rgba(255,255,255,.42)', fontSize: 12, lineHeight: 1.65, marginBottom: 15 }}>
                Your taste leans towards <strong style={{ color: 'white' }}>{topGenre}</strong> films.
                Try the Mood Recommender for curated picks based on your profile.
              </p>
              <button
                onClick={() => navigate('mood')}
                style={{ width: '100%', padding: '11px', background: 'rgba(229,9,20,.1)', border: '1px solid rgba(229,9,20,.28)', borderRadius: 9, cursor: 'pointer', color: '#e50914', fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, transition: 'all .2s' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(229,9,20,.18)'}
                onMouseOut={e =>  e.currentTarget.style.background = 'rgba(229,9,20,.1)'}
              >
                Get Mood Picks →
              </button>

              <button
                onClick={() => navigate('dashboard')}
                style={{ width: '100%', marginTop: 10, padding: '11px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 9, cursor: 'pointer', color: 'rgba(255,255,255,.6)', fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, transition: 'all .2s' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,.08)'}
                onMouseOut={e =>  e.currentTarget.style.background = 'rgba(255,255,255,.04)'}
              >
                View Dashboard →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
