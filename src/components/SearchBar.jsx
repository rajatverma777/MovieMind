// src/components/SearchBar.jsx
// Apple visionOS / iOS 18 Liquid Glass Search Engine
// Matches Apple Developer Documentation:
// - Frosted dark glass capsule pill with specular edge refraction
// - Blue Apple text caret (#0a84ff)
// - Voice / Speech Dictation microphone action on the right
// - Live floating Liquid Glass Autocomplete popover (prefix bold white, suffix muted gray)
// - Keyboard navigation (Arrows, Enter, Escape) and click outside dismissal

import { useState, useEffect, useRef, useMemo } from 'react'
import { MOCK_MOVIES, GN } from '@/data/constants'

// Comprehensive dictionary for instant cinema autocomplete
const POPULAR_DIRECTORS = [
  'Christopher Nolan',
  'Quentin Tarantino',
  'Denis Villeneuve',
  'Martin Scorsese',
  'David Fincher',
  'Steven Spielberg',
  'Stanley Kubrick',
  'James Cameron',
  'Ridley Scott',
  'Greta Gerwig',
  'Wes Anderson',
  'Guillermo del Toro',
  'Hayao Miyazaki'
]

const POPULAR_ACTORS = [
  'Leonardo DiCaprio',
  'Christian Bale',
  'Cillian Murphy',
  'Matthew McConaughey',
  'Brad Pitt',
  'Keanu Reeves',
  'Ryan Gosling',
  'Robert De Niro',
  'Al Pacino',
  'Margot Robbie',
  'Scarlett Johansson',
  'Timothée Chalamet'
]

const POPULAR_THEMES = [
  'time travel wormhole',
  'dreams inside dreams',
  'artificial intelligence dystopian',
  'psychological mystery thriller',
  'neo-noir detective',
  'cyberpunk virtual reality',
  'space exploration interstellar',
  'post-apocalyptic survival'
]

