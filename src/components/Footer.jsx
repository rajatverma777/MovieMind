import { useApp } from '@/context/AppContext'

export default function Footer() {
  const { navigate } = useApp()
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,.05)',
      padding: '28px 24px 40px',
      marginTop: 24,
      textAlign: 'center'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        cursor: 'pointer',
        opacity: 0.35,
        transition: 'opacity 0.2s'
      }}
        onClick={() => navigate('landing')}
        onMouseOver={e => e.currentTarget.style.opacity = '0.6'}
        onMouseOut={e => e.currentTarget.style.opacity = '0.35'}
      >
        <span style={{ fontSize: 14 }}>🎬</span>
        <span style={{
          fontFamily: "'Bebas Neue', -apple-system, cursive",
          fontSize: 14,
          letterSpacing: 2,
          color: 'white',
          fontWeight: 700
        }}>
          CINEMIND
        </span>
      </div>
    </footer>
  )
}
