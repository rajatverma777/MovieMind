import { useState, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { imgUrl } from '@/data/constants'
import StarRating from './StarRating'
import GenreChip from './GenreChip'
import Spinner from './Spinner'

export default function HeroBanner({ movies, loading }) {
  const { navigate, watchlist, toggleWatchlist } = useApp()
  const [cur, setCur] = useState(0)
  const pool = movies.slice(0, 5)
  const m    = pool[cur]

  useEffect(() => {
    if (pool.length <= 1) return
    const t = setInterval(() => setCur(c => (c + 1) % pool.length), 8000)
    return () => clearInterval(t)
  }, [pool.length])

  if (loading || !m) return (
    <div style={{ height: '88vh', background: '#0d0d18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner size={52} />
    </div>
  )

  const inWL = watchlist.some(x => x.id === m.id)
  const bg   = imgUrl(m.backdrop_path, 'original') || `https://placehold.co/1280x720/0d0d18/1a1a2e?text=${encodeURIComponent(m.title)}`

  return (
    <div style={{ position: 'relative', height: '88vh', overflow: 'hidden' }}>
      {/* Backdrop */}
      <div key={cur} style={{ position: 'absolute', inset: 0, animation: 'heroPan 9s ease-in-out forwards' }}>
        <img src={bg} alt={m.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => e.target.src = `https://placehold.co/1280x720/0d0d18/1a1a2e?text=${encodeURIComponent(m.title)}`} />
        <div className="hero-ov" style={{ position: 'absolute', inset: 0 }} />
      </div>

      {/* Content */}
      <div key={`ct${cur}`} style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 48px 76px', animation: 'fadeUp .65s ease both' }}>
        {/* Genre badges */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 13, flexWrap: 'wrap' }}>
          {(m.genre_ids || []).slice(0, 3).map(id => <GenreChip key={id} id={id} />)}
          <span style={{ fontSize: 10, padding: '3px 9px', borderRadius: 20, background: 'rgba(14,165,233,.12)', color: '#0ea5e9', border: '1px solid rgba(14,165,233,.26)', fontWeight: 700, letterSpacing: '.5px' }}>FEATURED</span>
        </div>

        {/* Title */}
        <h1 className="ht" style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 'clamp(3.2rem,8vw,7rem)', lineHeight: .95, color: 'white', marginBottom: 14, letterSpacing: '.02em', maxWidth: 680 }}>
          {m.title}
        </h1>

        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 14 }}>
          <StarRating rating={m.vote_average} />
          <span style={{ color: 'rgba(255,255,255,.38)' }}>•</span>
          <span style={{ color: 'rgba(255,255,255,.62)', fontSize: 13 }}>{m.release_date?.split('-')[0]}</span>
          <span style={{ color: 'rgba(255,255,255,.38)' }}>•</span>
          <span style={{ color: 'rgba(255,255,255,.62)', fontSize: 13 }}>4K HDR</span>
        </div>

        {/* Overview */}
        <p style={{ color: 'rgba(255,255,255,.7)', maxWidth: 510, fontSize: 14, lineHeight: 1.74, marginBottom: 26, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {m.overview}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 11, flexWrap: 'wrap' }}>
          <button className="btn-r" onClick={() => navigate('movie', m.id)} style={{ border: 'none', padding: '13px 30px', borderRadius: 10, fontSize: 15, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7 }}>
            ▶ Watch Now
          </button>
          <button onClick={() => toggleWatchlist(m)} style={{ border: inWL ? '1px solid #e50914' : '1px solid rgba(255,255,255,.14)', cursor: 'pointer', padding: '13px 22px', borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, background: inWL ? 'rgba(229,9,20,.1)' : 'rgba(255,255,255,.07)', color: inWL ? '#e50914' : 'white', transition: 'all .2s' }}>
            {inWL ? '✓ Saved' : '+ Watchlist'}
          </button>
          <button className="btn-g" onClick={() => navigate('movie', m.id)} style={{ border: '1px solid rgba(255,255,255,.12)', padding: '13px 22px', borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>
            ℹ More Info
          </button>
        </div>
      </div>

      {/* Slide dots */}
      <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 3 }}>
        {pool.map((_, i) => (
          <button key={i} onClick={() => setCur(i)} style={{ width: i === cur ? 28 : 8, height: 4, borderRadius: 2, background: i === cur ? '#e50914' : 'rgba(255,255,255,.22)', border: 'none', cursor: 'pointer', transition: 'all .3s' }} />
        ))}
      </div>
    </div>
  )
}
