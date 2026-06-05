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
      style={{ width: w, position: 'relative', borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => navigate('movie', movie.id)}
    >
      {/* Poster */}
      <div style={{ width: w, height: h, background: '#13131f', overflow: 'hidden', border: '1px solid rgba(255,255,255,.05)' }}>
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
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(6,6,15,.97) 0%,rgba(6,6,15,.6) 52%,transparent 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 10 }}>
          <p style={{ fontWeight: 600, fontSize: 11, color: 'white', marginBottom: 4, lineHeight: 1.3 }}>{movie.title}</p>
          <StarRating rating={movie.vote_average} />
          <button
            onClick={e => { e.stopPropagation(); toggleWatchlist(movie) }}
            style={{ marginTop: 7, padding: '5px 8px', borderRadius: 6, border: inWL ? '1px solid #e50914' : '1px solid rgba(255,255,255,.18)', background: inWL ? 'rgba(229,9,20,.2)' : 'rgba(255,255,255,.07)', color: inWL ? '#e50914' : 'white', fontSize: 10, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontWeight: 700, transition: 'all .2s' }}
          >
            {inWL ? '✓ Saved' : '+ Watchlist'}
          </button>
        </div>
      )}

      {/* Rating badge */}
      {!hov && movie.vote_average > 0 && (
        <div style={{ position: 'absolute', top: 7, right: 7, background: 'rgba(0,0,0,.76)', backdropFilter: 'blur(4px)', borderRadius: 5, padding: '2px 6px', fontSize: 10, fontWeight: 700, color: '#d4a843', border: '1px solid rgba(212,168,67,.24)' }}>
          ⭐{movie.vote_average?.toFixed(1)}
        </div>
      )}
    </div>
  )
}
