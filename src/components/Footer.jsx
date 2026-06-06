import { useApp } from '@/context/AppContext'

const LINKS = [['landing','Home'],['search','Search'],['watchlist','Watchlist'],['dashboard','Dashboard'],['mood','Moods'],['chat','AI Chat']]

export default function Footer() {
  const { navigate } = useApp()
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,.05)', padding: '34px 24px', marginTop: 16 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: '#e50914', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontFamily: "'Bebas Neue',cursive", fontSize: 17 }}>M</span>
          </div>
          <span style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 18, letterSpacing: 2 }}>MOVIE<span style={{ color: '#e50914' }}>MIND</span> AI</span>
        </div>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          {LINKS.map(([id, label]) => (
            <button key={id} onClick={() => navigate(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.34)', fontFamily: "'DM Sans',sans-serif", fontSize: 12, transition: 'color .2s' }}
              onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'rgba(255,255,255,.34)'}>
              {label}
            </button>
          ))}
        </div>
        <p style={{ color: 'rgba(255,255,255,.18)', fontSize: 11 }}>Made with ❤️ by Rajat</p>
      </div>
    </footer>
  )
}
