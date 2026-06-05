import { useRef } from 'react'
import MovieCard from './MovieCard'
import SkeletonCard from './SkeletonCard'

export default function MovieRow({ title, movies, loading, size = 'md' }) {
  const ref = useRef(null)
  const scroll = d => ref.current?.scrollBy({ left: d * 560, behavior: 'smooth' })
  const cardW  = size === 'lg' ? 200 : 160
  const cardH  = size === 'lg' ? 300 : 240

  return (
    <div style={{ paddingBottom: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px 12px' }}>
        <h2 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 24, color: 'white' }}>{title}</h2>
        <div style={{ display: 'flex', gap: 6 }}>
          {[-1, 1].map(d => (
            <button
              key={d} onClick={() => scroll(d)}
              style={{ width: 32, height: 32, borderRadius: 7, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', cursor: 'pointer', color: 'white', fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(229,9,20,.15)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,.05)'}
            >
              {d < 0 ? '‹' : '›'}
            </button>
          ))}
        </div>
      </div>

      {/* Scroll row */}
      <div ref={ref} className="sx" style={{ paddingLeft: 24, paddingRight: 24 }}>
        {loading
          ? Array.from({ length: 7 }).map((_, i) => <SkeletonCard key={i} w={cardW} h={cardH} />)
          : movies.map(m => <MovieCard key={m.id} movie={m} size={size} />)
        }
      </div>
    </div>
  )
}
