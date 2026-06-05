// src/components/Navbar.jsx
import { useState, useRef } from 'react'
import { useApp } from '@/context/AppContext'
import { useScrolled, useOutsideClick } from '@/hooks'

const NAV_ITEMS = [
  { id: 'landing',   label: 'Home' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'mood',      label: 'Mood Recs' },
  { id: 'chat',      label: 'AI Chat' },
]

// ── User avatar dropdown ──────────────────────────────────────────────────
function UserMenu({ user, onSignOut, navigate }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useOutsideClick(ref, () => setOpen(false))

  const S = { fontFamily: "'DM Sans',sans-serif" }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.06)', border: open ? '1px solid rgba(229,9,20,.5)' : '1px solid rgba(255,255,255,.1)', borderRadius: 24, padding: '5px 12px 5px 5px', cursor: 'pointer', transition: 'all .2s' }}
        onMouseOver={e => !open && (e.currentTarget.style.borderColor = 'rgba(255,255,255,.2)')}
        onMouseOut={e =>  !open && (e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)')}
      >
        {/* Avatar circle */}
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#e50914,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>{user.avatar || user.name[0].toUpperCase()}</span>
        </div>
        <span className="do" style={{ color: 'rgba(255,255,255,.75)', fontSize: 13, ...S, fontWeight: 500 }}>{user.name}</span>
        <span style={{ color: 'rgba(255,255,255,.4)', fontSize: 10, transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s' }}>▼</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="glass fi" style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 200, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,.09)', zIndex: 200 }}>
          {/* User info header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,.07)', background: 'rgba(229,9,20,.05)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#e50914,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <span style={{ color: 'white', fontSize: 16, fontWeight: 700 }}>{user.avatar || user.name[0].toUpperCase()}</span>
            </div>
            <p style={{ color: 'white', fontSize: 13, fontWeight: 600, ...S }}>{user.name}</p>
            <p style={{ color: 'rgba(255,255,255,.38)', fontSize: 11, ...S, marginTop: 1 }}>{user.email}</p>
          </div>

          {/* Menu items */}
          {[
            { label: '🏠  Home',          action: () => { navigate('landing');   setOpen(false) } },
            { label: '📊  Dashboard',      action: () => { navigate('dashboard'); setOpen(false) } },
            { label: '🎬  Watchlist',      action: () => { navigate('watchlist'); setOpen(false) } },
            { label: '🎭  Mood Recs',      action: () => { navigate('mood');      setOpen(false) } },
            { label: '🤖  AI Chat',        action: () => { navigate('chat');      setOpen(false) } },
          ].map(item => (
            <button
              key={item.label} onClick={item.action}
              style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '11px 16px', color: 'rgba(255,255,255,.7)', fontSize: 13, ...S, transition: 'all .15s', borderBottom: '1px solid rgba(255,255,255,.04)' }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; e.currentTarget.style.color = 'white' }}
              onMouseOut={e =>  { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,.7)' }}
            >{item.label}</button>
          ))}

          {/* Sign out */}
          <button
            onClick={() => { onSignOut(); setOpen(false) }}
            style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '11px 16px', color: '#e50914', fontSize: 13, ...S, transition: 'all .15s', fontWeight: 600 }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(229,9,20,.08)'}
            onMouseOut={e =>  e.currentTarget.style.background = 'none'}
          >
            🚪  Sign Out
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main Navbar ───────────────────────────────────────────────────────────
export default function Navbar() {
  const { navigate, page, user, signOut, watchlist } = useApp()
  const scrolled = useScrolled(36)
  const [mob, setMob] = useState(false)

  const items = [
    ...NAV_ITEMS,
    { id: 'watchlist', label: `Watchlist${watchlist.length ? ` (${watchlist.length})` : ''}` },
  ]

  const S = { fontFamily: "'DM Sans',sans-serif" }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(6,6,15,.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(14px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,.05)' : 'none',
      transition: 'all .3s',
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 62 }}>

        {/* Logo */}
        <div onClick={() => navigate('landing')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 34, height: 34, background: '#e50914', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 18px rgba(229,9,20,.5)' }}>
            <span style={{ color: 'white', fontFamily: "'Bebas Neue',cursive", fontSize: 21 }}>M</span>
          </div>
          <span style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 22, letterSpacing: 2, color: 'white' }}>
            MOVIE<span style={{ color: '#e50914' }}>MIND</span>
          </span>
        </div>

        {/* Desktop nav links */}
        <div className="do" style={{ display: 'flex', gap: 2 }}>
          {items.map(it => (
            <button
              key={it.id} onClick={() => navigate(it.id)}
              style={{
                background: page === it.id ? 'rgba(229,9,20,.1)' : 'none',
                border: 'none',
                borderBottom: page === it.id ? '2px solid #e50914' : '2px solid transparent',
                cursor: 'pointer',
                color: page === it.id ? 'white' : 'rgba(255,255,255,.52)',
                ...S, fontWeight: 500, fontSize: 13,
                padding: '7px 13px',
                borderRadius: page === it.id ? '5px 5px 0 0' : '5px',
                transition: 'all .2s',
              }}
              onMouseOver={e => { if (page !== it.id) { e.currentTarget.style.color = 'rgba(255,255,255,.8)'; e.currentTarget.style.background = 'rgba(255,255,255,.04)' } }}
              onMouseOut={e =>  { if (page !== it.id) { e.currentTarget.style.color = 'rgba(255,255,255,.52)'; e.currentTarget.style.background = 'none' } }}
            >{it.label}</button>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

          {/* Search */}
          <button
            onClick={() => navigate('search')}
            style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.09)', borderRadius: 8, padding: '7px 13px', cursor: 'pointer', color: 'rgba(255,255,255,.66)', display: 'flex', alignItems: 'center', gap: 5, transition: 'all .2s' }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,.1)'}
            onMouseOut={e =>  e.currentTarget.style.background = 'rgba(255,255,255,.06)'}
          >
            <span style={{ fontSize: 14 }}>🔍</span>
            <span className="do" style={{ fontSize: 12, ...S }}>Search</span>
          </button>

          {/* Auth section */}
          {user ? (
            <UserMenu user={user} onSignOut={signOut} navigate={navigate} />
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => navigate('login')}
                style={{ background: 'none', border: '1px solid rgba(255,255,255,.15)', cursor: 'pointer', padding: '7px 14px', borderRadius: 7, fontSize: 12, ...S, color: 'rgba(255,255,255,.75)', transition: 'all .2s' }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,.3)'}
                onMouseOut={e =>  e.currentTarget.style.borderColor = 'rgba(255,255,255,.15)'}
              >Log In</button>
              <button
                className="btn-r"
                onClick={() => navigate('signup')}
                style={{ border: 'none', padding: '7px 16px', borderRadius: 7, fontSize: 12, ...S, fontWeight: 700 }}
              >Sign Up</button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button className="mo" onClick={() => setMob(!mob)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', fontSize: 20, marginLeft: 4 }}>
            {mob ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mob && (
        <div className="mo glass" style={{ padding: '12px 24px', borderTop: '1px solid rgba(255,255,255,.05)' }}>
          {items.map(it => (
            <button
              key={it.id} onClick={() => { navigate(it.id); setMob(false) }}
              style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: page === it.id ? '#e50914' : 'rgba(255,255,255,.68)', padding: '11px 0', fontSize: 15, ...S, borderBottom: '1px solid rgba(255,255,255,.04)' }}
            >{it.label}</button>
          ))}

          {/* Mobile auth row */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 14 }}>
            {user ? (
              <button
                onClick={() => { signOut(); setMob(false) }}
                style={{ flex: 1, padding: '10px', background: 'rgba(229,9,20,.1)', border: '1px solid rgba(229,9,20,.3)', borderRadius: 9, cursor: 'pointer', color: '#e50914', ...S, fontSize: 13, fontWeight: 700 }}
              >🚪 Sign Out ({user.name})</button>
            ) : (
              <>
                <button onClick={() => { navigate('login'); setMob(false) }} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 9, cursor: 'pointer', color: 'white', ...S, fontSize: 13 }}>Log In</button>
                <button className="btn-r" onClick={() => { navigate('signup'); setMob(false) }} style={{ flex: 1, border: 'none', padding: '10px', borderRadius: 9, fontSize: 13, ...S, fontWeight: 700 }}>Sign Up</button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
