// src/pages/LoginPage.jsx — Production-Ready Authentication & CineID Suite
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

export default function LoginPage() {
  const { user, login, logout, navigate, redirectAfterLogin, watchlist } = useApp()

  // Tabs: 'signin' | 'signup' | 'forgot' | 'reset'
  const [tab, setTab] = useState('signin')

  // ── Sign In State ─────────────────────────────────────────────────────────
  const [signInId, setSignInId] = useState('') // email or username
  const [signInPassword, setSignInPassword] = useState('')
  const [showSignInPassword, setShowSignInPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [signInBusy, setSignInBusy] = useState(false)
  const [signInError, setSignInError] = useState('')

  // ── Sign Up State ─────────────────────────────────────────────────────────
  const [regFullName, setRegFullName] = useState('')
  const [regUsername, setRegUsername] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [regAvatar, setRegAvatar] = useState('🎬')
  const [regBio, setRegBio] = useState('')
  const [regGenres, setRegGenres] = useState([878, 53]) // Sci-Fi & Thriller
  const [regBusy, setRegBusy] = useState(false)
  const [regError, setRegError] = useState('')

  // Live validation states
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState(null)
  const [usernameMsg, setUsernameMsg] = useState('')
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [emailAvailable, setEmailAvailable] = useState(null)
  const [emailMsg, setEmailMsg] = useState('')

  const debUsernameRef = useRef(null)
  const debEmailRef = useRef(null)

  // ── Forgot & Reset Password State ─────────────────────────────────────────
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotBusy, setForgotBusy] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState('')
  const [forgotError, setForgotError] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [resetBusy, setResetBusy] = useState(false)
  const [resetSuccess, setResetSuccess] = useState('')
  const [resetError, setResetError] = useState('')

  // ── Live Username Availability Debounce ───────────────────────────────────
  useEffect(() => {
    if (tab !== 'signup' || !regUsername.trim()) {
      setUsernameAvailable(null)
      setUsernameMsg('')
      return
    }
    setCheckingUsername(true)
    clearTimeout(debUsernameRef.current)
    debUsernameRef.current = setTimeout(async () => {
      try {
        const clean = regUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
        if (clean.length < 3) {
          setUsernameAvailable(false)
          setUsernameMsg('Username must be at least 3 characters.')
          setCheckingUsername(false)
          return
        }
        const res = await fetch(`/api/auth/check-username?u=${clean}`).then(r => r.json())
        setUsernameAvailable(res.available)
        setUsernameMsg(res.available ? `✓ @${clean} is available!` : `✕ @${clean} is already taken.`)
      } catch {
        setUsernameAvailable(null)
      } finally {
        setCheckingUsername(false)
      }
    }, 350)
    return () => clearTimeout(debUsernameRef.current)
  }, [regUsername, tab])

  // ── Live Email Availability Debounce ──────────────────────────────────────
  useEffect(() => {
    if (tab !== 'signup' || !regEmail.trim()) {
      setEmailAvailable(null)
      setEmailMsg('')
      return
    }
    setCheckingEmail(true)
    clearTimeout(debEmailRef.current)
    debEmailRef.current = setTimeout(async () => {
      try {
        const clean = regEmail.trim().toLowerCase()
        if (!clean.includes('@') || clean.length < 5) {
          setEmailAvailable(false)
          setEmailMsg('Please enter a valid email address.')
          setCheckingEmail(false)
          return
        }
        const res = await fetch(`/api/auth/check-email?e=${clean}`).then(r => r.json())
        setEmailAvailable(res.available)
        setEmailMsg(res.available ? '✓ Email is available.' : '✕ An account with this email already exists.')
      } catch {
        setEmailAvailable(null)
      } finally {
        setCheckingEmail(false)
      }
    }, 350)
    return () => clearTimeout(debEmailRef.current)
  }, [regEmail, tab])

  // ── Handle Sign In ────────────────────────────────────────────────────────
  const handleSignIn = async (e) => {
    if (e) e.preventDefault()
    if (!signInId.trim() || !signInPassword) {
      setSignInError('Please enter your email/username and password.')
      return
    }

    setSignInBusy(true)
    setSignInError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          loginId: signInId.trim(),
          password: signInPassword,
          rememberMe
        })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Login failed. Please check credentials.')
      }
      login(data.user, rememberMe)
    } catch (err) {
      setSignInError(err.message)
    } finally {
      setSignInBusy(false)
    }
  }

  // ── Handle Sign Up ────────────────────────────────────────────────────────
  const handleSignUp = async (e) => {
    if (e) e.preventDefault()
    if (!regEmail.trim()) {
      setRegError('Email address is required.')
      return
    }
    if (usernameAvailable === false) {
      setRegError('Please choose an available username.')
      return
    }
    if (emailAvailable === false) {
      setRegError('This email is already in use. Please sign in.')
      return
    }
    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters long.')
      return
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match.')
      return
    }

    setRegBusy(true)
    setRegError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          displayName: regFullName.trim() || regUsername.trim(),
          username: regUsername.trim(),
          email: regEmail.trim(),
          password: regPassword,
          avatar: regAvatar,
          bio: regBio.trim(),
          favoriteGenres: regGenres
        })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Registration failed.')
      }
      login(data.user, true)
    } catch (err) {
      setRegError(err.message)
    } finally {
      setRegBusy(false)
    }
  }

  // ── Handle Forgot Password ────────────────────────────────────────────────
  const handleForgotPassword = async (e) => {
    if (e) e.preventDefault()
    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setForgotError('Please enter a valid email address.')
      return
    }
    setForgotBusy(true)
    setForgotError('')
    setForgotSuccess('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to request password reset.')

      setForgotSuccess(data.message)
      if (data.token) {
        setResetToken(data.token)
      }
    } catch (err) {
      setForgotError(err.message)
    } finally {
      setForgotBusy(false)
    }
  }

  // ── Handle Reset Password ─────────────────────────────────────────────────
  const handleResetPassword = async (e) => {
    if (e) e.preventDefault()
    if (!resetToken.trim()) {
      setResetError('Password reset token is required.')
      return
    }
    if (newPassword.length < 6) {
      setResetError('New password must be at least 6 characters long.')
      return
    }
    if (newPassword !== confirmNewPassword) {
      setResetError('Passwords do not match.')
      return
    }

    setResetBusy(true)
    setResetError('')
    setResetSuccess('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken.trim(), newPassword })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Password reset failed.')

      setResetSuccess(data.message)
      setTimeout(() => {
        setTab('signin')
        setSignInPassword('')
        setResetSuccess('')
      }, 2000)
    } catch (err) {
      setResetError(err.message)
    } finally {
      setResetBusy(false)
    }
  }

  const toggleGenre = (gid) => {
    setRegGenres(prev => (prev.includes(gid) ? prev.filter(x => x !== gid) : [...prev, gid]))
  }

  const S = { fontFamily: "'DM Sans', sans-serif" }

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '80px 20px 80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        background: 'linear-gradient(135deg, #090910 0%, #0d0d18 60%, #0c0a14 100%)',
        overflow: 'hidden'
      }}
    >
      {/* Subtle Mesh Gradient Orbs */}
      <div className="mesh-bg">
        <div className="mesh-orb" style={{ top: '-10%', left: '15%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(140,80,255,0.22) 0%, transparent 70%)' }} />
        <div className="mesh-orb" style={{ bottom: '-15%', right: '10%', width: 550, height: 550, background: 'radial-gradient(circle, rgba(80,120,255,0.18) 0%, transparent 70%)', animationDelay: '-6s' }} />
        <div className="mesh-orb" style={{ top: '40%', right: '25%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(200,100,255,0.14) 0%, transparent 70%)', animationDelay: '-12s' }} />
      </div>

      <div
        className="lg-card fu"
        style={{
          width: '100%',
          maxWidth: 500,
          borderRadius: 28,
          background: 'rgba(255, 255, 255, 0.07)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 28px 72px rgba(0, 0, 0, 0.75)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 2
        }}
      >
        {/* ── IF USER IS ALREADY LOGGED IN ───────────────────────────────────── */}
        {user ? (
          <div style={{ padding: '40px 32px', textAlign: 'center' }}>
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: 24,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                margin: '0 auto 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 46,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                backdropFilter: 'blur(16px)'
              }}
            >
              {user.avatar || '🎬'}
            </div>
            <h2 style={{ fontFamily: "-apple-system, 'SF Pro Display', 'DM Sans', sans-serif", fontWeight: 700, fontSize: 28, color: 'rgba(255,255,255,0.95)', letterSpacing: -0.5, margin: '0 0 6px' }}>
              {user.displayName || user.name}
            </h2>
            <div style={{ display: 'inline-block', background: 'rgba(140,80,255,0.18)', border: '1px solid rgba(140,80,255,0.35)', borderRadius: 20, padding: '3px 14px', fontSize: 13, color: 'rgba(215,185,255,0.95)', fontWeight: 600 }}>
              @{user.username}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
              Permanent MongoDB CineID: <code style={{ color: '#10b981', fontFamily: 'monospace' }}>{user.id}</code>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, margin: '26px 0 20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 14, border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'rgba(255,255,255,0.95)' }}>{watchlist.length}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Saved Watchlist</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 14, border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>Live</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>MongoDB Session</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => navigate('dashboard')}
                className="lg-btn-primary"
                style={{ border: 'none', padding: '13px 0', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', justifyContent: 'center' }}
              >
                📊 Go to Dashboard
              </button>
              <button
                onClick={() => navigate('friends')}
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', padding: '12px 0', borderRadius: 14, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                💬 Friends & Real-time Chat
              </button>
              <button
                onClick={logout}
                style={{ background: 'transparent', border: '1px solid rgba(255,100,100,0.3)', color: 'rgba(255,120,120,0.9)', padding: '11px 0', borderRadius: 14, fontSize: 12, fontWeight: 600, cursor: 'pointer', marginTop: 4 }}
              >
                🚪 Sign Out
              </button>
            </div>
          </div>
        ) : (
          /* ── UNAUTHENTICATED TABS SUITE ───────────────────────────────────────── */
          <div>
            {/* Header / Brand */}
            <div style={{ padding: '32px 28px 20px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 52, height: 52, borderRadius: 18, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, backdropFilter: 'blur(16px)' }}>
                  🎬
                </div>
                <span style={{ fontFamily: "-apple-system, 'SF Pro Display', 'DM Sans', sans-serif", fontSize: 24, fontWeight: 800, letterSpacing: -0.5, color: 'rgba(255,255,255,0.95)' }}>
                  MovieMind <span style={{ fontWeight: 400, opacity: 0.5 }}>AI</span>
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0, ...S }}>
                Production-grade Cinema AI & Social Suite with MongoDB Atlas
              </p>

              {/* Tab Selector Buttons */}
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 100, padding: 4, marginTop: 20, border: '1px solid rgba(255,255,255,0.08)' }}>
                <button
                  type="button"
                  onClick={() => { setTab('signin'); setSignInError('') }}
                  style={{
                    flex: 1,
                    background: tab === 'signin' ? 'rgba(255,255,255,0.14)' : 'transparent',
                    border: tab === 'signin' ? '1px solid rgba(255,255,255,0.22)' : '1px solid transparent',
                    borderRadius: 90,
                    padding: '9px 0',
                    color: tab === 'signin' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: tab === 'signin' ? 'inset 0 1px 0 rgba(255,255,255,0.15), 0 2px 8px rgba(0,0,0,0.3)' : 'none',
                    ...S
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setTab('signup'); setRegError('') }}
                  style={{
                    flex: 1,
                    background: tab === 'signup' ? 'rgba(255,255,255,0.14)' : 'transparent',
                    border: tab === 'signup' ? '1px solid rgba(255,255,255,0.22)' : '1px solid transparent',
                    borderRadius: 90,
                    padding: '9px 0',
                    color: tab === 'signup' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: tab === 'signup' ? 'inset 0 1px 0 rgba(255,255,255,0.15), 0 2px 8px rgba(0,0,0,0.3)' : 'none',
                    ...S
                  }}
                >
                  Create CineID
                </button>
                {(tab === 'forgot' || tab === 'reset') && (
                  <button
                    type="button"
                    style={{
                      flex: 1,
                      background: 'rgba(255,255,255,0.14)',
                      border: '1px solid rgba(255,255,255,0.22)',
                      borderRadius: 90,
                      padding: '9px 0',
                      color: 'rgba(255,255,255,0.95)',
                      fontSize: 13,
                      fontWeight: 600,
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
                      ...S
                    }}
                  >
                    {tab === 'forgot' ? 'Reset' : 'New Key'}
                  </button>
                )}
              </div>
            </div>

            {/* TAB 1: SIGN IN */}
            {tab === 'signin' && (
              <div style={{ padding: '24px 28px 30px' }}>
                <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {signInError && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#fca5a5' }}>
                      {signInError}
                    </div>
                  )}

                  {/* Email / Username Input */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 6, ...S }}>
                      Email or Username
                    </label>
                    <input
                      type="text"
                      className="cin-inp"
                      placeholder="e.g. alok_verma@moviemind.io or @alok_verma"
                      value={signInId}
                      onChange={e => setSignInId(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14 }}
                      autoFocus
                    />
                  </div>

                  {/* Password Input with Show/Hide Toggle */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', ...S }}>
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => { setTab('forgot'); setForgotError('') }}
                        style={{ background: 'transparent', border: 'none', color: 'rgba(180,140,255,0.95)', fontSize: 12, fontWeight: 600, cursor: 'pointer', ...S }}
                      >
                        Forgot password?
                      </button>
                    </div>

                    <div style={{ position: 'relative' }}>
                      <input
                        type={showSignInPassword ? 'text' : 'password'}
                        className="cin-inp"
                        placeholder="••••••••••••"
                        value={signInPassword}
                        onChange={e => setSignInPassword(e.target.value)}
                        style={{ width: '100%', padding: '11px 40px 11px 14px', borderRadius: 10, fontSize: 14 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignInPassword(!showSignInPassword)}
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 14 }}
                        title={showSignInPassword ? 'Hide password' : 'Show password'}
                      >
                        {showSignInPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me Checkbox */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none', fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      style={{ accentColor: 'rgba(180,130,255,0.9)', width: 16, height: 16, cursor: 'pointer' }}
                    />
                    <span>Remember me on this browser (30-day session)</span>
                  </label>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn-r"
                    disabled={signInBusy}
                    style={{ background: 'rgba(255,255,255,0.90)', color: '#0c0c16', border: 'none', padding: '13px 0', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: signInBusy ? 'not-allowed' : 'pointer', opacity: signInBusy ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4, ...S }}
                  >
                    {signInBusy ? 'Authenticating...' : 'Sign In to MovieMind'}
                  </button>

                  <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                    Don't have a CineID yet?{' '}
                    <button
                      type="button"
                      onClick={() => { setTab('signup'); setRegError('') }}
                      style={{ background: 'transparent', border: 'none', color: 'rgba(180,140,255,0.95)', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Create Account
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: SIGN UP (CREATE CINEID) */}
            {tab === 'signup' && (
              <div style={{ padding: '24px 28px 30px' }}>
                <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {regError && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#fca5a5' }}>
                      {regError}
                    </div>
                  )}

                  {/* Full Name & Username in 2 columns */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 4, ...S }}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="cin-inp"
                        placeholder="e.g. Alok Verma"
                        value={regFullName}
                        onChange={e => setRegFullName(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13 }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 4, ...S }}>
                        Unique Username
                      </label>
                      <input
                        type="text"
                        className="cin-inp"
                        placeholder="e.g. alok_noir"
                        value={regUsername}
                        onChange={e => setRegUsername(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13 }}
                        required
                      />
                    </div>
                  </div>

                  {/* Real-time username status badge */}
                  {usernameMsg && (
                    <div style={{ fontSize: 11, color: usernameAvailable ? '#10b981' : '#f87171', marginTop: -6 }}>
                      {checkingUsername ? 'Checking availability...' : usernameMsg}
                    </div>
                  )}

                  {/* Email Address */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 4, ...S }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="cin-inp"
                      placeholder="cinephile@example.com"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13 }}
                      required
                    />
                    {emailMsg && (
                      <div style={{ fontSize: 11, color: emailAvailable ? '#10b981' : '#f87171', marginTop: 4 }}>
                        {checkingEmail ? 'Validating email...' : emailMsg}
                      </div>
                    )}
                  </div>

                  {/* Passwords in 2 columns with Show/Hide toggle */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 4, ...S }}>
                        Password (min 6)
                      </label>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        className="cin-inp"
                        placeholder="••••••••"
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13 }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 4, ...S }}>
                        Confirm Password
                      </label>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        className="cin-inp"
                        placeholder="••••••••"
                        value={regConfirmPassword}
                        onChange={e => setRegConfirmPassword(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13 }}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -6 }}>
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 11, cursor: 'pointer' }}
                    >
                      {showRegPassword ? 'Hide Passwords' : 'Show Passwords'}
                    </button>
                  </div>

                  {/* Avatar Archetype Picker */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 6, ...S }}>
                      Choose Cinema Avatar Persona
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                      {AVATARS.map(av => (
                        <button
                          key={av.label}
                          type="button"
                          onClick={() => setRegAvatar(av.emoji)}
                          style={{
                            background: regAvatar === av.emoji ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.04)',
                            border: regAvatar === av.emoji ? '1px solid rgba(255,255,255,0.35)' : '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 12,
                            padding: '8px 4px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 3,
                            transition: 'all 0.2s'
                          }}
                        >
                          <span style={{ fontSize: 20 }}>{av.emoji}</span>
                          <span style={{ fontSize: 9, color: regAvatar === av.emoji ? 'white' : 'rgba(255,255,255,0.5)' }}>{av.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Favorite Genres Chips (Powers Taste Match %) */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 6, ...S }}>
                      Favorite Genres (For Friend Taste Compatibility %)
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {Object.entries(GN).slice(0, 10).map(([id, name]) => {
                        const numId = Number(id)
                        const sel = regGenres.includes(numId)
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => toggleGenre(numId)}
                            style={{
                              background: sel ? 'rgba(140,80,255,0.25)' : 'rgba(255,255,255,0.04)',
                              border: sel ? '1px solid rgba(140,80,255,0.45)' : '1px solid rgba(255,255,255,0.08)',
                              borderRadius: 14,
                              padding: '5px 11px',
                              fontSize: 11,
                              color: sel ? 'rgba(230,210,255,0.98)' : 'rgba(255,255,255,0.6)',
                              cursor: 'pointer',
                              transition: 'all 0.15s'
                            }}
                          >
                            {sel ? '✓ ' : ''}{name}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 4, ...S }}>
                      Short Bio (Optional)
                    </label>
                    <input
                      type="text"
                      className="cin-inp"
                      placeholder="e.g. Nolan enthusiast, Sci-Fi aficionado"
                      value={regBio}
                      onChange={e => setRegBio(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 12 }}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn-r"
                    disabled={regBusy}
                    style={{ background: 'rgba(255,255,255,0.90)', color: '#0c0c16', border: 'none', padding: '13px 0', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: regBusy ? 'not-allowed' : 'pointer', opacity: regBusy ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 6, ...S }}
                  >
                    {regBusy ? 'Creating Your CineID...' : 'Create Account & CineID'}
                  </button>

                  <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setTab('signin'); setSignInError('') }}
                      style={{ background: 'transparent', border: 'none', color: 'rgba(180,140,255,0.95)', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Sign In
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: FORGOT PASSWORD */}
            {tab === 'forgot' && (
              <div style={{ padding: '24px 28px 30px' }}>
                <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, ...S }}>
                    Enter the email address registered with your CineID. We will generate a secure expiring reset token.
                  </div>

                  {forgotError && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#fca5a5' }}>
                      {forgotError}
                    </div>
                  )}

                  {forgotSuccess && (
                    <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: 8, padding: '12px 14px', fontSize: 12, color: '#a7f3d0' }}>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>{forgotSuccess}</div>
                      {resetToken && (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ fontSize: 11, opacity: 0.8 }}>Your Reset Token:</div>
                          <code style={{ display: 'block', background: 'rgba(0,0,0,0.5)', padding: '6px 8px', borderRadius: 6, fontSize: 11, wordBreak: 'break-all', marginTop: 4, color: '#34d399' }}>
                            {resetToken}
                          </code>
                          <button
                            type="button"
                            onClick={() => setTab('reset')}
                            className="btn-r"
                            style={{ background: 'rgba(255,255,255,0.90)', color: '#0c0c16', border: 'none', padding: '10px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, marginTop: 10, width: '100%', cursor: 'pointer' }}
                          >
                            Proceed to Reset Password →
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 6, ...S }}>
                      Your Registered Email
                    </label>
                    <input
                      type="email"
                      className="cin-inp"
                      placeholder="e.g. alok_verma@moviemind.io"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14 }}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-r"
                    disabled={forgotBusy}
                    style={{ background: 'rgba(255,255,255,0.90)', color: '#0c0c16', border: 'none', padding: '13px 0', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: forgotBusy ? 'not-allowed' : 'pointer', opacity: forgotBusy ? 0.7 : 1, ...S }}
                  >
                    {forgotBusy ? 'Generating Reset Token...' : 'Generate Password Reset Token'}
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <button
                      type="button"
                      onClick={() => setTab('signin')}
                      style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
                    >
                      ← Back to Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setTab('reset')}
                      style={{ background: 'transparent', border: 'none', color: 'rgba(180,140,255,0.95)', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Already have a token?
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 4: RESET PASSWORD */}
            {tab === 'reset' && (
              <div style={{ padding: '24px 28px 30px' }}>
                <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {resetError && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#fca5a5' }}>
                      {resetError}
                    </div>
                  )}

                  {resetSuccess && (
                    <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: 8, padding: '12px 14px', fontSize: 12, color: '#a7f3d0' }}>
                      {resetSuccess}
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 6, ...S }}>
                      Reset Token
                    </label>
                    <input
                      type="text"
                      className="cin-inp"
                      placeholder="Paste your 48-char reset token"
                      value={resetToken}
                      onChange={e => setResetToken(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 13, fontFamily: 'monospace' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 6, ...S }}>
                      New Password (min 6 chars)
                    </label>
                    <input
                      type="password"
                      className="cin-inp"
                      placeholder="••••••••••••"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14 }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 6, ...S }}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="cin-inp"
                      placeholder="••••••••••••"
                      value={confirmNewPassword}
                      onChange={e => setConfirmNewPassword(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14 }}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-r"
                    disabled={resetBusy}
                    style={{ background: 'rgba(255,255,255,0.90)', color: '#0c0c16', border: 'none', padding: '13px 0', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: resetBusy ? 'not-allowed' : 'pointer', opacity: resetBusy ? 0.7 : 1, ...S }}
                  >
                    {resetBusy ? 'Updating Password...' : 'Save New Password & Sign In'}
                  </button>

                  <div style={{ textAlign: 'center', fontSize: 12 }}>
                    <button
                      type="button"
                      onClick={() => setTab('signin')}
                      style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
