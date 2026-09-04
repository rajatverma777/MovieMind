import { useEffect, useState } from 'react'

const LANG_NAMES = {
  en: '🇬🇧 English',
  hi: '🇮🇳 Hindi',
  ta: '🇮🇳 Tamil',
  te: '🇮🇳 Telugu',
  ml: '🇮🇳 Malayalam',
  kn: '🇮🇳 Kannada',
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
}
const getLangName = iso => LANG_NAMES[iso] || iso?.toUpperCase() || 'Unknown'

// Pick the single best video for a language: Official Trailer > any Trailer > Teaser
function getBestForLang(videos) {
  return (
    videos.find(v => v.type === 'Trailer' && v.name?.toLowerCase().includes('official')) ||
    videos.find(v => v.type === 'Trailer') ||
    videos.find(v => v.type === 'Teaser') ||
    videos[0]
  )
}

export default function TrailerModal({ videoKey, trailers = [], onClose }) {
  // Build lang → best video map (only Trailers + Teasers, deduplicated per language)
  const langMap = {}
  trailers
    .filter(v => v.type === 'Trailer' || v.type === 'Teaser')
    .forEach(v => {
      const lang = v.iso_639_1 || 'en'
      if (!langMap[lang]) langMap[lang] = []
      langMap[lang].push(v)
    })

  const langs = Object.keys(langMap)

  // Default language: prefer 'hi', then 'en', then first
  const defaultLang = langs.includes('hi') ? 'hi'
    : langs.includes('en') ? 'en'
    : langs[0] || null

  const [activeLang, setActiveLang] = useState(defaultLang)
  const [currentKey, setCurrentKey] = useState(videoKey)

  useEffect(() => {
    if (!activeLang || !langMap[activeLang]) return
    const best = getBestForLang(langMap[activeLang])
    setCurrentKey(best?.key || videoKey)
  }, [activeLang]) // eslint-disable-line

  // Escape key
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const hasMultipleLangs = langs.length > 1

  return (
    <div className="mod-bg" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(900px,95vw)',
          background: '#0e0e1c',
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,.08)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <span style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 20, letterSpacing: 1, color: 'white' }}>
            Official Trailer
          </span>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,.07)', border: 'none', cursor: 'pointer', color: 'white', width: 30, height: 30, borderRadius: 7, fontSize: 15 }}
          >
            ✕
          </button>
        </div>

        {/* Language selector — only when 2+ languages available */}
        {hasMultipleLangs && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            borderBottom: '1px solid rgba(255,255,255,.05)',
            background: 'rgba(255,255,255,.015)',
            flexWrap: 'wrap',
          }}>
            <span style={{
              fontSize: 10,
              color: 'rgba(255,255,255,.35)',
              fontFamily: "'DM Sans',sans-serif",
              fontWeight: 700,
              letterSpacing: '.7px',
              textTransform: 'uppercase',
              flexShrink: 0,
            }}>
              🎙 Audio:
            </span>
            {langs.map(lang => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 22,
                  border: activeLang === lang
                    ? '1px solid rgba(229,9,20,.6)'
                    : '1px solid rgba(255,255,255,.1)',
                  background: activeLang === lang
                    ? 'rgba(229,9,20,.15)'
                    : 'rgba(255,255,255,.04)',
                  color: activeLang === lang ? '#ff6060' : 'rgba(255,255,255,.65)',
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 12,
                  fontWeight: activeLang === lang ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all .18s ease',
                  letterSpacing: '.2px',
                }}
              >
                {getLangName(lang)}
              </button>
            ))}
          </div>
        )}


        {/* Video */}
        <div style={{ aspectRatio: '16/9' }}>
          {currentKey ? (
            <iframe
              key={currentKey}
              src={`https://www.youtube.com/embed/${currentKey}?autoplay=1&rel=0&modestbranding=1`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a14', gap: 12 }}>
              <span style={{ fontSize: 48 }}>🎬</span>
              <p style={{ color: 'rgba(255,255,255,.4)', fontFamily: "'DM Sans',sans-serif", fontSize: 14 }}>No trailer available in Demo Mode</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