export default function SearchBar({
  value = '',
  onChange,
  onSearch,
  placeholder = 'Movies, actors, directors, genres...',
  autoFocus = false,
  style = {},
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isListening, setIsListening] = useState(false)
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  // Voice Search / Dictation using Web Speech API (Apple Dictation style)
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Safari.')
      return
    }

    if (isListening) return

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = 'en-US'
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)
      recognition.onerror = () => setIsListening(false)

      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript || ''
        if (transcript) {
          onChange?.(transcript)
          onSearch?.(transcript)
          setIsOpen(false)
        }
      }

      recognition.start()
    } catch (err) {
      console.warn('Voice search error:', err)
      setIsListening(false)
    }
  }

  // Derive smart autocomplete suggestions from dictionary based on current input
  const suggestions = useMemo(() => {
    const q = (value || '').trim().toLowerCase()
    if (!q || q.length < 1) return []

    const results = []
    const seen = new Set()

    // 1. Movie Titles
    for (const m of MOCK_MOVIES) {
      const titleLower = m.title.toLowerCase()
      if (titleLower.includes(q)) {
        if (!seen.has(titleLower)) {
          seen.add(titleLower)
          results.push({
            type: 'movie',
            category: 'Movie',
            text: m.title,
            matchIndex: titleLower.indexOf(q),
            matchLength: q.length
          })
        }
      }
    }

    // 2. Directors
    for (const d of POPULAR_DIRECTORS) {
      const lower = d.toLowerCase()
      if (lower.includes(q) && !seen.has(lower)) {
        seen.add(lower)
        results.push({
          type: 'director',
          category: 'Director',
          text: d,
          matchIndex: lower.indexOf(q),
          matchLength: q.length
        })
      }
    }

    // 3. Actors
    for (const a of POPULAR_ACTORS) {
      const lower = a.toLowerCase()
      if (lower.includes(q) && !seen.has(lower)) {
        seen.add(lower)
        results.push({
          type: 'actor',
          category: 'Actor',
          text: a,
          matchIndex: lower.indexOf(q),
          matchLength: q.length
        })
      }
    }

    // 4. Genres
    for (const g of Object.values(GN)) {
      const lower = g.toLowerCase()
      if (lower.includes(q) && !seen.has(lower)) {
        seen.add(lower)
        results.push({
          type: 'genre',
          category: 'Genre',
          text: g,
          matchIndex: lower.indexOf(q),
          matchLength: q.length
        })
      }
    }

    // 5. Thematic queries
    for (const t of POPULAR_THEMES) {
      const lower = t.toLowerCase()
      if (lower.includes(q) && !seen.has(lower)) {
        seen.add(lower)
        results.push({
          type: 'theme',
          category: 'Theme',
          text: t,
          matchIndex: lower.indexOf(q),
          matchLength: q.length
        })
      }
    }

    // Sort: items starting with query first, then alphabetical
    results.sort((a, b) => {
      if (a.matchIndex === 0 && b.matchIndex !== 0) return -1
      if (b.matchIndex === 0 && a.matchIndex !== 0) return 1
      return a.text.localeCompare(b.text)
    })

    return results.slice(0, 6)
  }, [value])

  // Click outside to dismiss autocomplete dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectSuggestion = (item) => {
    onChange?.(item.text)
    onSearch?.(item.text)
    setIsOpen(false)
    setActiveIndex(-1)
  }

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter') {
        onSearch?.(value)
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => (prev + 1 < suggestions.length ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => (prev - 1 >= 0 ? prev - 1 : suggestions.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        handleSelectSuggestion(suggestions[activeIndex])
      } else {
        onSearch?.(value)
        setIsOpen(false)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%', ...style }}
      className={`apple-search-engine-wrap ${className}`}
    >
      {/* ── Main Liquid Glass Capsule Pill ──────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          height: 50,
          borderRadius: 9999,
          background: 'rgba(255, 255, 255, 0.08)',
          backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.02) 100%)',
          backdropFilter: 'blur(28px) saturate(190%)',
          WebkitBackdropFilter: 'blur(28px) saturate(190%)',
          border: '1.2px solid rgba(255, 255, 255, 0.16)',
          padding: '0 16px',
          gap: 12,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35), inset 0 1px 1.5px rgba(255, 255, 255, 0.22)',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease'
        }}
        onFocus={() => setIsOpen(suggestions.length > 0)}
      >
        {/* Left Magnifier Icon */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255, 255, 255, 0.65)', flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </div>

        {/* Input with Apple Blue Caret */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          autoFocus={autoFocus}
          placeholder={placeholder}
          onChange={e => {
            onChange?.(e.target.value)
            setIsOpen(true)
            setActiveIndex(-1)
          }}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true)
          }}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#ffffff',
            caretColor: '#0a84ff',
            fontSize: 14.5,
            fontWeight: 500,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'DM Sans', sans-serif"
          }}
        />

        {/* Clear Button (when text is present) */}
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange?.('')
              setIsOpen(false)
              inputRef.current?.focus()
            }}
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.16)',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 10.5,
              fontWeight: 800,
              padding: 0,
              transition: 'all 0.18s ease'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.28)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)'}
            title="Clear search"
          >
            ✕
          </button>
        )}

        {/* Apple Dictation / Voice Search Microphone Icon */}
        <button
          type="button"
          onClick={handleVoiceSearch}
          title={isListening ? 'Listening...' : 'Voice Search'}
          style={{
            background: isListening ? 'rgba(10, 132, 255, 0.25)' : 'transparent',
            border: isListening ? '1px solid #0a84ff' : 'none',
            borderRadius: 12,
            padding: '5px 7px',
            color: isListening ? '#38bdf8' : 'rgba(255, 255, 255, 0.55)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            boxShadow: isListening ? '0 0 12px rgba(10, 132, 255, 0.5)' : 'none'
          }}
          onMouseOver={e => {
            if (!isListening) e.currentTarget.style.color = '#ffffff'
          }}
          onMouseOut={e => {
            if (!isListening) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.55)'
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </svg>
        </button>
      </div>

      {/* ── Floating Liquid Glass Autocomplete Popover (Apple HIG Dark Mode) ── */}
      {isOpen && suggestions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            zIndex: 1000,
            background: 'rgba(20, 22, 30, 0.98)',
            backdropFilter: 'blur(50px) saturate(200%)',
            WebkitBackdropFilter: 'blur(50px) saturate(200%)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: 20,
            padding: '8px 6px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.08)',
            animation: 'appleMenuPop 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          {suggestions.map((item, idx) => {
            const isHighlighted = activeIndex === idx
            const text = item.text
            const queryLength = item.matchLength || 0
            const matchStart = item.matchIndex >= 0 ? item.matchIndex : 0

            // Split into prefix (bold white) and suffix (muted gray), as in Apple HIG screenshot
            const before = text.slice(0, matchStart)
            const matched = text.slice(matchStart, matchStart + queryLength)
            const after = text.slice(matchStart + queryLength)

            return (
              <div
                key={`${item.type}_${item.text}_${idx}`}
                onClick={() => handleSelectSuggestion(item)}
                onMouseEnter={() => setActiveIndex(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 14px',
                  borderRadius: 14,
                  cursor: 'pointer',
                  background: isHighlighted ? 'rgba(255, 255, 255, 0.10)' : 'transparent',
                  border: isHighlighted ? '1px solid rgba(255, 255, 255, 0.14)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                  userSelect: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                  <span style={{ fontSize: 13, opacity: 0.55, flexShrink: 0 }}>🔍</span>
                  <div
                    style={{
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', sans-serif",
                      fontSize: 13.5,
                      lineHeight: 1.3,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {before && <span style={{ color: 'rgba(255, 255, 255, 0.45)', fontWeight: 400 }}>{before}</span>}
                    {/* Matched query is BOLD WHITE like "Design" in Apple HIG screenshot */}
                    <strong style={{ color: '#ffffff', fontWeight: 700 }}>{matched}</strong>
                    {/* Suffix is MUTED GRAY like "systems", "language" in Apple HIG screenshot */}
                    <span style={{ color: 'rgba(255, 255, 255, 0.45)', fontWeight: 400 }}>{after}</span>
                  </div>
                </div>

                {/* Subtle Category Pill Badge */}
                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    letterSpacing: 0.3,
                    padding: '2px 8px',
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: item.type === 'movie' ? '#38bdf8' : item.type === 'director' ? '#a78bfa' : item.type === 'genre' ? '#f59e0b' : 'rgba(255, 255, 255, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    flexShrink: 0
                  }}
                >
                  {item.category}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
