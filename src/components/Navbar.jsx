// src/components/Navbar.jsx — Simplified, Clean, Premium Cinematic Navigation Bar
import { useState, useRef, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { useScrolled } from '@/hooks'

export default function Navbar() {
  const {
    navigate,
    page,
    watchlist,
    user,
    logout,
    alerts,
    setProfileModalOpen,
    setEditProfileModalOpen,
    setAccountSettingsModalOpen,
    realtime
  } = useApp()

  const scrolled = useScrolled(24)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Active Dropdowns: 'discover' | 'community' | 'studio' | 'profile' | null
  const [openDropdown, setOpenDropdown] = useState(null)
  const navRef = useRef(null)

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenDropdown(null)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null)
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const toggleDropdown = (name) => {
    setOpenDropdown(prev => (prev === name ? null : name))
  }

  const handleNav = (targetPage) => {
    navigate(targetPage)
    setOpenDropdown(null)
    setMobileMenuOpen(false)
  }

  const S = { fontFamily: "'DM Sans', sans-serif" }

  // Check if any sub-item in a dropdown matches the active page
  const isDiscoverActive = ['mood', 'cinegraph', 'consensus'].includes(page)
  const isCommunityActive = ['friends', 'messages'].includes(page)
  const isStudioActive = ['chat', 'scriptstudio'].includes(page)

  const communityAlertCount = (alerts?.totalAlerts || 0) + (realtime?.socialAlerts?.requests || 0)

  return (
    <nav
      ref={navRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled ? 'rgba(6, 6, 15, 0.96)' : 'rgba(6, 6, 15, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
        transition: 'background 0.3s ease, border 0.3s ease'
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64
        }}
      >
        {/* 1. MovieMind Logo (opens Home; no duplicate Home link) */}
        <div
          onClick={() => handleNav('landing')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, userSelect: 'none' }}
          title="MovieMind Home"
        >
          <div
            style={{
              width: 34,
              height: 34,
              background: '#e50914',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(229, 9, 20, 0.5)'
            }}
          >
            <span style={{ color: 'white', fontFamily: "'Bebas Neue', cursive", fontSize: 22 }}>M</span>
          </div>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 24, letterSpacing: 2, color: 'white' }}>
            MOVIE<span style={{ color: '#e50914' }}>MIND</span>
          </span>
        </div>

        {/* 2. Desktop Navigation Menu */}
        <div className="do" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Discover Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => toggleDropdown('discover')}
              style={{
                background: isDiscoverActive ? 'rgba(229, 9, 20, 0.12)' : 'transparent',
                border: 'none',
                borderBottom: isDiscoverActive ? '2px solid #e50914' : '2px solid transparent',
                borderRadius: '6px 6px 0 0',
                padding: '8px 13px',
                color: isDiscoverActive ? '#ffffff' : 'rgba(255, 255, 255, 0.72)',
                ...S,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                transition: 'all 0.2s'
              }}
              onMouseOver={e => { if (!isDiscoverActive) e.currentTarget.style.color = '#ffffff' }}
              onMouseOut={e => { if (!isDiscoverActive) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.72)' }}
            >
              <span>Discover</span>
              <span style={{ fontSize: 9, opacity: 0.6, transform: openDropdown === 'discover' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
            </button>

            {openDropdown === 'discover' && (
              <div
                className="glass"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: 6,
                  width: 210,
                  borderRadius: 12,
                  background: '#0a0a16',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  padding: '8px 0',
                  boxShadow: '0 20px 48px rgba(0, 0, 0, 0.85)',
                  zIndex: 200
                }}
              >
                <button
                  onClick={() => handleNav('mood')}
                  style={{ width: '100%', textAlign: 'left', background: page === 'mood' ? 'rgba(229,9,20,0.1)' : 'transparent', border: 'none', padding: '10px 16px', color: page === 'mood' ? '#e50914' : 'white', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, ...S }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseOut={e => e.currentTarget.style.background = page === 'mood' ? 'rgba(229,9,20,0.1)' : 'transparent'}
                >
                  <span style={{ fontSize: 16 }}>🎭</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>Mood Recs</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Emotional curves & vibes</div>
                  </div>
                </button>

                <button
                  onClick={() => handleNav('cinegraph')}
                  style={{ width: '100%', textAlign: 'left', background: page === 'cinegraph' ? 'rgba(229,9,20,0.1)' : 'transparent', border: 'none', padding: '10px 16px', color: page === 'cinegraph' ? '#e50914' : 'white', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, ...S }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseOut={e => e.currentTarget.style.background = page === 'cinegraph' ? 'rgba(229,9,20,0.1)' : 'transparent'}
                >
                  <span style={{ fontSize: 16 }}>🕸️</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>CineGraph 3D</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Cinema knowledge graph</div>
                  </div>
                </button>

                <button
                  onClick={() => handleNav('consensus')}
                  style={{ width: '100%', textAlign: 'left', background: page === 'consensus' ? 'rgba(229,9,20,0.1)' : 'transparent', border: 'none', padding: '10px 16px', color: page === 'consensus' ? '#e50914' : 'white', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, ...S }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseOut={e => e.currentTarget.style.background = page === 'consensus' ? 'rgba(229,9,20,0.1)' : 'transparent'}
                >
                  <span style={{ fontSize: 16 }}>🛋️</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>Consensus</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Pareto multi-user decision</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Community Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => toggleDropdown('community')}
              style={{
                background: isCommunityActive ? 'rgba(229, 9, 20, 0.12)' : 'transparent',
                border: 'none',
                borderBottom: isCommunityActive ? '2px solid #e50914' : '2px solid transparent',
                borderRadius: '6px 6px 0 0',
                padding: '8px 13px',
                color: isCommunityActive ? '#ffffff' : 'rgba(255, 255, 255, 0.72)',
                ...S,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                transition: 'all 0.2s'
              }}
              onMouseOver={e => { if (!isCommunityActive) e.currentTarget.style.color = '#ffffff' }}
              onMouseOut={e => { if (!isCommunityActive) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.72)' }}
            >
              <span>Community</span>
              {communityAlertCount > 0 && (
                <span style={{ fontSize: 10, background: '#e50914', color: 'white', padding: '1px 6px', borderRadius: 10, fontWeight: 800 }}>
                  {communityAlertCount}
                </span>
              )}
              <span style={{ fontSize: 9, opacity: 0.6, transform: openDropdown === 'community' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
            </button>

            {openDropdown === 'community' && (
              <div
                className="glass"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: 6,
                  width: 220,
                  borderRadius: 12,
                  background: '#0a0a16',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  padding: '8px 0',
                  boxShadow: '0 20px 48px rgba(0, 0, 0, 0.85)',
                  zIndex: 200
                }}
              >
                <button
                  onClick={() => handleNav('friends')}
                  style={{ width: '100%', textAlign: 'left', background: page === 'friends' ? 'rgba(229,9,20,0.1)' : 'transparent', border: 'none', padding: '10px 16px', color: page === 'friends' ? '#e50914' : 'white', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, ...S }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseOut={e => e.currentTarget.style.background = page === 'friends' ? 'rgba(229,9,20,0.1)' : 'transparent'}
                >
                  <span style={{ fontSize: 16 }}>👥</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Cine-Friends</span>
                      {realtime?.socialAlerts?.requests > 0 && (
                        <span style={{ fontSize: 9, background: '#e50914', color: 'white', padding: '1px 5px', borderRadius: 8 }}>
                          {realtime?.socialAlerts?.requests}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Social circle & friend requests</div>
                  </div>
                </button>

                <button
                  onClick={() => handleNav('messages')}
                  style={{ width: '100%', textAlign: 'left', background: page === 'messages' ? 'rgba(229,9,20,0.1)' : 'transparent', border: 'none', padding: '10px 16px', color: page === 'messages' ? '#e50914' : 'white', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, ...S }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseOut={e => e.currentTarget.style.background = page === 'messages' ? 'rgba(229,9,20,0.1)' : 'transparent'}
                >
                  <span style={{ fontSize: 16 }}>💬</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Messages & Chat</span>
                      {alerts?.unreadMessages > 0 && (
                        <span style={{ fontSize: 9, background: '#e50914', color: 'white', padding: '1px 5px', borderRadius: 8 }}>
                          {alerts?.unreadMessages}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Dedicated live 1-on-1 messenger</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Studio Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => toggleDropdown('studio')}
              style={{
                background: isStudioActive ? 'rgba(229, 9, 20, 0.12)' : 'transparent',
                border: 'none',
                borderBottom: isStudioActive ? '2px solid #e50914' : '2px solid transparent',
                borderRadius: '6px 6px 0 0',
                padding: '8px 13px',
                color: isStudioActive ? '#ffffff' : 'rgba(255, 255, 255, 0.72)',
                ...S,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                transition: 'all 0.2s'
              }}
              onMouseOver={e => { if (!isStudioActive) e.currentTarget.style.color = '#ffffff' }}
              onMouseOut={e => { if (!isStudioActive) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.72)' }}
            >
              <span>Studio</span>
              <span style={{ fontSize: 9, opacity: 0.6, transform: openDropdown === 'studio' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
            </button>

            {openDropdown === 'studio' && (
              <div
                className="glass"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: 6,
                  width: 215,
                  borderRadius: 12,
                  background: '#0a0a16',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  padding: '8px 0',
                  boxShadow: '0 20px 48px rgba(0, 0, 0, 0.85)',
                  zIndex: 200
                }}
              >
                <button
                  onClick={() => handleNav('chat')}
                  style={{ width: '100%', textAlign: 'left', background: page === 'chat' ? 'rgba(229,9,20,0.1)' : 'transparent', border: 'none', padding: '10px 16px', color: page === 'chat' ? '#e50914' : 'white', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, ...S }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseOut={e => e.currentTarget.style.background = page === 'chat' ? 'rgba(229,9,20,0.1)' : 'transparent'}
                >
                  <span style={{ fontSize: 16 }}>🤖</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>AI Chat</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>LangChain movie consultant</div>
                  </div>
                </button>

                <button
                  onClick={() => handleNav('scriptstudio')}
                  style={{ width: '100%', textAlign: 'left', background: page === 'scriptstudio' ? 'rgba(229,9,20,0.1)' : 'transparent', border: 'none', padding: '10px 16px', color: page === 'scriptstudio' ? '#e50914' : 'white', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, ...S }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseOut={e => e.currentTarget.style.background = page === 'scriptstudio' ? 'rgba(229,9,20,0.1)' : 'transparent'}
                >
                  <span style={{ fontSize: 16 }}>🎬</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>Script Studio</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Cinema mashup generator</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Watchlist */}
          <button
            onClick={() => handleNav('watchlist')}
            style={{
              background: page === 'watchlist' ? 'rgba(229, 9, 20, 0.12)' : 'transparent',
              border: 'none',
              borderBottom: page === 'watchlist' ? '2px solid #e50914' : '2px solid transparent',
              borderRadius: '6px 6px 0 0',
              padding: '8px 13px',
              color: page === 'watchlist' ? '#ffffff' : 'rgba(255, 255, 255, 0.72)',
              ...S,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s'
            }}
            onMouseOver={e => { if (page !== 'watchlist') e.currentTarget.style.color = '#ffffff' }}
            onMouseOut={e => { if (page !== 'watchlist') e.currentTarget.style.color = 'rgba(255, 255, 255, 0.72)' }}
          >
            <span>Watchlist</span>
            {watchlist.length > 0 && (
              <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.14)', color: 'white', padding: '1px 6px', borderRadius: 10, fontWeight: 700 }}>
                {watchlist.length}
              </span>
            )}
          </button>

          {/* Dashboard */}
          <button
            onClick={() => handleNav('dashboard')}
            style={{
              background: page === 'dashboard' ? 'rgba(229, 9, 20, 0.12)' : 'transparent',
              border: 'none',
              borderBottom: page === 'dashboard' ? '2px solid #e50914' : '2px solid transparent',
              borderRadius: '6px 6px 0 0',
              padding: '8px 13px',
              color: page === 'dashboard' ? '#ffffff' : 'rgba(255, 255, 255, 0.72)',
              ...S,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={e => { if (page !== 'dashboard') e.currentTarget.style.color = '#ffffff' }}
            onMouseOut={e => { if (page !== 'dashboard') e.currentTarget.style.color = 'rgba(255, 255, 255, 0.72)' }}
          >
            Dashboard
          </button>
        </div>

        {/* 3. Right Controls: One Search + One Profile Avatar Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* One Search Control */}
          <button
            onClick={() => handleNav('search')}
            style={{
              background: page === 'search' ? 'rgba(229,9,20,0.18)' : 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              padding: '7px 12px',
              cursor: 'pointer',
              color: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            onMouseOut={e => e.currentTarget.style.background = page === 'search' ? 'rgba(229,9,20,0.18)' : 'rgba(255, 255, 255, 0.06)'}
            title="Search Movies & Vague Plot"
          >
            <span style={{ fontSize: 13 }}>🔍</span>
            <span className="do" style={{ fontSize: 12, ...S }}>Search</span>
          </button>

          {/* One Profile Avatar Dropdown (or Sign In if unauthenticated) */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => toggleDropdown('profile')}
                style={{
                  background: 'rgba(229, 9, 20, 0.12)',
                  border: '1px solid rgba(229, 9, 20, 0.35)',
                  borderRadius: 24,
                  padding: '4px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: 'white',
                  transition: 'all 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.borderColor = '#e50914'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(229, 9, 20, 0.35)'}
              >
                <span style={{ fontSize: 16 }}>{user.avatar || '🎬'}</span>
                <span className="do" style={{ fontSize: 12, fontWeight: 700, maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  @{user.username || 'user'}
                </span>
                <span style={{ fontSize: 9, opacity: 0.5 }}>▼</span>
              </button>

              {/* Profile Dropdown Menu */}
              {openDropdown === 'profile' && (
                <div
                  className="glass"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 8,
                    width: 240,
                    borderRadius: 14,
                    background: '#0a0a16',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    padding: '8px 0',
                    boxShadow: '0 24px 56px rgba(0, 0, 0, 0.88)',
                    zIndex: 200
                  }}
                >
                  {/* Header info */}
                  <div
                    onClick={() => { handleNav('profile'); setOpenDropdown(null) }}
                    style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.07)', cursor: 'pointer' }}
                    title="Open Full Profile Page"
                  >
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{user.displayName || user.name}</div>
                    <div style={{ fontSize: 12, color: '#e50914', fontWeight: 600 }}>@{user.username}</div>
                    <div style={{ fontSize: 10, color: '#38bdf8', marginTop: 2, fontWeight: 600 }}>
                      View Full Profile & Dashboard ➔
                    </div>
                  </div>

                  {/* 1. My Profile */}
                  <button
                    onClick={() => { handleNav('profile'); setOpenDropdown(null) }}
                    style={{ width: '100%', textAlign: 'left', background: page === 'profile' ? 'rgba(229,9,20,0.1)' : 'transparent', border: 'none', padding: '9px 16px', color: page === 'profile' ? '#e50914' : 'white', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, ...S }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
                    onMouseOut={e => e.currentTarget.style.background = page === 'profile' ? 'rgba(229,9,20,0.1)' : 'transparent'}
                  >
                    <span>👤</span> Full Profile & Dashboard
                  </button>

                  {/* 2. Edit Profile */}
                  <button
                    onClick={() => { setEditProfileModalOpen(true); setOpenDropdown(null) }}
                    style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '9px 16px', color: 'white', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, ...S }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>✏️</span> Edit Profile
                  </button>

                  {/* 3. Account Settings */}
                  <button
                    onClick={() => { setAccountSettingsModalOpen(true); setOpenDropdown(null) }}
                    style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '9px 16px', color: 'white', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, ...S }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>⚙️</span> Account Settings
                  </button>

                  {/* 4. Friends and Messages */}
                  <button
                    onClick={() => handleNav('messages')}
                    style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '9px 16px', color: 'white', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, ...S }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>💬</span> Messages & Live Chat
                  </button>

                  {/* 5. Switch Account / Sign Up */}
                  <button
                    onClick={() => handleNav('login')}
                    style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '9px 16px', color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, borderTop: '1px solid rgba(255, 255, 255, 0.05)', marginTop: 4, ...S }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>👥</span> Switch Account / Sign Up
                  </button>

                  {/* 6. Sign Out */}
                  <button
                    onClick={() => { logout(); setOpenDropdown(null) }}
                    style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '9px 16px', color: '#ff6b6b', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, ...S }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(229, 9, 20, 0.12)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => handleNav('login')}
              style={{
                background: '#e50914',
                border: 'none',
                borderRadius: 8,
                padding: '7px 16px',
                color: 'white',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 0 16px rgba(229,9,20,0.4)',
                ...S
              }}
            >
              <span>🔑</span> Sign In
            </button>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            className="mo"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'white',
              fontSize: 22,
              padding: 4
            }}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* 4. Compact Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div
          className="mo glass"
          style={{
            padding: '16px 24px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(6, 6, 15, 0.98)',
            maxHeight: 'calc(100vh - 64px)',
            overflowY: 'auto'
          }}
        >
          {/* User Status Bar if logged in */}
          {user && (
            <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(229, 9, 20, 0.1)', border: '1px solid rgba(229, 9, 20, 0.25)', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>{user.avatar || '🎬'}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{user.displayName || user.name}</div>
                  <div style={{ fontSize: 11, color: '#e50914' }}>@{user.username}</div>
                </div>
              </div>
              <button
                onClick={() => { handleNav('profile'); setMobileMenuOpen(false) }}
                style={{ background: 'rgba(229,9,20,0.2)', border: '1px solid rgba(229,9,20,0.4)', borderRadius: 6, padding: '5px 10px', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
              >
                Full Profile ➔
              </button>
            </div>
          )}

          {/* Mobile Categories */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.4)', padding: '6px 0', fontWeight: 700 }}>
              Discover
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <button onClick={() => handleNav('mood')} style={{ background: page === 'mood' ? 'rgba(229,9,20,0.2)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 6px', color: 'white', fontSize: 12, cursor: 'pointer' }}>
                <div>🎭</div>Mood Recs
              </button>
              <button onClick={() => handleNav('cinegraph')} style={{ background: page === 'cinegraph' ? 'rgba(229,9,20,0.2)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 6px', color: 'white', fontSize: 12, cursor: 'pointer' }}>
                <div>🕸️</div>CineGraph
              </button>
              <button onClick={() => handleNav('consensus')} style={{ background: page === 'consensus' ? 'rgba(229,9,20,0.2)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 6px', color: 'white', fontSize: 12, cursor: 'pointer' }}>
                <div>🛋️</div>Consensus
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.4)', padding: '6px 0', fontWeight: 700 }}>
              Community & Studio
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              <button onClick={() => handleNav('friends')} style={{ background: page === 'friends' ? 'rgba(229,9,20,0.2)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 4px', color: 'white', fontSize: 11, cursor: 'pointer' }}>
                <div>👥</div>Friends
              </button>
              <button onClick={() => handleNav('messages')} style={{ background: page === 'messages' ? 'rgba(229,9,20,0.2)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 4px', color: 'white', fontSize: 11, cursor: 'pointer' }}>
                <div>💬</div>Messages
              </button>
              <button onClick={() => handleNav('chat')} style={{ background: page === 'chat' ? 'rgba(229,9,20,0.2)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 4px', color: 'white', fontSize: 11, cursor: 'pointer' }}>
                <div>🤖</div>AI Chat
              </button>
              <button onClick={() => handleNav('scriptstudio')} style={{ background: page === 'scriptstudio' ? 'rgba(229,9,20,0.2)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 4px', color: 'white', fontSize: 11, cursor: 'pointer' }}>
                <div>🎬</div>Studio
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button
              onClick={() => handleNav('watchlist')}
              style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '11px 0', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <span>📌</span> Watchlist ({watchlist.length})
            </button>
            <button
              onClick={() => handleNav('dashboard')}
              style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '11px 0', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <span>📊</span> Dashboard
            </button>
          </div>

          {user ? (
            <button
              onClick={() => { logout(); setMobileMenuOpen(false) }}
              style={{ marginTop: 14, width: '100%', background: 'rgba(229, 9, 20, 0.15)', border: '1px solid rgba(229, 9, 20, 0.3)', borderRadius: 8, padding: '11px 0', color: '#ff6b6b', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
            >
              🚪 Sign Out (@{user.username})
            </button>
          ) : (
            <button
              onClick={() => handleNav('login')}
              style={{ marginTop: 14, width: '100%', background: '#e50914', border: 'none', borderRadius: 8, padding: '12px 0', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            >
              🔑 Sign In / Join MovieMind
            </button>
          )}
        </div>
      )}
    </nav>
  )
}
