// src/pages/ChatPage.jsx
// Fix: Anthropic API requires 'anthropic-dangerous-allow-browser' header for browser requests
// Fallback: Smart keyword-based mock responses when no API key is set

import { useState, useEffect, useRef } from 'react'
import DotLoader from '@/components/DotLoader'
import { MOCK_MOVIES, GN } from '@/data/constants'
import { useApp } from '@/context/AppContext'

const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_KEY || ''

const SUGGESTIONS = [
  'Best sci-fi films ever made',
  'Something like Inception',
  'Top thriller picks',
  'Best animated movies',
  'A hidden gem to watch tonight',
]

const SYSTEM_PROMPT = `You are MovieMind AI, a passionate and knowledgeable movie expert.
Give concise, enthusiastic film recommendations. Always suggest specific movies with the 
director, year, and one compelling reason to watch. Use occasional emojis. Max 120 words.`

// // A set of common English stopwords to clean the search query
const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'to', 'for', 'in', 'of', 'on', 'at', 'by', 'with', 'about', 
  'recommend', 'me', 'movie', 'movies', 'film', 'films', 'show', 'shows', 'find', 'get', 'give', 'suggest', 'suggestion', 
  'best', 'good', 'some', 'something', 'top', 'great', 'favorite', 'want', 'like', 'watch', 'tonight', 'any', 'please', 
  'hello', 'hey', 'hi', 'you', 'i', 'can', 'should', 'would', 'could', 'how', 'what', 'who', 'where', 'when', 'why', 'need',
  'recommendation', 'recommendations', 'please'
])

// Mapping of query keywords to TMDB genre IDs
const GENRE_KEYWORDS = {
  'action': 28, 'fight': 28, 'battle': 28, 'warrior': 28, 'gun': 28, 'explosion': 28, 'hero': 28, 'superhero': 28,
  'adventure': 12, 'quest': 12, 'journey': 12, 'explore': 12, 'travel': 12,
  'animation': 16, 'animated': 16, 'cartoon': 16, 'anime': 16, 'pixar': 16, 'disney': 16, 'ghibli': 16,
  'comedy': 35, 'funny': 35, 'laugh': 35, 'humor': 35, 'hilarious': 35, 'silly': 35, 'joke': 35,
  'crime': 80, 'mafia': 80, 'gangster': 80, 'police': 80, 'detective': 80, 'heist': 80, 'robbery': 80, 'sherlock': 80,
  'documentary': 99, 'factual': 99, 'real': 99, 'true': 99,
  'drama': 18, 'emotional': 18, 'tear': 18, 'serious': 18, 'melodrama': 18, 'deep': 18, 'sad': 18,
  'family': 10751, 'kids': 10751, 'children': 10751, 'family-friendly': 10751,
  'fantasy': 14, 'magic': 14, 'wizard': 14, 'fairy': 14, 'myth': 14, 'spirits': 14,
  'history': 36, 'historical': 36, 'past': 36, 'political': 36, 'politics': 36, 'president': 36, 'government': 36, 'scandal': 36,
  'horror': 27, 'scary': 27, 'ghost': 27, 'creepy': 27, 'spooky': 27, 'fear': 27, 'terrifying': 27, 'clown': 27, 'slasher': 27,
  'music': 10402, 'musical': 10402, 'song': 10402, 'singing': 10402, 'jazz': 10402, 'drummer': 10402,
  'mystery': 9648, 'puzzle': 9648, 'clue': 9648, 'whodunit': 9648, 'investigate': 9648, 'uncover': 9648,
  'romance': 10749, 'romantic': 10749, 'love': 10749, 'dating': 10749, 'couple': 10749,
  'sci-fi': 878, 'scifi': 878, 'science fiction': 878, 'space': 878, 'alien': 878, 'future': 878, 'robot': 878, 'time': 878, 'technology': 878, 'wormhole': 878,
  'thriller': 53, 'suspense': 53, 'tense': 53, 'edge': 53, 'conspiracy': 53, 'paranoid': 53,
  'war': 10752, 'military': 10752, 'soldier': 10752, 'combat': 10752, 'wwii': 10752, 'concentration': 10752,
  'western': 37, 'cowboy': 37, 'saloon': 37,
}

