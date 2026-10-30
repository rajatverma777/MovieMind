// src/components/Navbar.jsx — Apple-Style Dual Liquid Glass Navigation
// Features: Centered MovieMind home button, Image 2 style liquid glass dock, hide on scroll down with speed
import { useState, useRef, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { useHideOnScroll } from '@/hooks'

export default function Navbar() {
  const {
    navigate, page, watchlist, user, logout, alerts, realtime,
    setEditProfileModalOpen, setAccountSettingsModalOpen
  } = useApp()

  const { visible, scrolled } = useHideOnScroll(8)
  const [showMore, setShowMore] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const moreRef = useRef(null)
  const profileRef = useRef(null)

  const showLogin = page === 'login'

  useEffect(() => {
    const handle = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setShowMore(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false)
    }
    const esc = (e) => {
      if (e.key === 'Escape') {
        setShowMore(false)
        setShowProfile(false)
      }
    }
    document.addEventListener('mousedown', handle)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', handle)
      document.removeEventListener('keydown', esc)
    }
  }, [])

  const go = (p) => {
    navigate(p)
    setShowMore(false)
    setShowProfile(false)
  }

  const totalAlerts = (alerts?.totalAlerts || 0) + (realtime?.socialAlerts?.requests || 0)

  // Primary 5 nav items (matching Image 2 layout)
  const primaryItems = [
    { id: 'landing',   icon: '🏠', label: 'Home' },
    { id: 'search',    icon: '🔍', label: 'Search' },
    { id: 'dashboard', icon: '📊', label: 'Stats' },
    { id: 'watchlist', icon: '📌', label: 'Saved',  badge: watchlist.length > 0 ? watchlist.length : null },
    { id: 'messages',  icon: '💬', label: 'Chat',   badge: alerts?.unreadMessages > 0 ? alerts.unreadMessages : null },
  ]

  // Secondary tools in More menu
  const moreItems = [
    { id: 'friends',      icon: '👥', label: 'Friends',      badge: realtime?.socialAlerts?.requests || null },
    { id: 'mood',         icon: '🎭', label: 'Mood' },
    { id: 'consensus',    icon: '🛋️', label: 'Watch Together' },
    { id: 'cinegraph',    icon: '🕸️', label: 'CineGraph' },
    { id: 'chat',         icon: '🤖', label: 'AI Chat' },
    { id: 'scriptstudio', icon: '✍️', label: 'Script Studio' },
  ]

  if (showLogin) return null

  // Apple-style hide with speed: Top slides up, bottom slides down
  const topTransform = visible ? 'translateY(0)' : 'translateY(-110%)'
  const navTransform = visible ? 'translateY(0)' : 'translateY(calc(100% + 40px))'
  const topOpacity   = visible ? 1 : 0
  const navOpacity   = visible ? 1 : 0

  return (
    <>
      {/* ══════════════════════════════════════════════════════════
          UPPER NAVIGATION BAR — MovieMind Centered Heading (Home Button)
          Smooth Apple-style hide-on-scroll down, show-on-scroll up
      ══════════════════════════════════════════════════════════ */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          zIndex: 150,
          transform: topTransform,
          opacity: topOpacity,
          transition: 'transform 0.38s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
          willChange: 'transform, opacity',
          pointerEvents: visible ? 'all' : 'none'
        }}
      >
        <div
          style={{
            height: '100%',
            background: scrolled ? 'rgba(8, 10, 18, 0.65)' : 'rgba(8, 10, 18, 0.35)',
            backdropFilter: 'blur(26px) saturate(190%) brightness(1.05)',
            WebkitBackdropFilter: 'blur(26px) saturate(190%) brightness(1.05)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative'
          }}
        >
          {/* Left Section: Back to Home shortcut if on subpages */}
          <div style={{ width: 120, display: 'flex', alignItems: 'center' }}>
            {page !== 'landing' ? (
              <button
                onClick={() => go('landing')}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 16,
                  padding: '4px 12px',
                  color: 'rgba(255, 255, 255, 0.75)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  transition: 'all 0.2s'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.color = '#ffffff'
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)'
                }}
              >
                <span style={{ fontSize: 13 }}>‹</span> Home
              </button>
            ) : null}
          </div>

          {/* EXACT CENTER: MovieMind Heading (Primary Home Button) */}
          <div
            onClick={() => go('landing')}
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 20px',
              borderRadius: 24,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 4px 18px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              transition: 'all 0.22s cubic-bezier(0.34, 1.2, 0.64, 1)',
              userSelect: 'none'
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.28)'
              e.currentTarget.style.transform = 'translateX(-50%) scale(1.03)'
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(56, 189, 248, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)'
              e.currentTarget.style.transform = 'translateX(-50%) scale(1)'
              e.currentTarget.style.boxShadow = '0 4px 18px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}
            title="MovieMind — Click to return to Home"
          >
            <span style={{ fontSize: 16 }}>🎬</span>
            <span
              style={{
                fontFamily: "-apple-system, 'SF Pro Display', 'Bebas Neue', cursive",
                fontSize: 21,
                letterSpacing: 2.2,
                color: 'white',
                fontWeight: 700
              }}
            >
              MOVIE<span style={{ color: '#38bdf8' }}>MIND</span>
            </span>
          </div>

          {/* Right Section: User CineID / Quick Action */}
          <div style={{ width: 120, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            {user ? (
              <div
                onClick={() => { setShowProfile(p => !p); setShowMore(false) }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 20,
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <span style={{ fontSize: 16 }}>{user.avatar || '🎬'}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.85)', maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  @{user.username}
                </span>
                {totalAlerts > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -4,
                    background: '#38bdf8', color: '#090910',
                    borderRadius: 10, fontSize: 8, fontWeight: 800,
                    padding: '1px 5px', minWidth: 15, textAlign: 'center'
                  }}>
                    {totalAlerts > 9 ? '9+' : totalAlerts}
                  </span>
                )}
              </div>
            ) : (
              <button
                onClick={() => go('login')}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 20,
                  padding: '5px 14px',
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════
          PROFILE POPUP MODAL (Slide-up Glass Sheet)
      ══════════════════════════════════════════════════════════ */}
      {showProfile && user && (
        <div
          ref={profileRef}
          style={{
            position: 'fixed',
            bottom: 'calc(var(--bnav-h) + 26px)',
            right: 24,
            background: 'rgba(14, 16, 26, 0.88)',
            backdropFilter: 'blur(36px) saturate(2)',
            WebkitBackdropFilter: 'blur(36px) saturate(2)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 24,
            padding: 10,
            boxShadow: '0 24px 64px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.1)',
            zIndex: 300,
            minWidth: 230,
            animation: 'fadeUp .22s cubic-bezier(.22,1,.36,1)',
          }}
        >
          <div
            onClick={() => go('profile')}
            style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', borderRadius: 14 }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ fontSize: 26, marginBottom: 4 }}>{user.avatar || '🎬'}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.95)' }}>{user.displayName || user.name}</div>
            <div style={{ fontSize: 11, color: '#38bdf8', marginTop: 1 }}>@{user.username} · View Profile →</div>
          </div>

          {[
            { label: '✏️  Edit Profile', action: () => { setEditProfileModalOpen(true); setShowProfile(false) } },
            { label: '⚙️  Settings',     action: () => { setAccountSettingsModalOpen(true); setShowProfile(false) } },
            { label: '📊  My Dashboard', action: () => go('dashboard') },
          ].map(({ label, action }) => (
            <button
              key={label}
              onClick={action}
              style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '10px 14px', color: 'rgba(255,255,255,0.8)', fontSize: 13, cursor: 'pointer', borderRadius: 12, fontFamily: 'inherit', transition: 'background .15s' }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              {label}
            </button>
          ))}

          <button
            onClick={() => { logout(); setShowProfile(false) }}
            style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '10px 14px', color: '#f87171', fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 12, fontFamily: 'inherit', marginTop: 2, borderTop: '1px solid rgba(255,255,255,0.06)', transition: 'background .15s' }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            🚪  Sign Out
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          MORE MENU POPUP MODAL
      ══════════════════════════════════════════════════════════ */}
      {showMore && (
        <div className="more-menu" ref={moreRef}>
          {moreItems.map(item => (
            <button
              key={item.id}
              className={`more-item ${page === item.id ? 'active' : ''}`}
              onClick={() => go(item.id)}
            >
              <span className="more-item-icon">{item.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 600 }}>{item.label}</span>
              {item.badge > 0 && (
                <span style={{ fontSize: 9, background: '#38bdf8', color: '#090910', borderRadius: 8, padding: '1px 5px', fontWeight: 800 }}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          BOTTOM LIQUID GLASS NAVIGATION DOCK (IMAGE 2 DESIGN)
          - Clear transparent liquid glass capsule pill
          - Encapsulated cyan/blue active pill highlight
          - Separate floating circular action/more button
          - Hide-on-scroll with Apple-style dynamics
      ══════════════════════════════════════════════════════════ */}
      <div
        className="bottom-nav-wrap"
        style={{
          transform: navTransform,
          opacity: navOpacity,
          transition: 'transform 0.38s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
          willChange: 'transform, opacity',
          pointerEvents: visible ? 'all' : 'none'
        }}
      >
        {/* Main Clear Glass Navigation Capsule */}
        <nav className="bottom-nav-pill">
          {primaryItems.map(item => {
            const isActive = page === item.id
            return (
              <button
                key={item.id}
                className={`bnav-item ${isActive ? 'active' : ''}`}
                onClick={() => go(item.id)}
                title={item.label}
                style={{ position: 'relative' }}
              >
                {item.badge > 0 && (
                  <span className="bnav-badge">{item.badge > 99 ? '99+' : item.badge}</span>
                )}
                <span className="bnav-icon">{item.icon}</span>
                <span className="bnav-label">{item.label}</span>
              </button>
            )
          })}

          {/* Thin subtle glass divider */}
          <div style={{ width: 1, height: 26, background: 'rgba(255,255,255,0.14)', margin: '0 2px', flexShrink: 0 }} />

          {/* More Drawer Trigger */}
          <button
            className={`bnav-item ${showMore ? 'active' : ''}`}
            onClick={() => { setShowMore(p => !p); setShowProfile(false) }}
            title="More CineMind Features"
            style={{ position: 'relative' }}
          >
            {totalAlerts > 0 && <span className="bnav-badge">{totalAlerts > 99 ? '99+' : totalAlerts}</span>}
            <span className="bnav-icon" style={{ fontSize: 20, letterSpacing: 1 }}>⋯</span>
            <span className="bnav-label">More</span>
          </button>
        </nav>

        {/* Floating Circular Clear Glass Button (Directly matching Image 2 circular floating button) */}
        <button
          className="bnav-circle-btn"
          onClick={() => {
            if (user) {
              setShowProfile(p => !p)
              setShowMore(false)
            } else {
              go('login')
            }
          }}
          title={user ? `@${user.username} — Profile & Settings` : 'Sign In / Join CineMind'}
          style={{ position: 'relative' }}
        >
          {user ? (
            <span style={{ fontSize: 22 }}>{user.avatar || '🎬'}</span>
          ) : (
            <span style={{ fontSize: 20 }}>＋</span>
          )}
          {totalAlerts > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 2,
                right: 2,
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#38bdf8',
                boxShadow: '0 0 8px #38bdf8'
              }}
            />
          )}
        </button>
      </div>
    </>
  )
}
