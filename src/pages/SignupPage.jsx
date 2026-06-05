// src/pages/SignupPage.jsx
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

export default function SignupPage() {
  const { navigate, signUp, authErr, setAuthErr } = useApp()
  const [form,   setForm]   = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [busy,   setBusy]   = useState(false)
  const [done,   setDone]   = useState(false)  // success state

  const S = { fontFamily: "'DM Sans',sans-serif" }

  const validate = () => {
    const e = {}
    if (form.name.trim().length < 2)          e.name     = 'Name must be at least 2 characters'
    if (!form.email.includes('@'))             e.email    = 'Enter a valid email address'
    if (form.password.length < 6)             e.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirm)        e.confirm  = "Passwords don't match"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    setAuthErr('')
    if (!validate()) return
    setBusy(true)
    const ok = await signUp({ name: form.name.trim(), email: form.email, password: form.password })
    setBusy(false)
    if (ok) { setDone(true); setTimeout(() => navigate('landing'), 1500) }
  }



  // ── Success screen ──────────────────────────────────────────────────
  if (done) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass fu" style={{ textAlign: 'center', padding: 48, borderRadius: 20, maxWidth: 360 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 36, color: 'white', marginBottom: 8 }}>Account Created!</h2>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 14, ...S }}>Welcome to MovieMind, {form.name}! Redirecting…</p>
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}><Spinner size={28} /></div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '88px 24px 40px' }}>
      <div className="fu" style={{ width: 'min(420px,100%)' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
          <div style={{ width: 30, height: 30, background: '#e50914', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(229,9,20,.5)' }}>
            <span style={{ color: 'white', fontFamily: "'Bebas Neue',cursive", fontSize: 18 }}>M</span>
          </div>
          <span style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 20, letterSpacing: 2, color: 'white' }}>
            MOVIE<span style={{ color: '#e50914' }}>MIND</span>
          </span>
        </div>

        <h1 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 42, color: 'white', marginBottom: 5 }}>Create Account</h1>
        <p style={{ color: 'rgba(255,255,255,.38)', fontSize: 13, marginBottom: 26, ...S }}>Join millions of cinephiles</p>

        {/* Global auth error */}
        {authErr && (
          <div style={{ padding: '10px 14px', background: 'rgba(229,9,20,.1)', border: '1px solid rgba(229,9,20,.3)', borderRadius: 9, marginBottom: 16 }}>
            <p style={{ color: '#ff6b6b', fontSize: 13, ...S }}>⚠️ {authErr}</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field k="name"     label="Full Name"        type="text"     placeholder="John Doe" form={form} setForm={setForm} errors={errors} setErrors={setErrors} onSubmit={handleSubmit} />
          <Field k="email"    label="Email"            type="email"    placeholder="you@example.com" form={form} setForm={setForm} errors={errors} setErrors={setErrors} onSubmit={handleSubmit} />
          <Field k="password" label="Password"         type="password" placeholder="Minimum 6 characters" form={form} setForm={setForm} errors={errors} setErrors={setErrors} onSubmit={handleSubmit} />
          <Field k="confirm"  label="Confirm Password" type="password" placeholder="Repeat your password" form={form} setForm={setForm} errors={errors} setErrors={setErrors} onSubmit={handleSubmit} />

          <button
            className="btn-r" onClick={handleSubmit} disabled={busy}
            style={{ border: 'none', padding: 14, borderRadius: 10, fontSize: 14, ...S, fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: busy ? .75 : 1 }}
          >
            {busy ? <><Spinner size={17} />Creating account…</> : 'Create Account →'}
          </button>

          {/* Terms note */}
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,.25)', fontSize: 11, lineHeight: 1.5, ...S }}>
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'rgba(255,255,255,.38)', fontSize: 12, ...S }}>
          Have an account?{' '}
          <button onClick={() => navigate('login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e50914', ...S, fontWeight: 700, fontSize: 12 }}>
            Sign in →
          </button>
        </p>
      </div>
    </div>
  )
}
