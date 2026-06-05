import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { TMDB_BASE } from '@/data/constants'
import Spinner from '@/components/Spinner'

export default function SetupPage() {
  const { setApiKey } = useApp()
  const [key,  setKey]  = useState('')
  const [busy, setBusy] = useState(false)
  const [err,  setErr]  = useState('')

  const test = async () => {
    if (!key.trim()) { setErr('Please enter an API key'); return }
    setBusy(true); setErr('')
    try {
      const r = await fetch(`${TMDB_BASE}/movie/popular?api_key=${key.trim()}`)
      if (r.ok) setApiKey(key.trim())
      else setErr('Invalid API key — please check and retry.')
    } catch { setErr('Connection failed. Try Demo Mode.') }
    finally { setBusy(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      {/* Radial background glow */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%,rgba(229,9,20,.07) 0%,transparent 68%)' }} />

      {/* Floating rings */}
      {[0,1,2,3,4,5].map(i => (
        <div key={i} className="float-a" style={{ position: 'absolute', width: 60+i*22, height: 60+i*22, borderRadius: '50%', border: '1px solid rgba(229,9,20,.1)', opacity: .28, left: `${7+i*15}%`, top: `${14+i*12}%`, animationDelay: `${i*.7}s`, animationDuration: `${5+i}s` }} />
      ))}

      {/* Card */}
      <div className="glass fu" style={{ width: 'min(450px,100%)', borderRadius: 20, padding: 38, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ width: 68, height: 68, background: 'linear-gradient(135deg,#e50914,#8b1a1a)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 38px rgba(229,9,20,.42)' }}>
            <span style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 42, color: 'white' }}>M</span>
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 36, letterSpacing: 3, color: 'white', marginBottom: 5 }}>
            MOVIE<span style={{ color: '#e50914' }}>MIND</span> AI
          </h1>
          <p style={{ color: 'rgba(255,255,255,.42)', fontSize: 13 }}>AI-Powered Movie Recommendations & Trailers</p>
        </div>

        <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.46)', marginBottom: 7, letterSpacing: '.8px', textTransform: 'uppercase' }}>TMDB API KEY</label>
        <input
          className="cin-inp" type="password" value={key}
          onChange={e => setKey(e.target.value)} onKeyDown={e => e.key === 'Enter' && test()}
          placeholder="Enter your TMDB API key..."
          style={{ width: '100%', padding: '13px 15px', borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans',sans-serif", marginBottom: 7 }}
        />
        {err && <p style={{ color: '#ff4444', fontSize: 12, marginBottom: 9 }}>{err}</p>}

        <div style={{ padding: '9px 13px', borderRadius: 8, background: 'rgba(14,165,233,.07)', border: '1px solid rgba(14,165,233,.17)', marginBottom: 16, display: 'flex', gap: 9, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 14, flexShrink: 0 }}>ℹ️</span>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', lineHeight: 1.5 }}>
            Free API key at{' '}
            <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer" style={{ color: '#0ea5e9' }}>themoviedb.org</a>
            {' '}— takes ~2 min. Or use Demo Mode below.
          </p>
        </div>

        <button className="btn-r" onClick={test} disabled={busy} style={{ width: '100%', border: 'none', padding: 14, borderRadius: 10, fontSize: 15, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 11, opacity: busy ? .74 : 1 }}>
          {busy ? <><Spinner size={17} />Verifying...</> : '🚀 Launch MovieMind AI →'}
        </button>

        <div style={{ textAlign: 'center', position: 'relative', marginBottom: 11 }}>
          <div style={{ height: 1, background: 'rgba(255,255,255,.07)', position: 'absolute', top: '50%', left: 0, right: 0 }} />
          <span style={{ background: 'rgba(10,10,20,.95)', position: 'relative', padding: '0 11px', color: 'rgba(255,255,255,.32)', fontSize: 11 }}>OR</span>
        </div>

        <button className="btn-g" onClick={() => setApiKey('DEMO')} style={{ width: '100%', padding: 13, borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>
          🎬 Try Demo Mode (Curated Films)
        </button>
        <p style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,.22)', marginTop: 13 }}>Demo uses curated data — no API key required</p>
      </div>
    </div>
  )
}
