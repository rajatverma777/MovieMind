import { useState, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { MOCK_MOVIES, GN, imgUrl } from '@/data/constants'
import StarRating  from '@/components/StarRating'
import GenreChip   from '@/components/GenreChip'
import MovieCard   from '@/components/MovieCard'
import TrailerModal from '@/components/TrailerModal'
import Spinner     from '@/components/Spinner'

export default function MovieDetailPage({ movieId }) {
  const { tmdb, watchlist, toggleWatchlist, navigate, addToRecent, isDemo } = useApp()
  const [movie,      setMovie]      = useState(null)
  const [busy,       setBusy]       = useState(true)
  const [tk,         setTk]         = useState(null)
  const [showT,      setShowT]      = useState(false)
  const [tab,        setTab]        = useState('overview')
  const [providers,  setProviders]  = useState(null)
  const [actorModal, setActorModal] = useState(null)  // full person object
  const [actorBusy,  setActorBusy]  = useState(false)

  const openActor = async (person) => {
    setActorModal({ ...person, _loading: true })
    setActorBusy(true)
    try {
      if (tmdb && !isDemo) {
        const data = await tmdb.person(person.id)
        setActorModal(data)
      } else {
        setActorModal({ ...person, biography: '', _loading: false })
      }
    } catch { setActorModal({ ...person, biography: '', _loading: false }) }
    finally { setActorBusy(false) }
  }

  useEffect(() => {
    setBusy(true); setTab('overview'); setTk(null); setProviders(null)
    ;(async () => {
      try {
        if (isDemo) {
          const f = MOCK_MOVIES.find(m => m.id === movieId) || MOCK_MOVIES[0]
          setMovie({ ...f, genres: (f.genre_ids || []).map(id => ({ id, name: GN[id] || '?' })), credits: { cast: [], crew: [] }, videos: { results: [] }, similar: { results: MOCK_MOVIES.filter(m => m.id !== f.id).slice(0, 8) } })
          // Demo: JustWatch search link as fallback
          setProviders({ link: `https://www.justwatch.com/in/search?q=${encodeURIComponent(f.title)}`, flatrate: [], rent: [], buy: [] })
        } else if (tmdb) {
          const [d, wp] = await Promise.all([
            tmdb.detail(movieId),
            tmdb.watchProviders(movieId).catch(() => null),
          ])
          setMovie(d)
          const t = d.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube')
          if (t) setTk(t.key)
          addToRecent(d)
          // Try IN (India) first, then US as fallback; always set so section always renders
          const wpResult = wp?.results
          const region   = wpResult?.IN || wpResult?.US || {}
          // Ensure JustWatch link is always available even when no provider data exists
          if (!region.link) {
            region.link = `https://www.justwatch.com/in/search?q=${encodeURIComponent(d?.title || '')}`
          }
          setProviders(region)
        }
      } catch {
        const f = MOCK_MOVIES.find(m => m.id === movieId) || MOCK_MOVIES[0]
        setMovie({ ...f, genres: (f.genre_ids || []).map(id => ({ id, name: GN[id] || '?' })), credits: { cast: [], crew: [] }, videos: { results: [] }, similar: { results: MOCK_MOVIES.filter(m => m.id !== f.id).slice(0, 6) } })
        setProviders({ link: `https://www.justwatch.com/in/search?q=${encodeURIComponent(f.title)}`, flatrate: [], rent: [], buy: [] })
      } finally { setBusy(false) }
    })()
  }, [movieId, tmdb, isDemo])

  if (busy)  return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner size={52} /></div>
  if (!movie) return <div style={{ padding: 80, textAlign: 'center', color: 'rgba(255,255,255,.38)' }}>Movie not found</div>

  // ── Derived data ────────────────────────────────────────────────────────
  const inWL      = watchlist.some(m => m.id === movie.id)
  const cast      = movie.credits?.cast?.slice(0, 14) || []
  const similar   = movie.similar?.results?.slice(0, 8) || []
  const dirs      = movie.credits?.crew?.filter(c => c.job === 'Director') || []
  const bgSrc     = imgUrl(movie.backdrop_path, 'original') || `https://placehold.co/1280x720/0d0d18/1a1a2e?text=${encodeURIComponent(movie.title)}`
  const pSrc      = imgUrl(movie.poster_path,   'w342')     || `https://placehold.co/205x308/13131f/444?text=${encodeURIComponent(movie.title)}`
  const genres    = movie.genres || (movie.genre_ids || []).map(id => ({ id, name: GN[id] || '?' }))
  const keywords  = movie.keywords?.keywords?.slice(0, 12) || []
  const companies = movie.production_companies?.filter(c => c.logo_path)?.slice(0, 5) || []
  const langs     = movie.spoken_languages?.map(l => l.english_name || l.name).filter(Boolean) || []
  const countries = movie.production_countries?.map(c => c.name).filter(Boolean) || []
  const collection = movie.belongs_to_collection || null

  // Content rating — try IN then US
  const certRaw = (() => {
    const rd = movie.release_dates?.results || []
    const find = iso => rd.find(r => r.iso_3166_1 === iso)?.release_dates?.find(d => d.certification)?.certification
    return find('IN') || find('US') || null
  })()

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Backdrop */}
      <div style={{ position: 'relative', height: '68vh', overflow: 'hidden' }}>
        <img src={bgSrc} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => e.target.src = `https://placehold.co/1280x720/0d0d18/1a1a2e?text=${encodeURIComponent(movie.title)}`} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(6,6,15,1) 0%,rgba(6,6,15,.52) 40%,rgba(6,6,15,.08) 100%)' }} />

        {/* Back button */}
        <button onClick={() => navigate('landing')} style={{ position: 'absolute', top: 74, left: 22, background: 'rgba(0,0,0,.52)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.09)', borderRadius: 9, padding: '8px 16px', cursor: 'pointer', color: 'white', fontFamily: "'DM Sans',sans-serif", fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
          ← Back
        </button>

        {/* Play button */}
        {tk && (
          <button onClick={() => setShowT(true)} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 64, height: 64, borderRadius: '50%', background: 'rgba(229,9,20,.9)', border: '3px solid rgba(255,255,255,.18)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 38px rgba(229,9,20,.58)', transition: 'all .2s' }}
            onMouseOver={e => e.currentTarget.style.transform = 'translate(-50%,-50%) scale(1.12)'}
            onMouseOut={e =>  e.currentTarget.style.transform = 'translate(-50%,-50%) scale(1)'}>
            <span style={{ fontSize: 24, marginLeft: 4 }}>▶</span>
          </button>
        )}
      </div>

      {/* Detail content */}
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px 56px', marginTop: -96, position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', gap: 30, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Poster */}
          <img src={pSrc} alt={movie.title} style={{ width: 205, borderRadius: 14, boxShadow: '0 18px 56px rgba(0,0,0,.9),0 0 0 1px rgba(255,255,255,.04)', flexShrink: 0 }}
            onError={e => e.target.src = `https://placehold.co/205x308/13131f/444?text=${encodeURIComponent(movie.title)}`} />

          {/* Info */}
          <div style={{ flex: 1, minWidth: 250 }}>
            <h1 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 'clamp(2.3rem,5vw,3.8rem)', color: 'white', lineHeight: .96, marginBottom: 9 }}>{movie.title}</h1>
            {movie.tagline && <p style={{ color: '#d4a843', fontStyle: 'italic', marginBottom: 13, fontSize: 14 }}>"{movie.tagline}"</p>}

            {/* Meta */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginBottom: 16, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(212,168,67,.1)', border: '1px solid rgba(212,168,67,.26)', borderRadius: 7, padding: '5px 11px' }}>
                <span style={{ color: '#d4a843', fontSize: 14 }}>⭐</span>
                <span style={{ color: '#d4a843', fontWeight: 700, fontSize: 16 }}>{movie.vote_average?.toFixed(1)}</span>
                <span style={{ color: 'rgba(255,255,255,.3)', fontSize: 10 }}>/10</span>
              </div>
              <span style={{ color: 'rgba(255,255,255,.52)', fontSize: 12, background: 'rgba(255,255,255,.05)', padding: '5px 11px', borderRadius: 7, border: '1px solid rgba(255,255,255,.07)' }}>📅 {movie.release_date?.split('-')[0]}</span>
              {movie.runtime && <span style={{ color: 'rgba(255,255,255,.52)', fontSize: 12, background: 'rgba(255,255,255,.05)', padding: '5px 11px', borderRadius: 7, border: '1px solid rgba(255,255,255,.07)' }}>⏱ {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>}
              {certRaw && (
                <span style={{ color: '#10b981', fontSize: 11, fontWeight: 700, background: 'rgba(16,185,129,.1)', padding: '5px 10px', borderRadius: 7, border: '1px solid rgba(16,185,129,.28)', letterSpacing: '.3px', fontFamily: "'DM Sans',sans-serif" }}>
                  {certRaw}
                </span>
              )}
              {langs.length > 0 && (
                <span title={langs.join(', ')} style={{ color: 'rgba(255,255,255,.45)', fontSize: 11, background: 'rgba(255,255,255,.04)', padding: '5px 10px', borderRadius: 7, border: '1px solid rgba(255,255,255,.07)', fontFamily: "'DM Sans',sans-serif", maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  🗣️ {langs.slice(0, 2).join(', ')}{langs.length > 2 ? ` +${langs.length - 2}` : ''}
                </span>
              )}
              {countries.length > 0 && (
                <span title={countries.join(', ')} style={{ color: 'rgba(255,255,255,.45)', fontSize: 11, background: 'rgba(255,255,255,.04)', padding: '5px 10px', borderRadius: 7, border: '1px solid rgba(255,255,255,.07)', fontFamily: "'DM Sans',sans-serif" }}>
                  🌍 {countries[0]}{countries.length > 1 ? ` +${countries.length - 1}` : ''}
                </span>
              )}
            </div>

            {/* Genres */}
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: keywords.length > 0 ? 10 : 18 }}>
              {genres.map(g => <GenreChip key={g.id} id={g.id} />)}
            </div>

            {/* Keywords / Tags */}
            {keywords.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
                {keywords.map(k => (
                  <span key={k.id} style={{ fontSize: 10, color: 'rgba(255,255,255,.42)', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 20, padding: '3px 10px', fontFamily: "'DM Sans',sans-serif", cursor: 'default' }}>
                    {k.name}
                  </span>
                ))}
              </div>
            )}

            {/* Collection / Franchise badge */}
            {collection && (
              <div style={{ marginBottom: 18, padding: '11px 14px', background: 'rgba(139,92,246,.07)', border: '1px solid rgba(139,92,246,.22)', borderRadius: 11, display: 'flex', alignItems: 'center', gap: 12 }}>
                {collection.poster_path && (
                  <img src={imgUrl(collection.poster_path, 'w92')} alt={collection.name}
                    style={{ width: 36, height: 54, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                )}
                <div>
                  <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.7px', textTransform: 'uppercase', color: '#8b5cf6', fontFamily: "'DM Sans',sans-serif", marginBottom: 2 }}>Part of a Collection</p>
                  <p style={{ fontSize: 13, color: 'white', fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>{collection.name}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginBottom: 18 }}>
              <button className="btn-r" onClick={() => setShowT(true)} style={{ border: 'none', padding: '12px 24px', borderRadius: 10, fontSize: 13, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                ▶ {tk ? 'Watch Trailer' : 'Play'}
              </button>
              <button onClick={() => toggleWatchlist(movie)} style={{ border: inWL ? '1px solid #e50914' : '1px solid rgba(255,255,255,.13)', cursor: 'pointer', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, background: inWL ? 'rgba(229,9,20,.1)' : 'rgba(255,255,255,.06)', color: inWL ? '#e50914' : 'white', transition: 'all .2s' }}>
                {inWL ? '✓ In Watchlist' : '+ Watchlist'}
              </button>
            </div>

            {/* ── WHERE TO WATCH ──────────────────────────────────────── */}
            {providers && (() => {
              const flatrate = providers.flatrate || []
              const rent     = providers.rent     || []
              const buy      = providers.buy      || []
              const hasAny   = flatrate.length > 0 || rent.length > 0 || buy.length > 0

              // OTT timeline helpers (for "not yet on OTT" state)
              const relDate   = movie?.release_date ? new Date(movie.release_date) : null
              const today     = new Date()
              const isFuture  = relDate && relDate > today
              const daysOld   = relDate ? Math.floor((today - relDate) / 86400000) : null
              // Standard theatrical-to-OTT window: ~90 days (Hollywood) / 56 days (some India releases)
              const estOttDate = relDate ? new Date(relDate.getTime() + 90 * 86400000) : null
              const estPassed  = estOttDate && estOttDate < today
              const pct = relDate && estOttDate
                ? Math.min(100, Math.max(4, Math.floor(((today - relDate) / (estOttDate - relDate)) * 100)))
                : 0
              const fmtDate = d => d?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

              const ProviderRow = ({ label, list, accentColor, accentBg }) => list.length === 0 ? null : (
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.9px', textTransform: 'uppercase', color: accentColor, marginBottom: 10, fontFamily: "'DM Sans',sans-serif" }}>
                    {label}
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {list.map(p => (
                      <a
                        key={p.provider_id}
                        href={providers.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`${label} on ${p.provider_name}`}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, textDecoration: 'none', transition: 'transform .22s cubic-bezier(.34,1.56,.64,1)' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.12) translateY(-2px)'}
                        onMouseOut={e  => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
                      >
                        <div style={{ width: 46, height: 46, borderRadius: 12, overflow: 'hidden', border: `1px solid ${accentBg}`, boxShadow: `0 4px 12px rgba(0,0,0,.4)`, flexShrink: 0 }}>
                          <img
                            src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                            alt={p.provider_name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            onError={e => { e.target.parentElement.style.background = '#1a1a2e'; e.target.style.display = 'none' }}
                          />
                        </div>
                        <span style={{ color: 'rgba(255,255,255,.5)', fontSize: 9, fontFamily: "'DM Sans',sans-serif", textAlign: 'center', maxWidth: 52, lineHeight: 1.3, fontWeight: 500 }}>
                          {p.provider_name.length > 12 ? p.provider_name.split(' ')[0] : p.provider_name}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )

              return (
                <div style={{ marginBottom: 22, borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,.08)', background: 'rgba(255,255,255,.02)' }}>

                  {/* Header bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontSize: 13 }}>📺</span>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.9px', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', fontFamily: "'DM Sans',sans-serif" }}>
                        Where to Watch
                      </span>
                      {!isDemo && hasAny && (
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', fontFamily: "'DM Sans',sans-serif" }}>· India</span>
                      )}
                    </div>
                    {providers.link && (
                      <a href={providers.link} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 10, color: '#0ea5e9', textDecoration: 'none', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, opacity: .8, transition: 'opacity .2s' }}
                        onMouseOver={e => e.currentTarget.style.opacity = '1'}
                        onMouseOut={e  => e.currentTarget.style.opacity = '.8'}>
                        JustWatch ↗
                      </a>
                    )}
                  </div>

                  <div style={{ padding: '16px 16px 12px' }}>

                    {/* ── Demo mode ── */}
                    {isDemo ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(14,165,233,.06)', border: '1px solid rgba(14,165,233,.18)', borderRadius: 10 }}>
                        <span style={{ fontSize: 22, flexShrink: 0 }}>🔑</span>
                        <div>
                          <p style={{ color: 'white', fontWeight: 700, fontSize: 12, fontFamily: "'DM Sans',sans-serif", marginBottom: 2 }}>Add TMDB API Key</p>
                          <p style={{ color: 'rgba(255,255,255,.42)', fontSize: 11, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.5 }}>
                            Connect your API key from TMDB to see live streaming availability (Netflix, Prime Video, JioHotstar & more).
                          </p>
                        </div>
                      </div>

                    ) : hasAny ? (
                      /* ── Has providers → show Stream / Rent / Buy rows ── */
                      <div>
                        <ProviderRow label="Stream Free"     list={flatrate} accentColor="#10b981" accentBg="rgba(16,185,129,.25)" />
                        {flatrate.length > 0 && (rent.length > 0 || buy.length > 0) && (
                          <div style={{ height: 1, background: 'rgba(255,255,255,.05)', margin: '4px 0 14px' }} />
                        )}
                        <ProviderRow label="Rent"            list={rent}     accentColor="#d4a843" accentBg="rgba(212,168,67,.25)" />
                        {rent.length > 0 && buy.length > 0 && (
                          <div style={{ height: 1, background: 'rgba(255,255,255,.05)', margin: '4px 0 14px' }} />
                        )}
                        <ProviderRow label="Buy / Download"  list={buy}      accentColor="#0ea5e9" accentBg="rgba(14,165,233,.25)" />

                        {/* All options CTA */}
                        <a href={providers.link} target="_blank" rel="noopener noreferrer"
                          style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, fontSize: 11, color: 'rgba(255,255,255,.55)', textDecoration: 'none', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, transition: 'all .2s' }}
                          onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,.08)'; e.currentTarget.style.color = 'white' }}
                          onMouseOut={e  => { e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.color = 'rgba(255,255,255,.55)' }}>
                          🌐 See all options on JustWatch →
                        </a>
                      </div>

                    ) : (
                      /* ── No providers anywhere → theatrical / coming soon card ── */
                      <div>
                        {isFuture ? (
                          /* Movie hasn't released in theaters yet */
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', background: 'rgba(139,92,246,.07)', border: '1px solid rgba(139,92,246,.22)', borderRadius: 11, marginBottom: 14 }}>
                            <span style={{ fontSize: 26, flexShrink: 0 }}>🎬</span>
                            <div>
                              <p style={{ color: '#8b5cf6', fontWeight: 700, fontSize: 13, fontFamily: "'DM Sans',sans-serif", marginBottom: 3 }}>Coming to Theaters</p>
                              <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 11, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.6 }}>
                                This film releases in cinemas on <strong style={{ color: 'white' }}>{fmtDate(relDate)}</strong>. OTT streaming typically follows 3–6 months later.
                              </p>
                            </div>
                          </div>
                        ) : (
                          /* Released theatrically but OTT not yet confirmed */
                          <div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', background: 'rgba(229,9,20,.05)', border: '1px solid rgba(229,9,20,.18)', borderRadius: 11, marginBottom: 16 }}>
                              <span style={{ fontSize: 26, flexShrink: 0 }}>🎭</span>
                              <div>
                                <p style={{ color: '#e50914', fontWeight: 700, fontSize: 13, fontFamily: "'DM Sans',sans-serif", marginBottom: 3 }}>
                                  Not on OTT Yet
                                </p>
                                <p style={{ color: 'rgba(255,255,255,.52)', fontSize: 11, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.6 }}>
                                  Currently showing in cinemas. Hollywood films typically arrive on streaming platforms <strong style={{ color: 'rgba(255,255,255,.8)' }}>3–6 months</strong> after their theatrical debut.
                                </p>
                              </div>
                            </div>

                            {/* Theatrical → OTT timeline */}
                            {relDate && estOttDate && (
                              <div style={{ marginBottom: 14 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 }}>
                                  <div style={{ textAlign: 'left' }}>
                                    <p style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', fontFamily: "'DM Sans',sans-serif", fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: 2 }}>In Theaters</p>
                                    <p style={{ fontSize: 11, color: 'white', fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>{fmtDate(relDate)}</p>
                                  </div>
                                  <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', fontFamily: "'DM Sans',sans-serif", fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: 2 }}>Progress</p>
                                    <p style={{ fontSize: 11, color: '#d4a843', fontFamily: "'DM Sans',sans-serif", fontWeight: 700 }}>{pct}%</p>
                                  </div>
                                  <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', fontFamily: "'DM Sans',sans-serif", fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: 2 }}>
                                      {estPassed ? 'Est. OTT Date' : 'Estimated OTT'}
                                    </p>
                                    <p style={{ fontSize: 11, color: estPassed ? '#10b981' : '#d4a843', fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>
                                      {estPassed ? '⏳ Overdue' : `~${fmtDate(estOttDate)}`}
                                    </p>
                                  </div>
                                </div>

                                {/* Progress bar */}
                                <div style={{ height: 5, background: 'rgba(255,255,255,.07)', borderRadius: 99, overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: pct >= 100 ? 'linear-gradient(90deg,#10b981,#34d399)' : 'linear-gradient(90deg,#e50914,#d4a843)', transition: 'width 1s ease' }} />
                                </div>
                                <p style={{ fontSize: 10, color: 'rgba(255,255,255,.28)', fontFamily: "'DM Sans',sans-serif", marginTop: 5, textAlign: 'center' }}>
                                  Based on the standard 90-day theatrical window · Estimate only
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Notify CTA */}
                        <a
                          href={`https://www.justwatch.com/in/search?q=${encodeURIComponent(movie?.title || '')}`}
                          target="_blank" rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: 'rgba(14,165,233,.1)', border: '1px solid rgba(14,165,233,.28)', borderRadius: 9, fontSize: 12, color: '#0ea5e9', textDecoration: 'none', fontFamily: "'DM Sans',sans-serif", fontWeight: 700, transition: 'all .2s' }}
                          onMouseOver={e => { e.currentTarget.style.background = 'rgba(14,165,233,.2)'; e.currentTarget.style.boxShadow = '0 0 18px rgba(14,165,233,.18)' }}
                          onMouseOut={e  => { e.currentTarget.style.background = 'rgba(14,165,233,.1)'; e.currentTarget.style.boxShadow = 'none' }}>
                          🔔 Get notified when it hits OTT →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}

            {/* ── Tabs ─────────────────────────────────────────────────── */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,.06)', marginBottom: 16 }}>
              {['overview', 'cast', 'similar'].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 12, textTransform: 'capitalize', color: tab === t ? 'white' : 'rgba(255,255,255,.36)', borderBottom: tab === t ? '2px solid #e50914' : '2px solid transparent', marginBottom: -1, transition: 'all .2s' }}>{t}</button>
              ))}
            </div>

            {/* Tab content */}
            {tab === 'overview' && (
              <div className="fi">
                <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 13, lineHeight: 1.8, marginBottom: 14 }}>{movie.overview}</p>
                {dirs.length > 0 && <p style={{ color: 'rgba(255,255,255,.38)', fontSize: 12 }}>Director: <span style={{ color: 'white', fontWeight: 500 }}>{dirs.map(d => d.name).join(', ')}</span></p>}
              </div>
            )}

            {tab === 'cast' && (
              <div className="fi">
                {cast.length ? (
                  <>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontFamily: "'DM Sans',sans-serif", marginBottom: 12 }}>Click any cast member for bio & filmography</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {cast.map(p => (
                        <div key={p.id} onClick={() => openActor(p)}
                          style={{ textAlign: 'center', width: 72, cursor: 'pointer', transition: 'transform .2s' }}
                          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                          onMouseOut={e  => e.currentTarget.style.transform = 'translateY(0)'}>
                          <div style={{ width: 58, height: 58, borderRadius: '50%', margin: '0 auto 6px', overflow: 'hidden', border: '2px solid rgba(255,255,255,.07)', background: '#1a1a2e', position: 'relative' }}>
                            <img src={imgUrl(p.profile_path, 'w185') || `https://placehold.co/58x58/1a1a2e/555?text=${p.name[0]}`} alt={p.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={e => e.target.src = `https://placehold.co/58x58/1a1a2e/555?text=${p.name[0]}`} />
                          </div>
                          <p style={{ fontSize: 10, color: 'white', fontWeight: 600, lineHeight: 1.3 }}>{p.name}</p>
                          <p style={{ fontSize: 9, color: 'rgba(255,255,255,.32)', lineHeight: 1.3 }}>{p.character?.split('/')?.[0]}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : <p style={{ color: 'rgba(255,255,255,.32)', fontSize: 12 }}>No cast data in demo mode — connect TMDB API for full cast.</p>}
              </div>
            )}

            {tab === 'similar' && (
              <div className="fi">
                {similar.length ? (
                  <div style={{ display: 'flex', gap: 9, overflowX: 'auto', paddingBottom: 7 }}>
                    {similar.map(m => <MovieCard key={m.id} movie={m} size="sm" />)}
                  </div>
                ) : <p style={{ color: 'rgba(255,255,255,.32)', fontSize: 12 }}>No similar movies found.</p>}
              </div>
            )}

            {/* ── Production Companies ──────────────────────────────────── */}
            {companies.length > 0 && (
              <div style={{ marginTop: 28, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,.06)' }}>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.8px', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', fontFamily: "'DM Sans',sans-serif", marginBottom: 12 }}>Production</p>
                <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
                  {companies.map(c => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: .7, transition: 'opacity .2s' }}
                      onMouseOver={e => e.currentTarget.style.opacity = '1'}
                      onMouseOut={e  => e.currentTarget.style.opacity = '.7'}>
                      <img src={`https://image.tmdb.org/t/p/w92${c.logo_path}`} alt={c.name}
                        style={{ height: 22, maxWidth: 70, objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                        onError={e => e.target.style.display = 'none'} />
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', fontFamily: "'DM Sans',sans-serif" }}>{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showT && <TrailerModal videoKey={tk} onClose={() => setShowT(false)} />}

      {/* ── Actor Detail Modal ───────────────────────────────────────────── */}
      {actorModal && (
        <div onClick={() => setActorModal(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.82)', backdropFilter: 'blur(10px)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'fadeIn .2s ease' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#0e0e1c', border: '1px solid rgba(255,255,255,.09)', borderRadius: 18, width: '100%', maxWidth: 560, maxHeight: '86vh', overflowY: 'auto', position: 'relative' }}>

            {/* Close */}
            <button onClick={() => setActorModal(null)}
              style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: 'white', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
              ✕
            </button>

            {actorBusy ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}><Spinner size={40} /></div>
            ) : (
              <>
                {/* Header */}
                <div style={{ display: 'flex', gap: 18, padding: '24px 24px 0' }}>
                  <div style={{ width: 90, height: 120, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: '#1a1a2e', border: '1px solid rgba(255,255,255,.07)' }}>
                    <img src={imgUrl(actorModal.profile_path, 'w185') || `https://placehold.co/90x120/1a1a2e/555?text=${(actorModal.name||'?')[0]}`}
                      alt={actorModal.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => e.target.src = `https://placehold.co/90x120/1a1a2e/555?text=${(actorModal.name||'?')[0]}`} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 28, color: 'white', marginBottom: 5 }}>{actorModal.name}</h2>
                    {actorModal.known_for_department && (
                      <span style={{ fontSize: 11, color: '#e50914', fontFamily: "'DM Sans',sans-serif", fontWeight: 700, background: 'rgba(229,9,20,.1)', border: '1px solid rgba(229,9,20,.22)', borderRadius: 5, padding: '2px 9px' }}>
                        {actorModal.known_for_department}
                      </span>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                      {actorModal.birthday && (
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', fontFamily: "'DM Sans',sans-serif" }}>
                          🎂 {new Date(actorModal.birthday).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {!actorModal.deathday && ` (${new Date().getFullYear() - new Date(actorModal.birthday).getFullYear()} yrs)`}
                        </span>
                      )}
                      {actorModal.place_of_birth && (
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', fontFamily: "'DM Sans',sans-serif" }}>📍 {actorModal.place_of_birth}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {actorModal.biography && (
                  <div style={{ padding: '16px 24px 0' }}>
                    <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.7px', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', fontFamily: "'DM Sans',sans-serif", marginBottom: 8 }}>Biography</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', fontFamily: "'DM Sans',sans-serif", lineHeight: 1.75 }}>
                      {actorModal.biography.length > 480 ? actorModal.biography.slice(0, 480) + '…' : actorModal.biography}
                    </p>
                  </div>
                )}

                {/* Known For */}
                {actorModal.movie_credits?.cast?.length > 0 && (
                  <div style={{ padding: '16px 24px 24px' }}>
                    <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.7px', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', fontFamily: "'DM Sans',sans-serif", marginBottom: 12 }}>Known For</p>
                    <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
                      {[...actorModal.movie_credits.cast]
                        .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
                        .slice(0, 8)
                        .map(m => (
                          <div key={m.id} style={{ flexShrink: 0, width: 80, textAlign: 'center' }}>
                            <div style={{ width: 80, height: 112, borderRadius: 9, overflow: 'hidden', background: '#1a1a2e', marginBottom: 5, border: '1px solid rgba(255,255,255,.06)' }}>
                              <img src={m.poster_path ? `https://image.tmdb.org/t/p/w154${m.poster_path}` : `https://placehold.co/80x112/1a1a2e/444?text=${encodeURIComponent(m.title?.[0]||'?')}`}
                                alt={m.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={e => e.target.src = `https://placehold.co/80x112/1a1a2e/444?text=?`} />
                            </div>
                            <p style={{ fontSize: 9, color: 'rgba(255,255,255,.65)', fontFamily: "'DM Sans',sans-serif", lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</p>
                            {m.vote_average > 0 && <p style={{ fontSize: 8, color: '#d4a843', fontFamily: "'DM Sans',sans-serif" }}>⭐ {m.vote_average.toFixed(1)}</p>}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
