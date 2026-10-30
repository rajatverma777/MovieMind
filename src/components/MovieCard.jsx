import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { imgUrl } from '@/data/constants'
import StarRating from './StarRating'

const SIZES = { sm: { w: 130, h: 195 }, md: { w: 160, h: 240 }, lg: { w: 200, h: 300 } }

export default function MovieCard({ movie, size = 'md' }) {
  const { navigate, watchlist, toggleWatchlist } = useApp()
  const [hov, setHov] = useState(false)
  const [failed, setFailed] = useState(false)
  const { w, h } = SIZES[size]
  const inWL = watchlist.some(m => m.id === movie.id)
  const src  = imgUrl(movie.poster_path, 'w342') || ''

  return (
    <div
      className="mc"
      style={{ width: w, position: 'relative', borderRadius: 14, overflow: 'hidden', flexShrink: 0 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => navigate('movie', movie.id)}
    >
      {/* Poster */}
      <div style={{ width: w, height: h, background: 'rgba(255,255,255,0.05)', overflow: 'hidden', border: '1px solid rgba(255,255,255,.10)' }}>
        {failed || !src ? (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1e1e30 0%, #0c0c14 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 12, textAlign: 'center', position: 'relative' }}>
            <span style={{ fontSize: 24, marginBottom: 8 }}>🎬</span>
            <p style={{ color: 'white', fontSize: w > 120 ? 12 : 10, fontWeight: 700, margin: '0 0 4px 0', lineHeight: 1.3 }}>{movie.title}</p>
            <p style={{ color: 'rgba(255,255,255,.34)', fontSize: w > 120 ? 10 : 8, margin: 0 }}>{movie.release_date?.split('-')[0] || 'N/A'}</p>
          </div>
        ) : (
          <img
            src={src} alt={movie.title} loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .3s', transform: hov ? 'scale(1.09)' : 'scale(1)' }}
            onError={() => setFailed(true)}
          />
        )}
      </div>

      {/* Hover overlay */}
      {hov && (
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(9,9,16,.97) 0%, rgba(9,9,16,.6) 52%, transparent 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 10 }}>
          <p style={{ fontWeight: 600, fontSize: 11, color: 'white', marginBottom: 4, lineHeight: 1.3 }}>{movie.title}</p>
          <StarRating rating={movie.vote_average} />
          <button
            onClick={e => { e.stopPropagation(); toggleWatchlist(movie) }}
            style={{ marginTop: 7, padding: '5px 8px', borderRadius: 8, border: inWL ? '1px solid rgba(140,80,255,0.45)' : '1px solid rgba(255,255,255,.18)', background: inWL ? 'rgba(140,80,255,0.25)' : 'rgba(255,255,255,.08)', color: inWL ? 'rgba(215,185,255,0.95)' : 'white', fontSize: 10, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontWeight: 700, transition: 'all .2s' }}
          >
            {inWL ? '✓ Saved' : '+ Watchlist'}
          </button>
        </div>
      )}

      {/* Rating badge */}
      {!hov && movie.vote_average > 0 && (
        <div style={{ position: 'absolute', top: 7, right: 7, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', borderRadius: 8, padding: '3px 7px', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.12)' }}>
          ⭐{movie.vote_average?.toFixed(1)}
        </div>
      )}
    </div>
  )
}
