// src/pages/LoginPage.jsx
import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import Spinner from '@/components/Spinner'

const Field = ({ k, label, type, placeholder, form, setForm, errors, setErrors, onSubmit }) => {
  const S = { fontFamily: "'DM Sans',sans-serif" }
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'

  return (
    <div>
      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.44)', marginBottom: 6, letterSpacing: '.7px', textTransform: 'uppercase', ...S }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          className="cin-inp"
          type={isPassword ? (show ? 'text' : 'password') : type}
          value={form[k]}
          onChange={e => { setForm(f => ({ ...f, [k]: e.target.value })); setErrors(v => ({ ...v, [k]: '' })) }}
          onKeyDown={e => e.key === 'Enter' && onSubmit()}
          placeholder={placeholder}
          style={{ width: '100%', padding: isPassword ? '12px 40px 12px 15px' : '12px 15px', borderRadius: 10, fontSize: 14, ...S }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(255,255,255,.44)',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 4,
              transition: 'color .2s'
            }}
            onMouseOver={e => e.currentTarget.style.color = 'white'}
            onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,.44)'}
          >
            {show ? '👁️' : '🙈'}
          </button>
        )}
      </div>
      {errors[k] && <p style={{ color: '#ff4444', fontSize: 11, marginTop: 5, ...S }}>{errors[k]}</p>}
    </div>
  )
}

export default function LoginPage() {
  const { navigate, signIn, authErr, setAuthErr } = useApp()
  const [form,   setForm]   = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [busy,   setBusy]   = useState(false)

  const validate = () => {
    const e = {}
    if (!form.email.includes('@'))   e.email    = 'Enter a valid email address'
    if (form.password.length < 6)    e.password  = 'Password must be at least 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    setAuthErr('')
    if (!validate()) return
    setBusy(true)
    const ok = await signIn({ email: form.email, password: form.password })
    setBusy(false)
    if (ok) navigate('landing')
  }

  const handleDemo = async () => {
    setBusy(true)
    await signIn({ email: 'demo@moviemind.ai', password: 'demo123' })
    setBusy(false)
    navigate('landing')
  }

  const S = { fontFamily: "'DM Sans',sans-serif" }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'stretch' }}>

      {/* ── Left visual panel ──────────────────────────────────────── */}
      <div className="do" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <img
          src="https://image.tmdb.org/t/p/original/pbrkL804c8yAv3zBZR4QPEafpAR.jpg"
          alt="Cinema"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => e.target.src = 'https://placehold.co/800x900/06060f/1a1a2e?text=MovieMind'}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right,transparent,rgba(6,6,15,.6) 70%,rgba(6,6,15,1) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 56, left: 44, maxWidth: 340 }}>
          <h2 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 46, color: 'white', lineHeight: 1, marginBottom: 11 }}>
            YOUR PERSONAL<br /><span style={{ color: '#e50914' }}>MOVIE</span> UNIVERSE
          </h2>
          <p style={{ color: 'rgba(255,255,255,.48)', fontSize: 14, lineHeight: 1.7, ...S }}>
            AI-curated recommendations & trailers. Films crafted for your exact taste.
          </p>
          {/* Demo credentials hint */}
          <div style={{ marginTop: 20, padding: '10px 14px', background: 'rgba(229,9,20,.08)', border: '1px solid rgba(229,9,20,.2)', borderRadius: 9 }}>
            <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 11, ...S }}>
              🎬 Demo account:<br />
              <span style={{ color: '#d4a843' }}>demo@moviemind.ai</span> / <span style={{ color: '#d4a843' }}>demo123</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Right form ─────────────────────────────────────────────── */}
      <div style={{ width: 'min(450px,100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '38px 30px' }}>
        <div className="fu" style={{ width: '100%' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 30 }}>
            <div style={{ width: 30, height: 30, background: '#e50914', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(229,9,20,.5)' }}>
              <span style={{ color: 'white', fontFamily: "'Bebas Neue',cursive", fontSize: 18 }}>M</span>
            </div>
            <span style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 20, letterSpacing: 2, color: 'white' }}>
              MOVIE<span style={{ color: '#e50914' }}>MIND</span>
            </span>
          </div>

          <h1 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 42, color: 'white', marginBottom: 5 }}>Sign In</h1>
          <p style={{ color: 'rgba(255,255,255,.38)', fontSize: 13, marginBottom: 26, ...S }}>Welcome back, cinephile</p>

          {/* Global auth error */}
          {authErr && (
            <div style={{ padding: '10px 14px', background: 'rgba(229,9,20,.1)', border: '1px solid rgba(229,9,20,.3)', borderRadius: 9, marginBottom: 16 }}>
              <p style={{ color: '#ff6b6b', fontSize: 13, ...S }}>⚠️ {authErr}</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            <Field k="email"    label="Email"    type="email"    placeholder="you@example.com" form={form} setForm={setForm} errors={errors} setErrors={setErrors} onSubmit={handleSubmit} />
            <Field k="password" label="Password" type="password" placeholder="••••••••" form={form} setForm={setForm} errors={errors} setErrors={setErrors} onSubmit={handleSubmit} />

            <button
              className="btn-r" onClick={handleSubmit} disabled={busy}
              style={{ border: 'none', padding: 14, borderRadius: 10, fontSize: 14, ...S, fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: busy ? .75 : 1 }}
            >
              {busy ? <><Spinner size={17} />Signing in…</> : 'Sign In →'}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.08)' }} />
              <span style={{ color: 'rgba(255,255,255,.28)', fontSize: 11, ...S }}>OR</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.08)' }} />
            </div>

            <button
              onClick={handleDemo} disabled={busy}
              style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', cursor: 'pointer', padding: 13, borderRadius: 10, fontSize: 13, ...S, color: 'rgba(255,255,255,.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all .2s' }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,.09)'}
              onMouseOut={e =>  e.currentTarget.style.background = 'rgba(255,255,255,.05)'}
            >
              🎬 Continue as Demo User
            </button>
          </div>

          <p style={{ textAlign: 'center', marginTop: 22, color: 'rgba(255,255,255,.38)', fontSize: 12, ...S }}>
            No account?{' '}
            <button onClick={() => navigate('signup')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e50914', ...S, fontWeight: 700, fontSize: 12 }}>
              Create one →
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
