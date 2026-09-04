import { useEffect, useState } from 'react'

// Language code → display name map
const LANG_NAMES = {
  en: '🇬🇧 English',
  hi: '🇮🇳 Hindi',
  fr: '🇫🇷 French',
  de: '🇩🇪 German',
  es: '🇪🇸 Spanish',
  pt: '🇧🇷 Portuguese',
  ja: '🇯🇵 Japanese',
  ko: '🇰🇷 Korean',
  zh: '🇨🇳 Chinese',
  ar: '🇸🇦 Arabic',
  ru: '🇷🇺 Russian',
  it: '🇮🇹 Italian',
  ta: '🇮🇳 Tamil',
  te: '🇮🇳 Telugu',
}

const getLangName = (iso) => LANG_NAMES[iso] || (iso ? iso.toUpperCase() : 'Unknown')

// trailers: array of { key, name, iso_639_1, type }
// videoKey: fallback single key (legacy)
export default function TrailerModal({ videoKey, trailers = [], onClose }) {
  // Group trailers by language, keep first of each type per language
  const byLang = {}
  trailers.forEach(v => {
    const lang = v.iso_639_1 || 'en'
    if (!byLang[lang]) byLang[lang] = []
    byLang[lang].push(v)
  })

  const langKeys = Object.keys(byLang)

  // Default: first language that has trailers (prefer 'hi' if available, then 'en', then first)
  const defaultLang = langKeys.includes('hi') ? 'hi'
    : langKeys.includes('en') ? 'en'
    : langKeys[0] || null

  const [activeLang, setActiveLang]   = useState(defaultLang)
  const [activeVideo, setActiveVideo] = useState(null)

  // When activeLang changes, pick the best video for that lang
  useEffect(() => {
    if (!activeLang || !byLang[activeLang]) return
    const langVideos = byLang[activeLang]
    // Prefer official trailer, then teaser, then any
    const best = langVideos.find(v => v.type === 'Trailer')
      || langVideos.find(v => v.type === 'Teaser')
      || langVideos[0]
    setActiveVideo(best || null)
  }, [activeLang]) // eslint-disable-line

  // Close on Escape
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  // The YouTube key to embed
  const currentKey = activeVideo?.key || videoKey

  const hasMultipleLangs = langKeys.length > 1
  // Videos for the active language (for clip selector within same language)
  const activeLangVideos = activeLang && byLang[activeLang] ? byLang[activeLang] : []

  return (
    <div className="mod-bg" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(920px,95vw)',
          background: '#0e0e1c',
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,.08)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 20, letterSpacing: 1, color: 'white' }}>
              {activeVideo?.name || 'Official Trailer'}
            </span>
            {activeVideo?.type && activeVideo.type !== 'Trailer' && (
              <span style={{ fontSize: 10, background: 'rgba(212,168,67,.15)', color: '#d4a843', border: '1px solid rgba(212,168,67,.3)', borderRadius: 5, padding: '2px 7px', fontFamily: "'DM Sans',sans-serif", fontWeight: 700, letterSpacing: '.4px' }}>
                {activeVideo.type.toUpperCase()}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,.07)', border: 'none', cursor: 'pointer', color: 'white', width: 30, height: 30, borderRadius: 7, fontSize: 15 }}
          >
            ✕
          </button>
        </div>

        {/* Language selector — only shown if multiple languages exist */}
        {hasMultipleLangs && (
          <div style={{ display: 'flex', gap: 6, padding: '10px 16px 0', flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,.04)', paddingBottom: 10 }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,.38)', fontFamily: "'DM Sans',sans-serif", fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', marginRight: 4 }}>
              Audio / Language:
            </span>
            {langKeys.map(lang => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 20,
                  border: activeLang === lang ? '1px solid rgba(229,9,20,.6)' : '1px solid rgba(255,255,255,.1)',
                  background: activeLang === lang ? 'rgba(229,9,20,.15)' : 'rgba(255,255,255,.04)',
                  color: activeLang === lang ? '#ff4444' : 'rgba(255,255,255,.65)',
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 12,
                  fontWeight: activeLang === lang ? 700 : 400,
                  cursor: 'pointer',
                  transition: 'all .18s ease',
                }}
              >
                {getLangName(lang)}
                <span style={{ marginLeft: 5, fontSize: 9, opacity: .6 }}>({byLang[lang].length})</span>
              </button>
            ))}
          </div>
        )}

        {/* Clip selector — if a language has multiple clips (Trailer + Teaser etc.) */}
        {activeLangVideos.length > 1 && (
          <div style={{ display: 'flex', gap: 6, padding: '8px 16px', flexWrap: 'wrap', alignItems: 'center', background: 'rgba(255,255,255,.015)' }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,.28)', fontFamily: "'DM Sans',sans-serif", fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', marginRight: 4 }}>
              Clip:
            </span>
            {activeLangVideos.map((v, i) => (
              <button
                key={v.key}
                onClick={() => setActiveVideo(v)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 14,
                  border: activeVideo?.key === v.key ? '1px solid rgba(212,168,67,.5)' : '1px solid rgba(255,255,255,.07)',
                  background: activeVideo?.key === v.key ? 'rgba(212,168,67,.1)' : 'transparent',
                  color: activeVideo?.key === v.key ? '#d4a843' : 'rgba(255,255,255,.5)',
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 11,
                  cursor: 'pointer',
                  transition: 'all .15s',
                  maxWidth: 200,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={v.name}
              >
                {v.type === 'Trailer' ? '▶' : v.type === 'Teaser' ? '◈' : '◉'} {v.name || `Clip ${i + 1}`}
              </button>
            ))}
          </div>
        )}

        {/* Video iframe */}
        <div style={{ aspectRatio: '16/9' }}>
          {currentKey
            ? (
              <iframe
                key={currentKey} // force remount on key change so new video autoplays
                src={`https://www.youtube.com/embed/${currentKey}?autoplay=1&rel=0&modestbranding=1`}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              />
            )
            : (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a14', gap: 12 }}>
                <span style={{ fontSize: 48 }}>🎬</span>
                <p style={{ color: 'rgba(255,255,255,.4)', fontFamily: "'DM Sans',sans-serif", fontSize: 14 }}>No trailer available in Demo Mode</p>
              </div>
            )
          }
        </div>

        {/* Footer note if only one language */}
        {!hasMultipleLangs && langKeys.length === 1 && (
          <div style={{ padding: '9px 16px', background: 'rgba(255,255,255,.02)', borderTop: '1px solid rgba(255,255,255,.04)' }}>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,.28)', fontFamily: "'DM Sans',sans-serif" }}>
              Only {getLangName(langKeys[0])} trailer available for this title · TMDB data
            </p>
          </div>
        )}
        {!langKeys.length && !videoKey && (
          <div style={{ padding: '9px 16px', background: 'rgba(255,255,255,.02)', borderTop: '1px solid rgba(255,255,255,.04)' }}>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,.28)', fontFamily: "'DM Sans',sans-serif" }}>
              No trailers found · Connect TMDB API for live trailer data
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