function getMockResponse(text) {
  const clean = text.toLowerCase().trim()

  // 1. Basic conversational checking
  if (/^(hello|hi|hey|greetings|yo)\b/.test(clean)) {
    return {
      content: "👋 Hello! I'm MovieMind AI, your local offline movie assistant. Ask me to recommend movies by keywords (like 'space travel', 'political', 'scary', 'love', 'funny') and I will search our database to find matching films!",
      movies: []
    }
  }
  if (/^(who are you|what is this|help)\b/.test(clean)) {
    return {
      content: "🤖 I'm MovieMind AI! I run completely locally inside your browser, using a smart text matching and genre classification system to recommend films from our 28-movie database. You don't need any API key to chat with me! Try asking: 'recommend me a tense political thriller' or 'something with magic and animation'.",
      movies: []
    }
  }
  if (/^(thank you|thanks)\b/.test(clean)) {
    return {
      content: "🍿 You're very welcome! Let me know if you want another recommendation. Enjoy watching!",
      movies: []
    }
  }

  // 2. Tokenize and clean user query
  const tokens = clean
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(t => t && !STOPWORDS.has(t))

  if (tokens.length === 0) {
    return {
      content: "🎬 I'd love to help you find a movie! Could you tell me what genres, moods, or topics you are in the mood for? (e.g., 'scary horror', 'space travel', 'funny animation')",
      movies: []
    }
  }

  // 3. Compute scores for each movie in MOCK_MOVIES
  const scoredMovies = MOCK_MOVIES.map(movie => {
    let score = 0
    const titleWords = movie.title.toLowerCase().split(/\s+/)
    const overviewWords = movie.overview.toLowerCase().replace(/[^\w\s-]/g, ' ').split(/\s+/)
    const movieGenres = movie.genre_ids || []

    tokens.forEach(token => {
      // Direct title match (very high weight)
      if (titleWords.includes(token)) {
        score += 8.0
      } else if (movie.title.toLowerCase().includes(token)) {
        score += 3.0
      }

      // Genre name matching
      const targetGenreId = GENRE_KEYWORDS[token]
      if (targetGenreId !== undefined && movieGenres.includes(targetGenreId)) {
        score += 5.0
      }

      // Check if word matches genre name explicitly
      movieGenres.forEach(gid => {
        const gName = GN[gid] || ''
        if (gName.toLowerCase() === token) {
          score += 5.0
        }
      })

      // Overview matches
      if (overviewWords.includes(token)) {
        score += 2.0
      } else if (movie.overview.toLowerCase().includes(token)) {
        score += 0.8
      }
    })

    // Tie-breaker based on rating
    score += (movie.vote_average || 0) * 0.05

    return { movie, score }
  })

  // 4. Sort and filter
  const matches = scoredMovies
    .filter(item => item.score > 0.5)
    .sort((a, b) => b.score - a.score)

  // 5. Generate Response
  if (matches.length > 0) {
    const topMatches = matches.slice(0, 3)
    let reply = `🤖 **MovieMind AI (Local Mode)**\nBased on your interest in "${tokens.join(', ')}", here are the best matching movies from our catalog:\n\n`
    
    topMatches.forEach((item, index) => {
      const m = item.movie
      const year = m.release_date ? m.release_date.split('-')[0] : 'N/A'
      const genresStr = (m.genre_ids || []).map(id => GN[id]).filter(Boolean).join(' · ')
      reply += `${index + 1}. **${m.title}** (${year}) — ⭐ ${m.vote_average.toFixed(1)}\n`
      reply += `   *${genresStr}*\n`
      reply += `   "${m.overview}"\n\n`
    })

    reply += "What do you think of these? Let me know if you want to try a different genre or topic!"
    return { content: reply, movies: topMatches.map(item => item.movie) }
  }

  // 6. Fallback if no matching movies
  const randomPicks = [...MOCK_MOVIES].sort(() => 0.5 - Math.random()).slice(0, 3)
  let reply = `🤖 **MovieMind AI (Local Mode)**\nI couldn't find a direct match in our database for "${tokens.join(', ')}". \n\nHere are some of the highest-rated recommendations you might enjoy across different genres:\n\n`
  
  randomPicks.forEach((m, index) => {
    const year = m.release_date ? m.release_date.split('-')[0] : 'N/A'
    const genresStr = (m.genre_ids || []).map(id => GN[id]).filter(Boolean).join(' · ')
    reply += `${index + 1}. **${m.title}** (${year}) — ⭐ ${m.vote_average.toFixed(1)} (${genresStr})\n`
    reply += `   "${m.overview}"\n\n`
  })

  reply += "Let me know what genres or keywords you are in the mood for!"
  return { content: reply, movies: randomPicks }
}
function renderMessageContent(text) {
  if (!text) return ''
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g)
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} style={{ fontWeight: 700, color: 'white' }}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={idx} style={{ fontStyle: 'italic', color: 'rgba(255,255,255,.6)' }}>{part.slice(1, -1)}</em>
    }
    return part
  })
}

