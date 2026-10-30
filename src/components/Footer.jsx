import { useApp } from '@/context/AppContext'

const LINKS = [['landing','Home'],['search','Search'],['watchlist','Watchlist'],['dashboard','Dashboard'],['mood','Moods'],['chat','AI Chat']]

export default function Footer() {
  const { navigate } = useApp()
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,.06)', padding: '34px 24px 44px', marginTop: 24 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>
            🎬
          </div>
          <span style={{ fontFamily: "-apple-system, 'SF Pro Display', 'DM Sans', sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: -0.2, color: 'rgba(255,255,255,0.9)' }}>
            MovieMind <span style={{ opacity: 0.45, fontWeight: 400 }}>AI</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          {LINKS.map(([id, label]) => (
            <button key={id} onClick={() => navigate(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.34)', fontFamily: "'DM Sans',sans-serif", fontSize: 12, transition: 'color .2s' }}
              onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'rgba(255,255,255,.34)'}>
              {label}
            </button>
          ))}
        </div>
        <p style={{ color: 'rgba(255,255,255,.18)', fontSize: 11 }}>Made by Rajat</p>
      </div>
    </footer>
  )
}
