// src/components/Navbar.jsx
import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { useScrolled } from '@/hooks'

const NAV_ITEMS = [
  { id: 'landing',   label: 'Home' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'mood',      label: 'Mood Recs' },
  { id: 'chat',      label: 'AI Chat' },
]

export default function Navbar() {
  const { navigate, page, watchlist } = useApp()
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
          {/* Search Button */}
          <button
            onClick={() => navigate('search')}
            style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.09)', borderRadius: 8, padding: '7px 13px', cursor: 'pointer', color: 'rgba(255,255,255,.66)', display: 'flex', alignItems: 'center', gap: 5, transition: 'all .2s' }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,.1)'}
            onMouseOut={e =>  e.currentTarget.style.background = 'rgba(255,255,255,.06)'}
          >
            <span style={{ fontSize: 14 }}>🔍</span>
            <span className="do" style={{ fontSize: 12, ...S }}>Search</span>
          </button>


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
        </div>
      )}
    </nav>
  )
}
