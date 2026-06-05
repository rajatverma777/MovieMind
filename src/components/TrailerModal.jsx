import { useEffect } from 'react'

export default function TrailerModal({ videoKey, onClose }) {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div className="mod-bg" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 'min(900px,95vw)', background: '#0e0e1c', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <span style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 20, letterSpacing: 1 }}>Official Trailer</span>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.07)', border: 'none', cursor: 'pointer', color: 'white', width: 30, height: 30, borderRadius: 7, fontSize: 15 }}>✕</button>
        </div>
        <div style={{ aspectRatio: '16/9' }}>
          {videoKey
            ? <iframe src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`} style={{ width: '100%', height: '100%', border: 'none' }} allow="autoplay;encrypted-media" allowFullScreen />
            : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a14', gap: 12 }}>
                <span style={{ fontSize: 48 }}>🎬</span>
                <p style={{ color: 'rgba(255,255,255,.4)', fontFamily: "'DM Sans',sans-serif", fontSize: 14 }}>No trailer available in Demo Mode</p>
              </div>
          }
        </div>
      </div>
    </div>
  )
}
