// src/pages/ChatPage.jsx
// Simplified AI Chatbot: powered by LangChain + Gemini on the backend

import { useState, useEffect, useRef } from 'react'
import DotLoader from '@/components/DotLoader'
import { useApp } from '@/context/AppContext'
import { imgUrl } from '@/data/constants'

const SUGGESTIONS = [
  'Recommend something like Inception',
  'Top psychological thrillers',
  'What should I watch based on my watchlist?',
  'Best sci-fi movies of the past decade',
  'A hidden gem to watch tonight',
]

function renderFormattedText(text) {
  if (!text) return ''
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g)
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} style={{ fontWeight: 700, color: 'white' }}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={idx} style={{ fontStyle: 'italic', color: 'rgba(255,255,255,.7)' }}>{part.slice(1, -1)}</em>
    }
    return part
  })
}

export default function ChatPage() {
  const { navigate, watchlist } = useApp()
  const [msgs, setMsgs] = useState([
    {
      role: 'assistant',
      content: "Hey! I'm **MovieMind AI** 🎬 Ask me for personalized movie recommendations, directors, hidden gems, or what to watch tonight!",
      recommendations: []
    }
  ])
  const [inp, setInp] = useState('')
  const [busy, setBusy] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, busy])

  const send = async (textToSend) => {
    const txt = (textToSend || inp).trim()
    if (!txt || busy) return

    setInp('')
    const newMessages = [...msgs, { role: 'user', content: txt, recommendations: [] }]
    setMsgs(newMessages)
    setBusy(true)

    try {
      const historyPayload = msgs.slice(-6).map(m => ({
        role: m.role,
        content: m.content
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: txt,
          history: historyPayload,
          watchlist: watchlist || []
        })
      })

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`)
      }

      const data = await res.json()
      setMsgs(m => [
        ...m,
        {
          role: 'assistant',
          content: data.message || "Here's what I found for you:",
          recommendations: Array.isArray(data.recommendations) ? data.recommendations : []
        }
      ])
    } catch (err) {
      console.error('[ChatPage] Error sending message:', err)
      setMsgs(m => [
        ...m,
        {
          role: 'assistant',
          content: `⚠️ Could not reach the AI server (${err.message}). Make sure the backend is running with \`npm run server\` or \`npm run dev\`.`,
          recommendations: []
        }
      ])
    } finally {
      setBusy(false)
    }
  }

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const S = { fontFamily: "'DM Sans',sans-serif" }

  return (
    <div style={{ minHeight: '100vh', padding: '88px 24px 24px', display: 'flex', flexDirection: 'column', maxWidth: 820, margin: '0 auto' }}>
      {/* Header */}
      <div className="fu" style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 46, letterSpacing: 1, color: 'white', marginBottom: 3 }}>
          AI <span style={{ color: '#e50914' }}>Chatbot</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,.38)', fontSize: 13, ...S }}>
          Your personal movie assistant for smart recommendations and film discovery
        </p>
      </div>

      {/* Chat messages viewport */}
      <div className="glass" style={{ flex: 1, minHeight: 400, borderRadius: 16, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 14 }}>
        {msgs.map((m, i) => (
          <div key={i} className="chat-msg" style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 10, alignItems: 'flex-start' }}>
            {m.role === 'assistant' && (
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#e50914,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>
                🤖
              </div>
            )}
            <div style={{
              maxWidth: '82%',
              padding: '12px 16px',
              borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: m.role === 'user' ? '#e50914' : 'rgba(255,255,255,.05)',
              border: m.role === 'user' ? 'none' : '1px solid rgba(255,255,255,.08)',
              color: 'white',
              fontSize: 13.5,
              lineHeight: 1.65,
              ...S,
              whiteSpace: 'pre-wrap',
            }}>
              <div>{renderFormattedText(m.content)}</div>

              {/* Render Structured Movie Recommendation Cards */}
              {m.recommendations && m.recommendations.length > 0 && (
                <div style={{
                  display: 'flex',
                  gap: 12,
                  overflowX: 'auto',
                  paddingTop: 14,
                  paddingBottom: 6,
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(255,255,255,.2) transparent'
                }}>
                  {m.recommendations.map(movie => {
                    const poster = movie.posterPath ? imgUrl(movie.posterPath, 'w185') : null
                    const scorePct = typeof movie.score === 'number' ? Math.round(movie.score * 100) : null

                    return (
                      <div
                        key={movie.movieId}
                        className="mc"
                        onClick={() => navigate('movie', movie.movieId)}
                        style={{
                          width: 124,
                          flexShrink: 0,
                          position: 'relative',
                          cursor: 'pointer',
                          borderRadius: 9,
                          overflow: 'hidden',
                          border: '1px solid rgba(255,255,255,.08)',
                          background: '#13131f',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        }}
                        onMouseOver={e => {
                          e.currentTarget.style.transform = 'translateY(-3px)'
                          e.currentTarget.style.boxShadow = '0 8px 18px rgba(0,0,0,0.6)'
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      >
                        <div style={{ width: 124, height: 175, background: '#13131f', overflow: 'hidden' }}>
                          <img
                            src={poster || `https://placehold.co/124x175/13131f/444?text=${encodeURIComponent(movie.title || '?')}`}
                            alt={movie.title}
                            loading="lazy"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => { e.target.src = `https://placehold.co/124x175/13131f/444?text=${encodeURIComponent(movie.title || '?')}` }}
                          />
                        </div>

                        {/* Top rating badge */}
                        {movie.voteAverage && (
                          <div style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(4px)', borderRadius: 4, padding: '1px 5px', fontSize: 9, fontWeight: 700, color: '#d4a843', border: '1px solid rgba(212,168,67,.25)' }}>
                            ⭐ {movie.voteAverage}
                          </div>
                        )}

                        {/* Score match badge */}
                        {scorePct !== null && (
                          <div style={{ position: 'absolute', top: 5, left: 5, background: 'rgba(229,9,20,.85)', backdropFilter: 'blur(4px)', borderRadius: 4, padding: '1px 5px', fontSize: 8.5, fontWeight: 700, color: 'white' }}>
                            {scorePct}% match
                          </div>
                        )}

                        {/* Bottom overlay with title and reason */}
                        <div style={{ padding: '8px 7px 6px', background: '#0e0e1a' }}>
                          <p style={{ color: 'white', fontSize: 10, fontWeight: 700, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {movie.title}
                          </p>
                          {movie.reason && (
                            <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 8.5, margin: '2px 0 0', lineHeight: 1.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {movie.reason}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

        {busy && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#e50914,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
              🤖
            </div>
            <div style={{ padding: '13px 18px', background: 'rgba(255,255,255,.05)', borderRadius: '18px 18px 18px 4px', border: '1px solid rgba(255,255,255,.08)' }}>
              <DotLoader />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input container */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <input
          className="cin-inp"
          value={inp}
          onChange={e => setInp(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask for recommendations, e.g. 'Movies like Interstellar' or 'Top thriller picks'…"
          style={{ flex: 1, padding: '14px 18px', borderRadius: 12, fontSize: 14, ...S }}
        />
        <button
          className="btn-r"
          onClick={() => send()}
          disabled={busy || !inp.trim()}
          style={{ border: 'none', padding: '14px 24px', borderRadius: 12, fontSize: 18, opacity: busy || !inp.trim() ? .45 : 1, transition: 'opacity .2s' }}
        >
          →
        </button>
      </div>

      {/* Prompt suggestions pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {SUGGESTIONS.map(s => (
          <button
            key={s}
            onClick={() => send(s)}
            style={{ padding: '6px 14px', borderRadius: 20, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', cursor: 'pointer', color: 'rgba(255,255,255,.55)', ...S, fontSize: 11, transition: 'all .2s' }}
            onMouseOver={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(229,9,20,.4)' }}
            onMouseOut={e => { e.currentTarget.style.color = 'rgba(255,255,255,.55)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)' }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
