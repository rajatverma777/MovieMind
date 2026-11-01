// src/components/AuthModal.jsx
// CineMind Authentication Modal: Unique Username Registration & Login

import { useState, useEffect, useRef } from 'react'
import { useApp } from '@/context/AppContext'
import { GN } from '@/data/constants'

const AVATARS = [
  { emoji: '🎬', label: 'Director' },
  { emoji: '🕶️', label: 'Neo / Noir' },
  { emoji: '🚀', label: 'Explorer' },
  { emoji: '🍿', label: 'Cinephile' },
  { emoji: '⚡', label: 'Hero' },
  { emoji: '🦁', label: 'Epic' },
  { emoji: '🎭', label: 'Drama' },
  { emoji: '🧙', label: 'Mystic' }
]

const DEMO_ACCOUNTS = [
  { username: 'alok_verma', name: 'Alok Verma', avatar: '🕶️', note: 'Thriller & Noir lover' },
  { username: 'yash_bharadwaj', name: 'Yash Bharadwaj', avatar: '🚀', note: 'Nolan & Sci-Fi enthusiast' },
  { username: 'priya_sharma', name: 'Priya Sharma', avatar: '🍿', note: 'Drama & Romance fan' }
]

export default function AuthModal({ isOpen, onClose }) {
  const { login } = useApp()
  const [tab, setTab] = useState('signin') // 'signin' | 'signup'

  // Sign In State
  const [signInUsername, setSignInUsername] = useState('')
  const [signInPassword, setSignInPassword] = useState('')
  const [signInBusy, setSignInBusy] = useState(false)
  const [signInError, setSignInError] = useState('')

  // Sign Up State
  const [regUsername, setRegUsername] = useState('')
  const [regDisplayName, setRegDisplayName] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regAvatar, setRegAvatar] = useState('🎬')
  const [regBio, setRegBio] = useState('')
  const [regGenres, setRegGenres] = useState([878, 53]) // Sci-Fi, Thriller
  const [regBusy, setRegBusy] = useState(false)
  const [regError, setRegError] = useState('')

  // Username availability check
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState(null)
  const [usernameMsg, setUsernameMsg] = useState('')
  const debRef = useRef(null)

  useEffect(() => {
    if (tab !== 'signup' || !regUsername.trim()) {
      setUsernameAvailable(null)
      setUsernameMsg('')
      return
    }

    setCheckingUsername(true)
    clearTimeout(debRef.current)
    debRef.current = setTimeout(async () => {
      try {
        const clean = regUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
        if (clean.length < 3) {
          setUsernameAvailable(false)
          setUsernameMsg('Must be at least 3 characters')
          setCheckingUsername(false)
          return
        }
        const res = await fetch(`/api/auth/check-username?u=${clean}`).then(r => r.json())
        setUsernameAvailable(res.available)
        setUsernameMsg(res.available ? `✓ @${res.username} is available!` : `✕ @${clean} is already taken`)
      } catch {
        setUsernameAvailable(null)
      } finally {
        setCheckingUsername(false)
      }
    }, 350)

    return () => clearTimeout(debRef.current)
  }, [regUsername, tab])

  if (!isOpen) return null

  const handleSignIn = async (e) => {
    if (e) e.preventDefault()
    setSignInBusy(true)
    setSignInError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: signInUsername.trim(),
          password: signInPassword
        })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Login failed')
      }
      login(data.user, true, data.token)
      onClose()
    } catch (err) {
      setSignInError(err.message)
    } finally {
      setSignInBusy(false)
    }
  }

  const handleQuickDemoLogin = async (account) => {
    setSignInUsername(account.username)
    setSignInPassword('password123')
    setSignInBusy(true)
    setSignInError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: account.username,
          password: 'password123'
        })
      })
      const data = await res.json()
      if (res.ok) {
        login(data.user, true, data.token)
        onClose()
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      setSignInError(err.message)
    } finally {
      setSignInBusy(false)
    }
  }

  const handleSignUp = async (e) => {
    if (e) e.preventDefault()
    if (!usernameAvailable) {
      setRegError('Please choose an available unique username.')
      return
    }
    setRegBusy(true)
    setRegError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regUsername.trim(),
          displayName: regDisplayName.trim() || regUsername.trim(),
          password: regPassword,
          avatar: regAvatar,
          bio: regBio.trim(),
          favoriteGenres: regGenres
        })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Sign up failed')
      }
      login(data.user, true, data.token)
      onClose()
    } catch (err) {
      setRegError(err.message)
    } finally {
      setRegBusy(false)
    }
  }

  const toggleGenre = (gid) => {
    setRegGenres(prev =>
      prev.includes(gid) ? prev.filter(x => x !== gid) : [...prev, gid]
    )
  }

  return (
    <div className="mod-bg" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="glass ch"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 460, borderRadius: 18, background: '#0a0a16',
          border: '1px solid rgba(255,255,255,.12)', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,.9)'
        }}
      >
        {/* Header */}
        <div style={{ padding: '22px 24px 16px', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: '#e50914', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(229,9,20,.4)' }}>
              <span style={{ color: 'white', fontFamily: "'Bebas Neue',cursive", fontSize: 18 }}>M</span>
            </div>
            <div>
              <h2 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 22, color: 'white', letterSpacing: 1, margin: 0, lineHeight: 1 }}>
                CINE<span style={{ color: '#e50914' }}>MIND</span> COMMUNITY
              </h2>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', marginTop: 2 }}>
                Social Movie Discovery & Friend Chat
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* Tab switchers */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,.3)', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
          <button
            onClick={() => { setTab('signin'); setSignInError('') }}
            style={{
              flex: 1, padding: '12px 0', background: 'none', border: 'none',
              borderBottom: tab === 'signin' ? '2px solid #e50914' : '2px solid transparent',
              color: tab === 'signin' ? 'white' : 'rgba(255,255,255,.45)',
              fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all .2s'
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('signup'); setRegError('') }}
            style={{
              flex: 1, padding: '12px 0', background: 'none', border: 'none',
              borderBottom: tab === 'signup' ? '2px solid #e50914' : '2px solid transparent',
              color: tab === 'signup' ? 'white' : 'rgba(255,255,255,.45)',
              fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all .2s'
            }}
          >
            Create New CineID
          </button>
        </div>

        {/* ── TAB 1: SIGN IN ──────────────────────────────────────────────── */}
        {tab === 'signin' && (
          <div style={{ padding: 24 }}>
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {signInError && (
                <div style={{ background: 'rgba(229,9,20,.12)', border: '1px solid rgba(229,9,20,.3)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#ff6b6b' }}>
                  {signInError}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Unique Username
                </label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 9, padding: '0 12px' }}>
                  <span style={{ color: 'rgba(255,255,255,.3)', fontSize: 13, marginRight: 4 }}>@</span>
                  <input
                    type="text"
                    value={signInUsername}
                    onChange={e => setSignInUsername(e.target.value)}
                    placeholder="e.g. rajat_verma"
                    required
                    style={{ width: '100%', padding: '11px 0', background: 'none', border: 'none', color: 'white', fontSize: 13, outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Password
                </label>
                <input
                  type="password"
                  value={signInPassword}
                  onChange={e => setSignInPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{ width: '100%', padding: '11px 12px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 9, color: 'white', fontSize: 13, outline: 'none' }}
                />
              </div>

              <button
                type="submit"
                disabled={signInBusy}
                style={{
                  background: '#e50914', border: 'none', borderRadius: 9, padding: '12px 0',
                  color: 'white', fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 700,
                  cursor: signInBusy ? 'default' : 'pointer', marginTop: 4, transition: 'all .2s'
                }}
              >
                {signInBusy ? 'Authenticating...' : 'Sign In to CineMind'}
              </button>
            </form>

            {/* Quick Demo Switcher */}
            <div style={{ marginTop: 22, borderTop: '1px solid rgba(255,255,255,.07)', paddingTop: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', marginBottom: 10 }}>
                ⚡ Fast Demo Accounts (Click to test friend chat instantly):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {DEMO_ACCOUNTS.map(acc => (
                  <button
                    key={acc.username}
                    type="button"
                    onClick={() => handleQuickDemoLogin(acc)}
                    style={{
                      background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)',
                      borderRadius: 9, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      cursor: 'pointer', transition: 'all .2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,.07)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,.03)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{acc.avatar}</span>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>{acc.name}</div>
                        <div style={{ fontSize: 10, color: '#e50914' }}>@{acc.username}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>{acc.note} ➔</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: SIGN UP / CREATE CINEID ─────────────────────────────── */}
        {tab === 'signup' && (
          <div style={{ padding: 24, maxHeight: '72vh', overflowY: 'auto' }}>
            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              {regError && (
                <div style={{ background: 'rgba(229,9,20,.12)', border: '1px solid rgba(229,9,20,.3)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#ff6b6b' }}>
                  {regError}
                </div>
              )}

              {/* Unique Username with Live Availability */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'white', textTransform: 'uppercase', marginBottom: 4 }}>
                  Unique CineID Username *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,.04)', border: `1px solid ${usernameAvailable === true ? '#10b981' : usernameAvailable === false ? '#e50914' : 'rgba(255,255,255,.1)'}`, borderRadius: 9, padding: '0 12px' }}>
                  <span style={{ color: 'rgba(255,255,255,.3)', fontSize: 13, marginRight: 4 }}>@</span>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={e => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="your_unique_username"
                    required
                    style={{ width: '100%', padding: '10px 0', background: 'none', border: 'none', color: 'white', fontSize: 13, outline: 'none' }}
                  />
                  {checkingUsername && <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>Checking...</span>}
                </div>
                {usernameMsg && (
                  <div style={{ fontSize: 11, color: usernameAvailable ? '#10b981' : '#ff6b6b', marginTop: 4, fontWeight: 600 }}>
                    {usernameMsg}
                  </div>
                )}
              </div>

              {/* Display Name */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', marginBottom: 4 }}>
                  Display Name
                </label>
                <input
                  type="text"
                  value={regDisplayName}
                  onChange={e => setRegDisplayName(e.target.value)}
                  placeholder="e.g. Rajat Verma"
                  required
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 9, color: 'white', fontSize: 13, outline: 'none' }}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', marginBottom: 4 }}>
                  Password *
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="At least 4 characters"
                  required
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 9, color: 'white', fontSize: 13, outline: 'none' }}
                />
              </div>

              {/* Choose Cinematic Avatar */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Choose Cine-Avatar:
                </label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {AVATARS.map(av => (
                    <button
                      key={av.emoji}
                      type="button"
                      onClick={() => setRegAvatar(av.emoji)}
                      style={{
                        width: 40, height: 40, borderRadius: 9, fontSize: 20, cursor: 'pointer',
                        background: regAvatar === av.emoji ? 'rgba(229,9,20,.2)' : 'rgba(255,255,255,.04)',
                        border: regAvatar === av.emoji ? '2px solid #e50914' : '1px solid rgba(255,255,255,.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s'
                      }}
                      title={av.label}
                    >
                      {av.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Favorite Genres Selection */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Favorite Movie Genres (for Taste Matching):
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {Object.entries(GN).slice(0, 10).map(([id, name]) => {
                    const active = regGenres.includes(+id)
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggleGenre(+id)}
                        style={{
                          background: active ? '#e50914' : 'rgba(255,255,255,.05)',
                          color: active ? 'white' : 'rgba(255,255,255,.6)',
                          border: 'none', borderRadius: 12, padding: '4px 10px', fontSize: 10,
                          fontWeight: 600, cursor: 'pointer', transition: 'all .2s'
                        }}
                      >
                        {name}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', marginBottom: 4 }}>
                  Short Bio (Optional)
                </label>
                <input
                  type="text"
                  value={regBio}
                  onChange={e => setRegBio(e.target.value)}
                  placeholder="e.g. Nolan enthusiast, always down for a mind-bender."
                  style={{ width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 9, color: 'white', fontSize: 12, outline: 'none' }}
                />
              </div>

              <button
                type="submit"
                disabled={regBusy || !usernameAvailable}
                style={{
                  background: usernameAvailable ? '#e50914' : 'rgba(255,255,255,.1)',
                  border: 'none', borderRadius: 9, padding: '12px 0', color: 'white',
                  fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 700,
                  cursor: usernameAvailable ? 'pointer' : 'default', marginTop: 6, transition: 'all .2s'
                }}
              >
                {regBusy ? 'Creating Your Profile...' : 'Create Account & Join'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
