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
      style={{
        width: w,
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        flexShrink: 0,
        boxShadow: hov ? '0 20px 48px rgba(0,0,0,0.65)' : '0 8px 24px rgba(0,0,0,0.35)',
        border: '1.2px solid rgba(255, 255, 255, 0.14)'
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => navigate('movie', movie.id)}
    >
      {/* Poster */}
      <div style={{ width: w, height: h, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
        {failed || !src ? (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #181b2e 0%, #0c0d18 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 12, textAlign: 'center', position: 'relative' }}>
            <span style={{ fontSize: 24, marginBottom: 8 }}>🎬</span>
            <p style={{ color: 'white', fontSize: w > 120 ? 12 : 10, fontWeight: 700, margin: '0 0 4px 0', lineHeight: 1.3 }}>{movie.title}</p>
            <p style={{ color: 'rgba(255,255,255,.4)', fontSize: w > 120 ? 10 : 8, margin: 0 }}>{movie.release_date?.split('-')[0] || 'N/A'}</p>
          </div>
        ) : (
          <img
            src={src} alt={movie.title} loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .35s var(--apple-spring)', transform: hov ? 'scale(1.08)' : 'scale(1)' }}
            onError={() => setFailed(true)}
          />
        )}
      </div>

      {/* Hover overlay */}
      {hov && (
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(9,9,16,.98) 0%, rgba(9,9,16,.68) 52%, transparent 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 12 }}>
          <p style={{ fontWeight: 600, fontSize: 11.5, color: 'white', marginBottom: 4, lineHeight: 1.3 }}>{movie.title}</p>
          <StarRating rating={movie.vote_average} />
          <button
            onClick={e => { e.stopPropagation(); toggleWatchlist(movie) }}
            className="apple-glass-btn"
            style={{
              marginTop: 8,
              padding: '6px 10px',
              fontSize: 10.5,
              fontWeight: 700,
              color: inWL ? '#38bdf8' : 'white',
              background: inWL ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.12)',
              borderColor: inWL ? 'rgba(56,189,248,0.45)' : 'rgba(255,255,255,0.2)'
            }}
          >
            {inWL ? '✓ Saved' : '+ Watchlist'}
          </button>
        </div>
      )}

      {/* Apple Liquid Glass Rating Badge */}
      {!hov && movie.vote_average > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: 'rgba(14, 18, 28, 0.78)',
            backdropFilter: 'blur(16px) saturate(190%)',
            WebkitBackdropFilter: 'blur(16px) saturate(190%)',
            borderRadius: 100,
            padding: '3px 8px',
            fontSize: 10,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.95)',
            border: '1.2px solid rgba(255,255,255,0.24)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.45)'
          }}
        >
          ⭐{movie.vote_average?.toFixed(1)}
        </div>
      )}
    </div>
  )
}