// ── Main component ────────────────────────────────────────────────────────
export default function ChatPage() {
  const { navigate } = useApp()
  const [msgs,  setMsgs]  = useState([{ role: 'assistant', content: "Hey! I'm MovieMind AI 🎬 Ask me anything — movie recommendations, directors, hidden gems, or what to watch tonight!", movies: [] }])
  const [inp,   setInp]   = useState('')
  const [busy,  setBusy]  = useState(false)
  const [usingMock, setUsingMock] = useState(!ANTHROPIC_KEY || ANTHROPIC_KEY === 'sk-ant-your_key_here')
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  const send = async () => {
    if (!inp.trim() || busy) return
    const txt = inp.trim()
    setInp('')
    setMsgs(m => [...m, { role: 'user', content: txt }])
    setBusy(true)

    // ── If no Anthropic key → use smart mock ─────────────────────────────
    if (!ANTHROPIC_KEY || ANTHROPIC_KEY === 'sk-ant-your_key_here') {
      await new Promise(r => setTimeout(r, 900)) // simulate thinking
      const result = getMockResponse(txt)
      setMsgs(m => [...m, { role: 'assistant', content: result.content, movies: result.movies }])
      setBusy(false)
      return
    }

    // ── Live Anthropic API call ───────────────────────────────────────────
    try {
      const history = msgs.slice(-10).map(m => ({ role: m.role, content: m.content }))
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-allow-browser': 'true', // ← required for browser
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [...history, { role: 'user', content: txt }],
        }),
      })

      if (!res.ok) {
        // API call failed → fall back to mock
        setUsingMock(true)
        const result = getMockResponse(txt)
        setMsgs(m => [...m, { role: 'assistant', content: result.content, movies: result.movies }])
      } else {
        const data = await res.json()
        const reply = data.content?.[0]?.text || ''
        // Detect mentioned movies from the text
        const mentionedMovies = MOCK_MOVIES.filter(m => 
          new RegExp(`\\b${m.title.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i').test(reply)
        )
        setMsgs(m => [...m, { role: 'assistant', content: reply, movies: mentionedMovies }])
      }
    } catch {
      const result = getMockResponse(txt)
      setMsgs(m => [...m, { role: 'assistant', content: result.content, movies: result.movies }])
    } finally {
      setBusy(false)
    }
  }

  const handleKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  const S = { fontFamily: "'DM Sans',sans-serif" }

  return (
    <div style={{ minHeight: '100vh', padding: '88px 24px 24px', display: 'flex', flexDirection: 'column', maxWidth: 780, margin: '0 auto' }}>
      {/* Header */}
      <div className="fu" style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 46, letterSpacing: 1, color: 'white', marginBottom: 3 }}>
          AI <span style={{ color: '#e50914' }}>Chatbot</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,.38)', fontSize: 13 }}>Your personal movie expert, powered by Claude AI</p>

        {/* Mock mode banner */}
        {usingMock && (
          <div style={{ marginTop: 12, padding: '8px 14px', background: 'rgba(14,165,233,.08)', border: '1px solid rgba(14,165,233,.22)', borderRadius: 9, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>🤖</span>
            <p style={{ ...S, fontSize: 12, color: 'rgba(255,255,255,.6)', lineHeight: 1.5 }}>
              Running in <strong>Smart Local AI Mode</strong> (no API key required). Try asking for specific genres, moods, or topics like "tense political thriller" or "space travel"!
            </p>
          </div>
        )}
      </div>

      {/* Chat window */}
      <div className="glass" style={{ flex: 1, minHeight: 380, borderRadius: 16, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 14 }}>
        {msgs.map((m, i) => (
          <div key={i} className="chat-msg" style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 10, alignItems: 'flex-end' }}>
            {m.role === 'assistant' && (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#e50914,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>🤖</div>
            )}
            <div style={{
              maxWidth: '78%', padding: '12px 15px',
              borderRadius: m.role === 'user' ? '17px 17px 4px 17px' : '17px 17px 17px 4px',
              background: m.role === 'user' ? '#e50914' : 'rgba(255,255,255,.05)',
              border: m.role === 'user' ? 'none' : '1px solid rgba(255,255,255,.07)',
              color: 'white', fontSize: 13, lineHeight: 1.7,
              ...S, whiteSpace: 'pre-wrap',
            }}>
              <div>{renderMessageContent(m.content)}</div>

              {/* Render movie posters if present */}
              {m.movies && m.movies.length > 0 && (
                <div style={{ 
                  display: 'flex', 
                  gap: 12, 
                  overflowX: 'auto', 
                  paddingTop: 14, 
                  paddingBottom: 4,
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(255,255,255,.2) transparent'
                }}>
                  {m.movies.map(movie => (
                    <div 
                      key={movie.id} 
                      className="mc" 
                      onClick={() => navigate('movie', movie.id)}
                      style={{ 
                        width: 110, 
                        flexShrink: 0, 
                        position: 'relative', 
                        cursor: 'pointer',
                        borderRadius: 8,
                        overflow: 'hidden',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.transform = 'scale(1.05)'
                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.5)'
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.transform = 'scale(1)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <div style={{ width: 110, height: 165, background: '#13131f', overflow: 'hidden', border: '1px solid rgba(255,255,255,.08)' }}>
                        <img 
                          src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`} 
                          alt={movie.title} 
                          loading="lazy" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => e.target.src = `https://placehold.co/110x165/13131f/444?text=${encodeURIComponent(movie.title)}`} 
                        />
                      </div>
                      {movie.vote_average > 0 && (
                        <div style={{ 
                          position: 'absolute', 
                          top: 5, 
                          right: 5, 
                          background: 'rgba(0,0,0,.8)', 
                          backdropFilter: 'blur(4px)', 
                          borderRadius: 4, 
                          padding: '1px 5px', 
                          fontSize: 9, 
                          fontWeight: 700, 
                          color: '#d4a843', 
                          border: '1px solid rgba(212,168,67,.25)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2
                        }}>
                          ⭐{movie.vote_average?.toFixed(1)}
                        </div>
                      )}
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
                        padding: '12px 6px 4px 6px',
                      }}>
                        <p style={{
                          color: 'white',
                          fontSize: 9,
                          fontWeight: 700,
                          margin: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          textAlign: 'center',
                        }}>
                          {movie.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {busy && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#e50914,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
            <div style={{ padding: '13px 16px', background: 'rgba(255,255,255,.05)', borderRadius: '17px 17px 17px 4px', border: '1px solid rgba(255,255,255,.07)' }}>
              <DotLoader />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 11 }}>
        <input
          className="cin-inp" value={inp}
          onChange={e => setInp(e.target.value)} onKeyDown={handleKey}
          placeholder="Ask about movies…"
          style={{ flex: 1, padding: '14px 17px', borderRadius: 12, fontSize: 14, ...S }}
        />
        <button className="btn-r" onClick={send} disabled={busy || !inp.trim()}
          style={{ border: 'none', padding: '14px 22px', borderRadius: 12, fontSize: 20, opacity: busy || !inp.trim() ? .44 : 1, transition: 'opacity .2s' }}>→</button>
      </div>

      {/* Suggestions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {SUGGESTIONS.map(s => (
          <button key={s} onClick={() => setInp(s)}
            style={{ padding: '5px 12px', borderRadius: 20, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', cursor: 'pointer', color: 'rgba(255,255,255,.52)', ...S, fontSize: 11, transition: 'all .2s' }}
            onMouseOver={e => { e.target.style.color = 'white'; e.target.style.borderColor = 'rgba(229,9,20,.38)' }}
            onMouseOut={e =>  { e.target.style.color = 'rgba(255,255,255,.52)'; e.target.style.borderColor = 'rgba(255,255,255,.07)' }}>
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
