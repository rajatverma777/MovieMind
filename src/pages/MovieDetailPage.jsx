import { useState, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { MOCK_MOVIES, GN, imgUrl } from '@/data/constants'
import StarRating  from '@/components/StarRating'
import GenreChip   from '@/components/GenreChip'
import MovieCard   from '@/components/MovieCard'
import TrailerModal from '@/components/TrailerModal'
import Spinner     from '@/components/Spinner'

export default function MovieDetailPage({ movieId }) {
  const { tmdb, watchlist, toggleWatchlist, navigate, addToRecent, isDemo } = useApp()
  const [movie,  setMovie]  = useState(null)
  const [busy,   setBusy]   = useState(true)
  const [tk,     setTk]     = useState(null)
  const [showT,  setShowT]  = useState(false)
  const [tab,    setTab]    = useState('overview')

  useEffect(() => {
    setBusy(true); setTab('overview'); setTk(null)
    ;(async () => {
      try {
        if (isDemo) {
          const f = MOCK_MOVIES.find(m => m.id === movieId) || MOCK_MOVIES[0]
          setMovie({ ...f, genres: (f.genre_ids || []).map(id => ({ id, name: GN[id] || '?' })), credits: { cast: [], crew: [] }, videos: { results: [] }, similar: { results: MOCK_MOVIES.filter(m => m.id !== f.id).slice(0, 8) } })
        } else if (tmdb) {
          const d = await tmdb.detail(movieId)
          setMovie(d)
          const t = d.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube')
          if (t) setTk(t.key)
          addToRecent(d)
        }
      } catch {
        const f = MOCK_MOVIES.find(m => m.id === movieId) || MOCK_MOVIES[0]
        setMovie({ ...f, genres: (f.genre_ids || []).map(id => ({ id, name: GN[id] || '?' })), credits: { cast: [], crew: [] }, videos: { results: [] }, similar: { results: MOCK_MOVIES.filter(m => m.id !== f.id).slice(0, 6) } })
      } finally { setBusy(false) }
    })()
  }, [movieId, tmdb, isDemo])

  if (busy)  return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner size={52} /></div>
  if (!movie) return <div style={{ padding: 80, textAlign: 'center', color: 'rgba(255,255,255,.38)' }}>Movie not found</div>

  const inWL    = watchlist.some(m => m.id === movie.id)
  const cast    = movie.credits?.cast?.slice(0, 12) || []
  const similar = movie.similar?.results?.slice(0, 8) || []
  const dirs    = movie.credits?.crew?.filter(c => c.job === 'Director') || []
  const bgSrc   = imgUrl(movie.backdrop_path, 'original') || `https://placehold.co/1280x720/0d0d18/1a1a2e?text=${encodeURIComponent(movie.title)}`
  const pSrc    = imgUrl(movie.poster_path,   'w342')     || `https://placehold.co/205x308/13131f/444?text=${encodeURIComponent(movie.title)}`
  const genres  = movie.genres || (movie.genre_ids || []).map(id => ({ id, name: GN[id] || '?' }))

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Backdrop */}
      <div style={{ position: 'relative', height: '68vh', overflow: 'hidden' }}>
        <img src={bgSrc} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => e.target.src = `https://placehold.co/1280x720/0d0d18/1a1a2e?text=${encodeURIComponent(movie.title)}`} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(6,6,15,1) 0%,rgba(6,6,15,.52) 40%,rgba(6,6,15,.08) 100%)' }} />

        {/* Back button */}
        <button onClick={() => navigate('landing')} style={{ position: 'absolute', top: 74, left: 22, background: 'rgba(0,0,0,.52)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.09)', borderRadius: 9, padding: '8px 16px', cursor: 'pointer', color: 'white', fontFamily: "'DM Sans',sans-serif", fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
          ← Back
        </button>

        {/* Play button */}
        {tk && (
          <button onClick={() => setShowT(true)} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 64, height: 64, borderRadius: '50%', background: 'rgba(229,9,20,.9)', border: '3px solid rgba(255,255,255,.18)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 38px rgba(229,9,20,.58)', transition: 'all .2s' }}
            onMouseOver={e => e.currentTarget.style.transform = 'translate(-50%,-50%) scale(1.12)'}
            onMouseOut={e =>  e.currentTarget.style.transform = 'translate(-50%,-50%) scale(1)'}>
            <span style={{ fontSize: 24, marginLeft: 4 }}>▶</span>
          </button>
        )}
      </div>

      {/* Detail content */}
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px 56px', marginTop: -96, position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', gap: 30, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Poster */}
          <img src={pSrc} alt={movie.title} style={{ width: 205, borderRadius: 14, boxShadow: '0 18px 56px rgba(0,0,0,.9),0 0 0 1px rgba(255,255,255,.04)', flexShrink: 0 }}
            onError={e => e.target.src = `https://placehold.co/205x308/13131f/444?text=${encodeURIComponent(movie.title)}`} />

          {/* Info */}
          <div style={{ flex: 1, minWidth: 250 }}>
            <h1 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 'clamp(2.3rem,5vw,3.8rem)', color: 'white', lineHeight: .96, marginBottom: 9 }}>{movie.title}</h1>
            {movie.tagline && <p style={{ color: '#d4a843', fontStyle: 'italic', marginBottom: 13, fontSize: 14 }}>"{movie.tagline}"</p>}

            {/* Meta */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginBottom: 16, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(212,168,67,.1)', border: '1px solid rgba(212,168,67,.26)', borderRadius: 7, padding: '5px 11px' }}>
                <span style={{ color: '#d4a843', fontSize: 14 }}>⭐</span>
                <span style={{ color: '#d4a843', fontWeight: 700, fontSize: 16 }}>{movie.vote_average?.toFixed(1)}</span>
                <span style={{ color: 'rgba(255,255,255,.3)', fontSize: 10 }}>/10</span>
              </div>
              <span style={{ color: 'rgba(255,255,255,.52)', fontSize: 12, background: 'rgba(255,255,255,.05)', padding: '5px 11px', borderRadius: 7, border: '1px solid rgba(255,255,255,.07)' }}>📅 {movie.release_date?.split('-')[0]}</span>
              {movie.runtime && <span style={{ color: 'rgba(255,255,255,.52)', fontSize: 12, background: 'rgba(255,255,255,.05)', padding: '5px 11px', borderRadius: 7, border: '1px solid rgba(255,255,255,.07)' }}>⏱ {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>}
            </div>

            {/* Genres */}
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 18 }}>
              {genres.map(g => <GenreChip key={g.id} id={g.id} />)}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginBottom: 22 }}>
              <button className="btn-r" onClick={() => setShowT(true)} style={{ border: 'none', padding: '12px 24px', borderRadius: 10, fontSize: 13, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                ▶ {tk ? 'Watch Trailer' : 'Play'}
              </button>
              <button onClick={() => toggleWatchlist(movie)} style={{ border: inWL ? '1px solid #e50914' : '1px solid rgba(255,255,255,.13)', cursor: 'pointer', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, background: inWL ? 'rgba(229,9,20,.1)' : 'rgba(255,255,255,.06)', color: inWL ? '#e50914' : 'white', transition: 'all .2s' }}>
                {inWL ? '✓ In Watchlist' : '+ Watchlist'}
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,.06)', marginBottom: 16 }}>
              {['overview', 'cast', 'similar'].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 12, textTransform: 'capitalize', color: tab === t ? 'white' : 'rgba(255,255,255,.36)', borderBottom: tab === t ? '2px solid #e50914' : '2px solid transparent', marginBottom: -1, transition: 'all .2s' }}>{t}</button>
              ))}
            </div>

            {/* Tab content */}
            {tab === 'overview' && (
              <div className="fi">
                <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 13, lineHeight: 1.8, marginBottom: 14 }}>{movie.overview}</p>
                {dirs.length > 0 && <p style={{ color: 'rgba(255,255,255,.38)', fontSize: 12 }}>Director: <span style={{ color: 'white', fontWeight: 500 }}>{dirs.map(d => d.name).join(', ')}</span></p>}
              </div>
            )}
            {tab === 'cast' && (
              <div className="fi">
                {cast.length ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {cast.map(p => (
                      <div key={p.id} style={{ textAlign: 'center', width: 68 }}>
                        <div style={{ width: 54, height: 54, borderRadius: '50%', margin: '0 auto 5px', overflow: 'hidden', border: '2px solid rgba(255,255,255,.06)', background: '#1a1a2e' }}>
                          <img src={imgUrl(p.profile_path, 'w185') || `https://placehold.co/54x54/1a1a2e/555?text=${p.name[0]}`} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => e.target.src = `https://placehold.co/54x54/1a1a2e/555?text=${p.name[0]}`} />
                        </div>
                        <p style={{ fontSize: 10, color: 'white', fontWeight: 600, lineHeight: 1.3 }}>{p.name}</p>
                        <p style={{ fontSize: 9, color: 'rgba(255,255,255,.32)' }}>{p.character?.split('/')?.[0]}</p>
                      </div>
                    ))}
                  </div>
                ) : <p style={{ color: 'rgba(255,255,255,.32)', fontSize: 12 }}>No cast data in demo mode — connect TMDB API for full cast.</p>}
              </div>
            )}
            {tab === 'similar' && (
              <div className="fi">
                {similar.length ? (
                  <div style={{ display: 'flex', gap: 9, overflowX: 'auto', paddingBottom: 7 }}>
                    {similar.map(m => <MovieCard key={m.id} movie={m} size="sm" />)}
                  </div>
                ) : <p style={{ color: 'rgba(255,255,255,.32)', fontSize: 12 }}>No similar movies found.</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      {showT && <TrailerModal videoKey={tk} onClose={() => setShowT(false)} />}
    </div>
  )
}
