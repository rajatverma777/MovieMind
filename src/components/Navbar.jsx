// src/components/Navbar.jsx — Apple-Style Dual Liquid Glass Navigation
// Refined Apple visionOS aesthetic:
// - Frosted liquid glass capsule with subtle dark tint & light blur (prevents text clashing)
// - Centered MovieMind header button (Home action) in top bar — no extra clutter
// - Bottom dock with Profile avatar action button replacing '+'
// - Profile menu directly anchored above the profile button (no more floating far away)
// - Transparent liquid glass popups with minimal blur
import { useState, useRef, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { useHideOnScroll } from '@/hooks'

// Minimalist vector SVG icons matching Apple visionOS style
function GridIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
    </svg>
  )
}

function SearchIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  )
}

function StatsIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  )
}

function BookmarkIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function ChatIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

function MoreIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  )
}

function UserOutlineIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

export default function Navbar() {
  const {
    navigate, page, watchlist, user, logout, alerts, realtime,
    setEditProfileModalOpen, setAccountSettingsModalOpen
  } = useApp()

  const { visible } = useHideOnScroll(6)
  const [showMore, setShowMore] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const moreRef = useRef(null)
  const profileRef = useRef(null)

  const showLogin = page === 'login'

  useEffect(() => {
    const handle = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target) && !e.target.closest('.bnav-more-btn')) {
        setShowMore(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false)
      }
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

  // Primary 5 Navigation items with clean vector icons
  const primaryItems = [
    { id: 'landing',   label: 'Dashboard', icon: (c) => <GridIcon color={c} /> },
    { id: 'search',    label: 'Search',    icon: (c) => <SearchIcon color={c} /> },
    { id: 'dashboard', label: 'Stats',     icon: (c) => <StatsIcon color={c} /> },
    { id: 'watchlist', label: 'Saved',     icon: (c) => <BookmarkIcon color={c} />, badge: watchlist.length > 0 ? watchlist.length : null },
    { id: 'messages',  label: 'Chat',      icon: (c) => <ChatIcon color={c} />, badge: alerts?.unreadMessages > 0 ? alerts.unreadMessages : null },
  ]

  // Secondary Tools in More Menu
  const moreItems = [
    { id: 'friends',      icon: '👥', label: 'Friends',        badge: realtime?.socialAlerts?.requests || null },
    { id: 'consensus',    icon: '🛋️', label: 'Watch Together' },
    { id: 'chat',         icon: '🤖', label: 'AI Chat' },
    { id: 'cinegraph',    icon: '🕸️', label: 'CineGraph 3D' },
    { id: 'mood',         icon: '🎭', label: 'Mood Recs' },
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
          Only centered heading (No left back button, no right profile button)
      ══════════════════════════════════════════════════════════ */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 54,
          zIndex: 150,
          transform: topTransform,
          opacity: topOpacity,
          transition: 'transform 0.36s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.28s ease',
          willChange: 'transform, opacity',
          pointerEvents: visible ? 'all' : 'none'
        }}
      >
        <div
          style={{
            height: '100%',
            background: 'rgba(12, 14, 24, 0.65)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          {/* Centered MovieMind Heading (Home button) */}
          <button
            onClick={() => go('landing')}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: 24,
              padding: '6px 20px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              backdropFilter: 'blur(16px)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
              transition: 'all 0.22s cubic-bezier(0.34, 1.2, 0.64, 1)',
              userSelect: 'none'
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.45)'
              e.currentTarget.style.transform = 'scale(1.02)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(56, 189, 248, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.35)'
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)'
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
            }}
          >
            <span style={{ fontSize: 16 }}>🎬</span>
            <span
              style={{
                fontFamily: "-apple-system, 'SF Pro Display', 'Bebas Neue', cursive",
                fontSize: 20,
                letterSpacing: 2,
                color: 'white',
                fontWeight: 700
              }}
            >
              MOVIE<span style={{ color: '#38bdf8' }}>MIND</span>
            </span>
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════
          BOTTOM LIQUID GLASS DOCK
          - Apple liquid glass capsule with subtle dark tint & light blur
          - Active item pill with blue neon highlight and vector icon
          - Detached floating circular glass Profile avatar button
          - Dynamic profile popup anchored directly above the profile button
          - Hide-on-scroll with Apple-style fluid dynamics
      ══════════════════════════════════════════════════════════ */}
      <div
        className="bottom-nav-wrap"
        style={{
          transform: navTransform,
          opacity: navOpacity,
          transition: 'transform 0.36s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.28s ease',
          willChange: 'transform, opacity',
          pointerEvents: visible ? 'all' : 'none'
        }}
      >
        {/* MORE POPUP MENU (Apple liquid glass with minimal blur) */}
        {showMore && (
          <div
            className="more-menu"
            ref={moreRef}
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 14px)',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(14, 17, 28, 0.82)',
              backdropFilter: 'blur(28px) saturate(190%)',
              WebkitBackdropFilter: 'blur(28px) saturate(190%)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 22,
              padding: 10,
              boxShadow: '0 20px 50px rgba(0,0,0,0.65), inset 0 1px 1px rgba(255,255,255,0.2)',
              zIndex: 350,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 6,
              minWidth: 280,
              animation: 'fadeUp .2s cubic-bezier(.16, 1, 0.3, 1)',
              pointerEvents: 'all'
            }}
          >
            {moreItems.map(item => (
              <button
                key={item.id}
                className={`more-item ${page === item.id ? 'active' : ''}`}
                onClick={() => go(item.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '10px 8px',
                  borderRadius: 14,
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  background: page === item.id ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  color: page === item.id ? '#38bdf8' : 'rgba(255, 255, 255, 0.8)',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: 600,
                  transition: 'all 0.18s ease'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.color = '#ffffff'
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = page === item.id ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)'
                  e.currentTarget.style.color = page === item.id ? '#38bdf8' : 'rgba(255, 255, 255, 0.8)'
                }}
              >
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: 10.5, fontWeight: 600 }}>{item.label}</span>
                {item.badge > 0 && (
                  <span style={{ fontSize: 8.5, background: '#38bdf8', color: '#090910', borderRadius: 8, padding: '1px 5px', fontWeight: 800 }}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Main Liquid Glass Navigation Capsule */}
        <nav
          className="bottom-nav-pill"
          style={{
            background: 'rgba(14, 17, 28, 0.72)',
            backdropFilter: 'blur(24px) saturate(190%)',
            WebkitBackdropFilter: 'blur(24px) saturate(190%)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 100,
            padding: '6px 8px',
            boxShadow: '0 16px 44px rgba(0, 0, 0, 0.55), inset 0 1px 1px 0 rgba(255, 255, 255, 0.25)',
          }}
        >
          {primaryItems.map(item => {
            const isActive = page === item.id
            const activeColor = '#38bdf8'
            const inactiveColor = 'rgba(255, 255, 255, 0.65)'

            return (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  padding: isActive ? '7px 20px' : '7px 16px',
                  borderRadius: 100,
                  cursor: 'pointer',
                  border: isActive ? '1.5px solid #38bdf8' : '1.5px solid transparent',
                  background: isActive ? 'rgba(14, 165, 233, 0.18)' : 'transparent',
                  color: isActive ? activeColor : inactiveColor,
                  boxShadow: isActive ? '0 0 16px rgba(56, 189, 248, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.35)' : 'none',
                  transition: 'all 0.24s cubic-bezier(0.34, 1.2, 0.64, 1)',
                  position: 'relative',
                  userSelect: 'none'
                }}
                onMouseOver={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#ffffff'
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                  }
                }}
                onMouseOut={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = inactiveColor
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                {item.badge > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 2,
                      right: 6,
                      background: '#38bdf8',
                      color: '#090910',
                      borderRadius: 10,
                      fontSize: 8,
                      fontWeight: 800,
                      padding: '1px 5px',
                      minWidth: 15,
                      textAlign: 'center'
                    }}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.icon(isActive ? activeColor : inactiveColor)}
                </div>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: isActive ? 700 : 500,
                    letterSpacing: 0.2,
                    fontFamily: "-apple-system, 'SF Pro Display', 'DM Sans', sans-serif"
                  }}
                >
                  {item.label}
                </span>
              </button>
            )
          })}

          {/* Thin subtle glass divider */}
          <div style={{ width: 1, height: 26, background: 'rgba(255,255,255,0.18)', margin: '0 2px', flexShrink: 0 }} />

          {/* More Drawer Trigger */}
          <button
            className="bnav-more-btn"
            onClick={() => { setShowMore(p => !p); setShowProfile(false) }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              padding: '7px 16px',
              borderRadius: 100,
              cursor: 'pointer',
              border: showMore ? '1.5px solid #38bdf8' : '1.5px solid transparent',
              background: showMore ? 'rgba(14, 165, 233, 0.18)' : 'transparent',
              color: showMore ? '#38bdf8' : 'rgba(255, 255, 255, 0.65)',
              boxShadow: showMore ? '0 0 16px rgba(56, 189, 248, 0.35)' : 'none',
              transition: 'all 0.24s cubic-bezier(0.34, 1.2, 0.64, 1)',
              position: 'relative'
            }}
            onMouseOver={e => {
              if (!showMore) {
                e.currentTarget.style.color = '#ffffff'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
              }
            }}
            onMouseOut={e => {
              if (!showMore) {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)'
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            {totalAlerts > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 6,
                  background: '#38bdf8',
                  color: '#090910',
                  borderRadius: 10,
                  fontSize: 8,
                  fontWeight: 800,
                  padding: '1px 5px',
                  minWidth: 15,
                  textAlign: 'center'
                }}
              >
                {totalAlerts > 99 ? '99+' : totalAlerts}
              </span>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MoreIcon color={showMore ? '#38bdf8' : 'rgba(255,255,255,0.65)'} />
            </div>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: 0.2,
                fontFamily: "-apple-system, 'SF Pro Display', 'DM Sans', sans-serif"
              }}
            >
              More
            </span>
          </button>
        </nav>

        {/* Detached Floating Circular Glass Profile Button with Anchored Popup */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          {showProfile && user && (
            <div
              className="profile-liquid-menu"
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 14px)',
                right: 0,
                background: 'rgba(14, 17, 28, 0.82)',
                backdropFilter: 'blur(28px) saturate(190%)',
                WebkitBackdropFilter: 'blur(28px) saturate(190%)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 22,
                padding: 10,
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                zIndex: 350,
                minWidth: 230,
                animation: 'fadeUp .2s cubic-bezier(.16, 1, 0.3, 1)',
                pointerEvents: 'all'
              }}
            >
              <div
                onClick={() => go('profile')}
                style={{
                  padding: '12px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  borderRadius: 14,
                  transition: 'background 0.15s'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ fontSize: 26, marginBottom: 4 }}>{user.avatar || '🎬'}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255, 255, 255, 0.95)' }}>
                  {user.displayName || user.name}
                </div>
                <div style={{ fontSize: 11, color: '#38bdf8', marginTop: 1 }}>
                  @{user.username} · View Profile →
                </div>
              </div>

              {[
                { label: '✏️  Edit Profile', action: () => { setEditProfileModalOpen(true); setShowProfile(false) } },
                { label: '⚙️  Settings',     action: () => { setAccountSettingsModalOpen(true); setShowProfile(false) } },
                { label: '📊  My Dashboard', action: () => go('dashboard') },
              ].map(({ label, action }) => (
                <button
                  key={label}
                  onClick={action}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    padding: '9px 12px',
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontSize: 13,
                    cursor: 'pointer',
                    borderRadius: 10,
                    fontFamily: 'inherit',
                    transition: 'background .15s'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  {label}
                </button>
              ))}

              <button
                onClick={() => { logout(); setShowProfile(false) }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  padding: '9px 12px',
                  color: '#f87171',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: 10,
                  fontFamily: 'inherit',
                  marginTop: 2,
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  transition: 'background .15s'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                🚪  Sign Out
              </button>
            </div>
          )}

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
            style={{
              position: 'relative',
              width: 54,
              height: 54,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(14, 17, 28, 0.72)',
              backdropFilter: 'blur(24px) saturate(190%)',
              WebkitBackdropFilter: 'blur(24px) saturate(190%)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              boxShadow: '0 16px 44px rgba(0, 0, 0, 0.55), inset 0 1px 1px 0 rgba(255, 255, 255, 0.25)',
              cursor: 'pointer',
              color: 'white',
              transition: 'all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1)'
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = 'rgba(22, 26, 42, 0.85)'
              e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.55)'
              e.currentTarget.style.transform = 'scale(1.06)'
              e.currentTarget.style.boxShadow = '0 16px 44px rgba(0, 0, 0, 0.55), 0 0 16px rgba(56, 189, 248, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'rgba(14, 17, 28, 0.72)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)'
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 16px 44px rgba(0, 0, 0, 0.55), inset 0 1px 1px 0 rgba(255, 255, 255, 0.25)'
            }}
          >
            {user ? (
              <span style={{ fontSize: 24, userSelect: 'none' }}>{user.avatar || '🎬'}</span>
            ) : (
              <UserOutlineIcon size={20} color="white" />
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
      </div>
    </>
  )
}
