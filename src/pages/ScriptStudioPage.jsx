// src/pages/ScriptStudioPage.jsx
// AI Script Studio & "What If?" Movie Mashup Generator

import { useState } from 'react'
import { MOCK_MOVIES, imgUrl } from '@/data/constants'
import Spinner from '@/components/Spinner'

const STYLES = [
  { id: 'noir', label: '🕶️ Neo-Noir Psychological Thriller' },
  { id: 'scifi', label: '🌀 Mindfuck Cyberpunk Paradox' },
  { id: 'tarantino', label: '🩸 Tarantino High-Stakes Showdown' },
  { id: 'cosmic', label: '🚀 Existential Cosmic Odyssey' },
  { id: 'jazz', label: '🎷 Frantic High-Tension Jazz Drama' }
]

export default function ScriptStudioPage() {
  const [movieA, setMovieA] = useState(MOCK_MOVIES[1]) // Inception
  const [movieB, setMovieB] = useState(MOCK_MOVIES[10]) // Whiplash
  const [style, setStyle]   = useState(STYLES[0].label)

  const [busy, setBusy]     = useState(false)
  const [mashup, setMashup] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleSynthesize = async () => {
    setBusy(true)
    try {
      const res = await fetch('/api/ai/mashup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieA, movieB, style })
      })

      if (res.ok) {
        const data = await res.json()
        setMashup(data)
      } else {
        throw new Error('API failed')
      }
    } catch {
      // Offline fallback
      setMashup({
        title: `${movieA.title.toUpperCase()}: THE ${movieB.title.toUpperCase()} PROTOCOL`,
        logline: `When the psychological stakes of ${movieA.title} collide with the relentless tempo of ${movieB.title}, an obsessed specialist must infiltrate a dream to teach an impossible rhythm before reality collapses.`,
        directorVision: `Shot on 70mm anamorphic lenses with razor-sharp syncopated whip pans, scored to roaring double-time big band drums interwoven with deep subterranean brass synths.`,
        dreamCast: [
          { character: 'Dom Cobb / The Conductor', playedBy: 'Leonardo DiCaprio', role: 'A veteran subconscious extractor driven to the brink of madness.' },
          { character: 'Andrew Neiman / The Prodigy', playedBy: 'Miles Teller', role: 'A young architect willing to sacrifice his mind for perfection.' },
          { character: 'Fletcher / The Enforcer', playedBy: 'J.K. Simmons', role: 'The brutal gatekeeper who weaponizes time in the 3rd dream tier.' }
        ],
        screenplay: `INT. RECORDING STUDIO - LIMBO - NIGHT

A lone drum kit sits under a single HARSH OVERHEAD SPOTLIGHT. Water drips from the ceiling in reverse.

DOM COBB (40s, rain-soaked tuxedo) checks his spinning brass totem. It spins with terrifying precision, perfectly in sync with an invisible 300 BPM METRONOME.

FLETCHER (60s, black T-shirt, venomous gaze) steps from the dark void.

FLETCHER
Were you rushing, or were you dragging?

COBB
Neither. We're on the fifth level of the subconscious. In three seconds, the kick will reverberate through the floorboards.

ANDREW (20s, bleeding knuckles wrapped in white tape) grips his drumsticks. His eyes burn with feverish obsession.

ANDREW
I don't care what tier we're on. Count me in.

FLETCHER
(whispering into Andrew's ear)
If you drop the beat, you wake up in an asylum. If you keep the tempo... you wake the world.

Andrew's sticks HIT THE CYMBAL with deafening ferocity. The concrete walls SHATTER into floating geometric dust.

FADE OUT.`,
        posterConcept: {
          colorPalette: 'Obsidian Black, Blood Amber, and Neon Gold',
          composition: 'A silhouette of a drummer silhouetted inside a collapsing labyrinth of skyscrapers.',
          tagline: 'Perfection Has a Countdown.'
        }
      })
    } finally {
      setBusy(false)
    }
  }

  const copyScript = () => {
    if (!mashup?.screenplay) return
    navigator.clipboard?.writeText?.(mashup.screenplay)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', padding: '20px 24px 64px', maxWidth: 1400, margin: '0 auto', fontFamily: "'DM Sans',sans-serif" }}>
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="fu" style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(212,168,67,.12)', border: '1px solid rgba(212,168,67,.25)', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 700, color: '#d4a843', marginBottom: 8 }}>
          <span>🎬</span> GENERATIVE SCRIPT LAB & WRITERS ROOM
        </div>
        <h1 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 50, letterSpacing: 1, color: 'white', marginBottom: 5 }}>
          AI Script <span style={{ color: '#d4a843' }}>Studio</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 13, maxWidth: 680 }}>
          Synthesize high-concept cinema mashups. Fuse two incompatible masterpieces into a unified Hollywood logline, dream cast assembly, and screenplay scene excerpt.
        </p>
      </div>

      {/* ── SELECTION BENCH ─────────────────────────────────────────────── */}
      <div className="fu d1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20, marginBottom: 24 }}>
        {/* Movie A Selector */}
        <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 11, color: '#e50914', fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>
            PRIMARY FILM SELECTION:
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
            <img
              src={imgUrl(movieA.poster_path, 'w185')}
              alt={movieA.title}
              style={{ width: 60, height: 90, borderRadius: 8, objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>{movieA.title}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>
                ⭐ {movieA.vote_average?.toFixed(1)} · {movieA.release_date?.split('-')[0]}
              </div>
            </div>
          </div>
          <select
            value={movieA.id}
            onChange={e => {
              const found = MOCK_MOVIES.find(m => m.id === Number(e.target.value))
              if (found) setMovieA(found)
            }}
            style={{ width: '100%', background: '#0e0e1c', color: 'white', border: '1px solid rgba(255,255,255,.15)', borderRadius: 8, padding: '9px 12px', fontSize: 12, outline: 'none' }}
          >
            {MOCK_MOVIES.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
        </div>

        {/* Fusion Icon */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(212,168,67,.15)', border: '1px solid rgba(212,168,67,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            ✖️
          </div>
        </div>

        {/* Movie B Selector */}
        <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 11, color: '#8b5cf6', fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>
            SECONDARY CROSSOVER FILM:
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
            <img
              src={imgUrl(movieB.poster_path, 'w185')}
              alt={movieB.title}
              style={{ width: 60, height: 90, borderRadius: 8, objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>{movieB.title}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>
                ⭐ {movieB.vote_average?.toFixed(1)} · {movieB.release_date?.split('-')[0]}
              </div>
            </div>
          </div>
          <select
            value={movieB.id}
            onChange={e => {
              const found = MOCK_MOVIES.find(m => m.id === Number(e.target.value))
              if (found) setMovieB(found)
            }}
            style={{ width: '100%', background: '#0e0e1c', color: 'white', border: '1px solid rgba(255,255,255,.15)', borderRadius: 8, padding: '9px 12px', fontSize: 12, outline: 'none' }}
          >
            {MOCK_MOVIES.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
        </div>
      </div>

      {/* ── STYLE SELECTOR & CTA ────────────────────────────────────────── */}
      <div className="fu d2" style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, padding: '18px 22px', marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>Aesthetic Tone:</span>
          {STYLES.map(s => (
            <button
              key={s.id}
              onClick={() => setStyle(s.label)}
              style={{
                background: style === s.label ? '#d4a843' : 'rgba(255,255,255,.05)',
                color: style === s.label ? '#06060f' : 'rgba(255,255,255,.7)',
                border: 'none', borderRadius: 14, padding: '6px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer'
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleSynthesize}
          disabled={busy}
          style={{
            background: 'linear-gradient(135deg,#d4a843,#e50914)',
            border: 'none', borderRadius: 10, padding: '12px 28px', color: 'white',
            fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(212,168,67,.3)', transition: 'all .2s'
          }}
        >
          {busy ? 'Synthesizing Screenplay...' : '⚡ Generate Cinema Mashup'}
        </button>
      </div>

      {/* ── LOADING ─────────────────────────────────────────────────────── */}
      {busy && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 56 }}>
          <Spinner size={46} />
        </div>
      )}

      {/* ── GENERATED SCRIPT PACKAGE ────────────────────────────────────── */}
      {!busy && mashup && (
        <div className="fu" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Pitch Banner */}
          <div style={{ background: 'rgba(212,168,67,.06)', border: '1px solid rgba(212,168,67,.25)', borderRadius: 14, padding: '24px 28px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#d4a843', textTransform: 'uppercase', letterSpacing: '.8px' }}>
              HOLLYWOOD HIGH-CONCEPT PITCH
            </div>
            <h2 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 36, color: 'white', letterSpacing: '1px', margin: '8px 0 12px' }}>
              {mashup.title}
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,.9)', fontStyle: 'italic', lineHeight: 1.6, maxWidth: 880 }}>
              "{mashup.logline}"
            </p>
            <div style={{ marginTop: 14, fontSize: 12, color: 'rgba(255,255,255,.6)', lineHeight: 1.5 }}>
              🎬 <strong style={{ color: 'white' }}>Director's Aesthetic:</strong> {mashup.directorVision}
            </div>
          </div>

          {/* Dream Cast Assembly */}
          {mashup.dreamCast && (
            <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, padding: '20px 24px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0ea5e9', textTransform: 'uppercase', marginBottom: 14 }}>
                🎭 AI Crossover Dream Cast
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 14 }}>
                {mashup.dreamCast.map((c, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{c.character}</div>
                    <div style={{ fontSize: 12, color: '#0ea5e9', marginTop: 2 }}>Played by: {c.playedBy}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 6, lineHeight: 1.4 }}>{c.role}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Authentic Hollywood Screenplay Excerpt */}
          <div style={{ background: '#070711', border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, padding: '28px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid rgba(255,255,255,.08)', paddingBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', letterSpacing: '.6px' }}>
                📄 Authenticated Screenplay Scene Excerpt
              </div>
              <button
                onClick={copyScript}
                style={{ background: 'rgba(255,255,255,.08)', border: 'none', borderRadius: 6, padding: '6px 14px', color: 'white', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
              >
                {copied ? '✓ Copied to Clipboard' : '📋 Copy Screenplay'}
              </button>
            </div>

            {/* Screenplay Content formatted like real script */}
            <pre style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: 13,
              color: '#f1f1f5',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
              background: 'rgba(0,0,0,.3)',
              padding: 20,
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,.05)'
            }}>
              {mashup.screenplay}
            </pre>
          </div>

          {/* Teaser Poster Concept */}
          {mashup.posterConcept && (
            <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase' }}>
                  🎨 Teaser Poster Mood Board
                </div>
                <div style={{ fontSize: 13, color: 'white', marginTop: 4 }}>
                  <strong style={{ color: 'rgba(255,255,255,.5)' }}>Composition:</strong> {mashup.posterConcept.composition}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>
                  Palette: {mashup.posterConcept.colorPalette}
                </div>
              </div>
              <div style={{ padding: '8px 16px', background: 'rgba(139,92,246,.12)', border: '1px solid rgba(139,92,246,.3)', borderRadius: 8, color: '#c4b5fd', fontStyle: 'italic', fontSize: 12 }}>
                "{mashup.posterConcept.tagline}"
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
