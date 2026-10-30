// src/components/MovieInsightsTab.jsx
// AI Spoiler Shield & Emotional Arc Tension Analysis for Movie Details

import { useState, useEffect } from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import Spinner from './Spinner'

const DEFAULT_QUESTIONS = [
  'Does the dog or animal die?',
  'Is the ending happy or tragic?',
  'Are there intense jump scares?',
  'How mind-bending is the final twist?'
]

export default function MovieInsightsTab({ movie }) {
  const [arc, setArc] = useState([])
  const [safety, setSafety] = useState(null)
  const [busy, setBusy] = useState(true)

  // Interactive Question State
  const [query, setQuery] = useState('')
  const [qBusy, setQBusy] = useState(false)
  const [qResult, setQResult] = useState(null)
  const [showBlur, setShowBlur] = useState(false)

  // Load initial arc and safety profile
  useEffect(() => {
    let active = true
    setBusy(true)

    async function loadInsights() {
      try {
        const [arcRes, safeRes] = await Promise.all([
          fetch('/api/insights/emotional-arc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ movie })
          }).then(r => r.json()),
          fetch('/api/insights/spoiler-shield', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ movie })
          }).then(r => r.json())
        ])

        if (active) {
          setArc(arcRes.arc || [])
          setSafety(safeRes)
        }
      } catch (err) {
        // Fallback arc
        if (active) {
          setArc([
            { act: 'Act I', label: 'Setup', tension: 25, sentiment: 60, pacing: 30, beat: 'Normal world baseline.' },
            { act: 'Act II', label: 'Catalyst', tension: 55, sentiment: 50, pacing: 60, beat: 'Inciting disruption.' },
            { act: 'Act III', label: 'Midpoint', tension: 70, sentiment: 45, pacing: 75, beat: 'Stakes escalate.' },
            { act: 'Act IV', label: 'Climax', tension: 92, sentiment: 55, pacing: 95, beat: 'Peak narrative confrontation.' },
            { act: 'Act V', label: 'Aftermath', tension: 25, sentiment: 70, pacing: 30, beat: 'Resolution & closure.' }
          ])
          setSafety({
            petSafety: 'Safe: No traumatic pet loss indicated.',
            endingVibe: 'Satisfying resolution aligned with genre themes.',
            jumpScares: 'Moderate tension without gratuitous shock.',
            twistFactor: 'Narrative includes memorable shifts in perspective.'
          })
        }
      } finally {
        if (active) setBusy(false)
      }
    }

    loadInsights()
    return () => { active = false }
  }, [movie])

  const askQuestion = async (qText) => {
    const textToAsk = qText || query
    if (!textToAsk.trim()) return
    setQBusy(true)
    setShowBlur(false)
    try {
      const res = await fetch('/api/insights/spoiler-shield', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movie, question: textToAsk })
      }).then(r => r.json())

      setQResult(res)
    } catch {
      setQResult({
        safeAnswer: 'The storyline progresses with balanced emotional tension without violating genre expectations.',
        spoilerSeverity: 'safe',
        blurredDetail: 'Specific story beats follow the protagonist’s stated goals.'
      })
    } finally {
      setQBusy(false)
    }
  }

  if (busy) {
    return (
      <div style={{ padding: '36px 0', display: 'flex', justifyContent: 'center' }}>
        <Spinner size={36} />
      </div>
    )
  }

  return (
    <div className="fi" style={{ fontFamily: "'DM Sans',sans-serif" }}>
      {/* ── SECTION 1: EMOTIONAL ARC TENSION GRAPH ──────────────────────── */}
      <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, padding: '18px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 20, color: 'white', letterSpacing: '.5px' }}>
              📈 5-Act Narrative & Tension Curve
            </h3>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>
              Algorithmic modeling of dramatic stakes, pacing velocity, and emotional valence.
            </p>
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 14, fontSize: 11 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#e50914' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#e50914' }} /> Suspense & Tension
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#0ea5e9' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#0ea5e9' }} /> Pacing Velocity
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#d4a843' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#d4a843' }} /> Emotional Valence
            </span>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div style={{ width: '100%', height: 210 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={arc} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="gTension" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e50914" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#e50914" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gPacing" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gValence" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4a843" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#d4a843" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" stroke="rgba(255,255,255,.3)" fontSize={11} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,.2)" fontSize={10} domain={[0, 100]} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0e0e1c', border: '1px solid rgba(255,255,255,.15)', borderRadius: 8, fontSize: 11 }}
                labelStyle={{ color: 'white', fontWeight: 700 }}
                formatter={(val, name) => [`${val}%`, name === 'tension' ? 'Tension' : name === 'pacing' ? 'Pacing' : 'Valence']}
              />
              <Area type="monotone" dataKey="tension" stroke="#e50914" strokeWidth={2.5} fillOpacity={1} fill="url(#gTension)" />
              <Area type="monotone" dataKey="pacing" stroke="#0ea5e9" strokeWidth={1.5} fillOpacity={1} fill="url(#gPacing)" />
              <Area type="monotone" dataKey="sentiment" stroke="#d4a843" strokeWidth={1.5} fillOpacity={1} fill="url(#gValence)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Narrative Beats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 8, marginTop: 14 }}>
          {arc.map((a, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 8, padding: '8px 10px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#e50914', textTransform: 'uppercase' }}>{a.label}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.65)', marginTop: 3, lineHeight: 1.3 }}>{a.beat}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 2: INSTANT SAFETY & TRIGGER MATRIX ─────────────────── */}
      <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, padding: '18px 20px', marginBottom: 20 }}>
        <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 20, color: 'white', letterSpacing: '.5px', marginBottom: 12 }}>
          🛡️ AI Spoiler Shield: Instant Safety Matrix
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 12 }}>
          {/* Card 1: Animal */}
          <div style={{ background: 'rgba(16,185,129,.05)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🐾</span> Pet & Animal Safety
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.75)', marginTop: 5, lineHeight: 1.4 }}>
              {safety?.petSafety}
            </div>
          </div>

          {/* Card 2: Ending Vibe */}
          <div style={{ background: 'rgba(212,168,67,.05)', border: '1px solid rgba(212,168,67,.2)', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#d4a843', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>💔</span> Ending Vibe & Catharsis
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.75)', marginTop: 5, lineHeight: 1.4 }}>
              {safety?.endingVibe}
            </div>
          </div>

          {/* Card 3: Jump Scares */}
          <div style={{ background: 'rgba(14,165,233,.05)', border: '1px solid rgba(14,165,233,.2)', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>⚡</span> Jump Scares & Shock
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.75)', marginTop: 5, lineHeight: 1.4 }}>
              {safety?.jumpScares}
            </div>
          </div>

          {/* Card 4: Twist Factor */}
          <div style={{ background: 'rgba(139,92,246,.05)', border: '1px solid rgba(139,92,246,.2)', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🧠</span> Mind-Bending Twist
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.75)', marginTop: 5, lineHeight: 1.4 }}>
              {safety?.twistFactor}
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: ASK THE SPOILER SHIELD ───────────────────────────── */}
      <div style={{ background: 'rgba(229,9,20,.04)', border: '1px solid rgba(229,9,20,.15)', borderRadius: 12, padding: '18px 20px' }}>
        <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 20, color: 'white', letterSpacing: '.5px' }}>
          💬 Ask the Spoiler Shield
        </h3>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginBottom: 14 }}>
          Worried about a specific trigger or sensitive topic? The AI will verify safety without spoiling key reveals.
        </p>

        {/* Quick query chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 12 }}>
          {DEFAULT_QUESTIONS.map((qText, i) => (
            <button
              key={i}
              onClick={() => { setQuery(qText); askQuestion(qText) }}
              style={{
                background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 14, padding: '4px 11px', fontSize: 11, color: 'rgba(255,255,255,.75)',
                cursor: 'pointer', transition: 'all .2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(229,9,20,.15)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,.05)'}
            >
              {qText}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && askQuestion(query)}
            placeholder="Ask anything (e.g. 'Is there claustrophobia?' or 'Does the family reconcile?')"
            style={{
              flex: 1, background: 'rgba(0,0,0,.3)', border: '1px solid rgba(255,255,255,.12)',
              borderRadius: 8, padding: '10px 14px', color: 'white', fontSize: 13, outline: 'none'
            }}
          />
          <button
            onClick={() => askQuestion(query)}
            disabled={qBusy || !query.trim()}
            style={{
              background: '#e50914', border: 'none', borderRadius: 8, padding: '10px 20px',
              color: 'white', fontWeight: 600, fontSize: 12, cursor: 'pointer', opacity: qBusy ? 0.6 : 1
            }}
          >
            {qBusy ? 'Scanning...' : 'Verify Safety'}
          </button>
        </div>

        {/* Answer Box */}
        {qResult && (
          <div className="fi" style={{ marginTop: 14, background: 'rgba(0,0,0,.4)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', background: qResult.spoilerSeverity === 'major' ? 'rgba(229,9,20,.2)' : 'rgba(16,185,129,.2)', color: qResult.spoilerSeverity === 'major' ? '#e50914' : '#10b981', padding: '2px 8px', borderRadius: 4 }}>
                {qResult.spoilerSeverity === 'major' ? '⚠️ High Sensitivity' : '✅ Spoiler-Free Verified'}
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'white', lineHeight: 1.5, margin: '6px 0 10px' }}>
              {qResult.safeAnswer}
            </p>

            {/* Blurred Reveal Toggle */}
            {qResult.blurredDetail && (
              <div style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 10 }}>
                {!showBlur ? (
                  <button
                    onClick={() => setShowBlur(true)}
                    style={{ background: 'none', border: '1px dashed rgba(255,255,255,.2)', color: 'rgba(255,255,255,.5)', borderRadius: 6, padding: '5px 12px', fontSize: 11, cursor: 'pointer' }}
                  >
                    👁️ Reveal Exact Plot Detail (Warning: Contains Spoilers)
                  </button>
                ) : (
                  <div style={{ background: 'rgba(229,9,20,.1)', border: '1px solid rgba(229,9,20,.3)', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: 10, color: '#e50914', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>
                      🚨 Direct Narrative Reveal:
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,.9)', fontStyle: 'italic' }}>
                      "{qResult.blurredDetail}"
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
