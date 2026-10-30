// src/components/Navbar.jsx — Apple Liquid Glass Bottom Navigation Bar
import { useState, useRef, useEffect } from 'react'
import { useApp } from '@/context/AppContext'

export default function Navbar() {
  const {
    navigate, page, watchlist, user, logout, alerts, realtime,
    setEditProfileModalOpen, setAccountSettingsModalOpen
  } = useApp()

  const [showMore, setShowMore] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const moreRef = useRef(null)
  const profileRef = useRef(null)

  useEffect(() => {
    const handle = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setShowMore(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false)
    }
    const esc = (e) => { if (e.key === 'Escape') { setShowMore(false); setShowProfile(false) } }
    document.addEventListener('mousedown', handle)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', handle); document.removeEventListener('keydown', esc) }
  }, [])

  const go = (p) => { navigate(p); setShowMore(false); setShowProfile(false) }

  const totalAlerts = (alerts?.totalAlerts || 0) + (realtime?.socialAlerts?.requests || 0)

  // Primary 5 nav items always visible
  const primaryItems = [
    { id: 'landing', icon: '🎬', label: 'Home' },
    { id: 'search',  icon: '🔍', label: 'Search' },
    { id: 'dashboard', icon: '📊', label: 'Stats' },
    { id: 'watchlist', icon: '📌', label: 'Saved', badge: watchlist.length || null },
    { id: 'messages', icon: '💬', label: 'Chat', badge: (alerts?.unreadMessages > 0 ? alerts.unreadMessages : null) },
  ]

  // More menu items (secondary)
  const moreItems = [
    { id: 'friends',     icon: '👥', label: 'Friends', badge: realtime?.socialAlerts?.requests || null },
    { id: 'mood',        icon: '🎭', label: 'Mood' },
    { id: 'consensus',   icon: '🛋️', label: 'Watch Together' },
    { id: 'cinegraph',   icon: '🕸️', label: 'CineGraph' },
    { id: 'chat',        icon: '🤖', label: 'AI Chat' },
    { id: 'scriptstudio',icon: '✍️', label: 'Script Studio' },
  ]

  return (
    <>
      {/* ── More Menu Popup ── */}
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
                <span style={{ fontSize: 9, background: 'rgba(255,255,255,0.85)', color: '#0c0c16', borderRadius: 8, padding: '1px 5px', fontWeight: 800 }}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Profile Popup ── */}
      {showProfile && user && (
        <div
          ref={profileRef}
          style={{
            position: 'fixed',
            bottom: 'calc(var(--bnav-h) + 28px)',
            right: '16px',
            background: 'rgba(16,16,24,0.92)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 22,
            padding: 10,
            boxShadow: '0 24px 64px rgba(0,0,0,0.75)',
            zIndex: 300,
            minWidth: 220,
            animation: 'fadeUp .2s cubic-bezier(.22,1,.36,1)'
          }}
        >
          {/* User header */}
          <div
            onClick={() => go('profile')}
            style={{ padding: '10px 12px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', borderRadius: 14 }}
          >
            <div style={{ fontSize: 26, marginBottom: 4 }}>{user.avatar || '🎬'}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.95)' }}>{user.displayName || user.name}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>@{user.username} · View Profile →</div>
          </div>

          {[
            { label: '✏️  Edit Profile', action: () => { setEditProfileModalOpen(true); setShowProfile(false) } },
            { label: '⚙️  Settings', action: () => { setAccountSettingsModalOpen(true); setShowProfile(false) } },
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
            style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '10px 14px', color: 'rgba(255,120,120,0.9)', fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 12, fontFamily: 'inherit', marginTop: 2, borderTop: '1px solid rgba(255,255,255,0.06)', transition: 'background .15s' }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,80,80,0.1)'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            🚪  Sign Out
          </button>
        </div>
      )}

      {/* ── Main Bottom Nav Pill ── */}
      <div className="bottom-nav-wrap">
        <nav className="bottom-nav-pill">
          {primaryItems.map(item => (
            <button
              key={item.id}
              className={`bnav-item ${page === item.id ? 'active' : ''}`}
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
          ))}

          {/* Divider */}
          <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.10)', margin: '0 4px', flexShrink: 0 }} />

          {/* More button */}
          <button
            className={`bnav-item ${showMore ? 'active' : ''}`}
            onClick={() => { setShowMore(p => !p); setShowProfile(false) }}
            title="More"
            style={{ position: 'relative' }}
          >
            {totalAlerts > 0 && <span className="bnav-badge">{totalAlerts > 99 ? '99+' : totalAlerts}</span>}
            <span className="bnav-icon">⋯</span>
            <span className="bnav-label">More</span>
          </button>

          {/* Divider */}
          <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.10)', margin: '0 4px', flexShrink: 0 }} />

          {/* Profile / Sign In */}
          {user ? (
            <button
              className={`bnav-item ${showProfile ? 'active' : ''}`}
              onClick={() => { setShowProfile(p => !p); setShowMore(false) }}
              title={`@${user.username}`}
              style={{ position: 'relative' }}
            >
              <span className="bnav-icon">{user.avatar || '🎬'}</span>
              <span className="bnav-label" style={{ maxWidth: 56, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                @{user.username}
              </span>
            </button>
          ) : (
            <button
              className="bnav-item"
              onClick={() => go('login')}
              style={{ background: 'rgba(255,255,255,0.10)', borderRadius: 90 }}
            >
              <span className="bnav-icon">🔑</span>
              <span className="bnav-label">Sign In</span>
            </button>
          )}
        </nav>
      </div>
    </>
  )
}
