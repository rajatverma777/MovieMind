// src/pages/CineGraphPage.jsx
// CineTimeline: Interactive Cinematic Universe Timeline & Prerequisite Watch Tracker
// Deeply engineered for interconnected film sagas (e.g., Road to Avengers: Doomsday, Batman, Star Wars, Dune, Spider-Verse)

import { useState, useEffect, useMemo, useRef } from 'react'
import { useApp } from '@/context/AppContext'
import { imgUrl } from '@/data/constants'
import { FRANCHISES } from '@/data/timelinesData'
import AppleSegmentedControl from '@/components/AppleSegmentedControl'

export default function CineGraphPage() {
  const { navigate, watchlist, toggleWatchlist } = useApp()

  // 1. Franchise selection
  const [selectedFranchiseId, setSelectedFranchiseId] = useState('mcu')
  const activeFranchise = useMemo(() => {
    return FRANCHISES.find(f => f.id === selectedFranchiseId) || FRANCHISES[0]
  }, [selectedFranchiseId])

  // 2. Target Movie selection (e.g. Avengers: Doomsday)
  const [targetMovieId, setTargetMovieId] = useState(() => activeFranchise.defaultTargetId)

  // Update target when franchise changes
  useEffect(() => {
    setTargetMovieId(activeFranchise.defaultTargetId)
  }, [activeFranchise])

  const targetMovie = useMemo(() => {
    return activeFranchise.targetMovies.find(t => t.id === targetMovieId) || activeFranchise.targetMovies[0]
  }, [activeFranchise, targetMovieId])

  // 3. View Mode: 'chronological' (All 40 Titles in In-Universe Order) vs 'essential' (Road to Target) vs 'release' (Theatrical Order)
  const [viewMode, setViewMode] = useState('chronological')

  // 4. Watched Status Tracking (persisted to localStorage)
  const [watchedMap, setWatchedMap] = useState(() => {
    try {
      const saved = localStorage.getItem('cinemind_timeline_watched')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const toggleWatched = (movieId) => {
    setWatchedMap(prev => {
      const next = { ...prev, [movieId]: !prev[movieId] }
      try {
        localStorage.setItem('cinemind_timeline_watched', JSON.stringify(next))
      } catch (err) {
        console.warn('Failed saving watched status:', err)
      }
      return next
    })
  }

  // 5. Search & Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [onlyCritical, setOnlyCritical] = useState(false)
  const [hideWatched, setHideWatched] = useState(false)
  const [selectedMovieForDetail, setSelectedMovieForDetail] = useState(null)

  // 6. Timeline list processing
  const processedMovies = useMemo(() => {
    let list = [...activeFranchise.movies]

    // Assign dynamic tier and lore for the chosen target
    list = list.map(m => {
      const prereq = m.prerequisiteFor?.[targetMovieId]
      const tier = m.isTarget ? 'target' : (prereq?.tier || 'optional')
      const loreBridge = prereq?.loreBridge || (m.isTarget ? 'THE DESTINATION TARGET MOVIE.' : 'Optional standalone adventure.')
      const isCritical = tier === 'critical'
      const isRecommended = tier === 'recommended'
      return {
        ...m,
        computedTier: tier,
        isCritical,
        isRecommended,
        computedLoreBridge: loreBridge
      }
    })

    // Filter by mode
    if (viewMode === 'essential') {
      // In essential mode, show critical + recommended + target
      list = list.filter(m => m.isTarget || m.isCritical || m.isRecommended)
      // Sort in narrative progression toward the target
      list.sort((a, b) => a.releaseOrder - b.releaseOrder)
    } else if (viewMode === 'chronological') {
      list.sort((a, b) => a.chronologicalOrder - b.chronologicalOrder)
    } else {
      // release order
      list.sort((a, b) => a.releaseOrder - b.releaseOrder)
    }

    // Filter: Fast-track only
    if (onlyCritical && viewMode !== 'essential') {
      list = list.filter(m => m.isTarget || m.isCritical)
    }

    // Filter: Hide watched
    if (hideWatched) {
      list = list.filter(m => !watchedMap[m.id] || m.isTarget)
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.phase.toLowerCase().includes(q) ||
        (m.characters && m.characters.some(c => c.toLowerCase().includes(q))) ||
        (m.computedLoreBridge && m.computedLoreBridge.toLowerCase().includes(q))
      )
    }

    return list
  }, [activeFranchise, targetMovieId, viewMode, onlyCritical, hideWatched, searchQuery, watchedMap])

  // 7. Prerequisite Completion Stats Calculation
  const stats = useMemo(() => {
    const allPrereqs = activeFranchise.movies.filter(m => !m.isTarget && m.prerequisiteFor?.[targetMovieId])
    const criticalPrereqs = allPrereqs.filter(m => m.prerequisiteFor?.[targetMovieId]?.tier === 'critical')

    const totalCritical = criticalPrereqs.length
    const watchedCritical = criticalPrereqs.filter(m => watchedMap[m.id]).length

    const totalMinutes = criticalPrereqs.reduce((acc, m) => acc + (m.runtime || 120), 0)
    const watchedMinutes = criticalPrereqs.filter(m => watchedMap[m.id]).reduce((acc, m) => acc + (m.runtime || 120), 0)
    const remainingMinutes = Math.max(0, totalMinutes - watchedMinutes)

    const percentage = totalCritical > 0 ? Math.round((watchedCritical / totalCritical) * 100) : 0
    const remainingHours = Math.floor(remainingMinutes / 60)
    const remainingMinsRemainder = remainingMinutes % 60

    return {
      totalCritical,
      watchedCritical,
      percentage,
      remainingMinutes,
      remainingTimeFormatted: `${remainingHours}h ${remainingMinsRemainder}m`,
      totalTimeFormatted: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
    }
  }, [activeFranchise, targetMovieId, watchedMap])

  // Auto-select first movie for detail preview if none selected
  useEffect(() => {
    if (processedMovies.length > 0 && !selectedMovieForDetail) {
      setSelectedMovieForDetail(processedMovies[0])
    }
  }, [processedMovies])

  return (
    <div
      style={{
        maxWidth: 1360,
        margin: '0 auto',
        padding: '24px 20px 180px',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', sans-serif",
        color: '#ffffff',
        minHeight: '100vh',
        backgroundImage: 'radial-gradient(ellipse 70% 35% at 50% -5%, rgba(10, 132, 255, 0.08) 0%, transparent 60%)'
      }}
    >
      {/* ── HEADER & TITLE ────────────────────────────────────────────────── */}
      <div className="fu" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              background: 'rgba(255, 255, 255, 0.07)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: 9999,
              padding: '5px 14px',
              fontSize: 11.5,
              fontWeight: 650,
              color: '#38bdf8',
              marginBottom: 10,
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25)'
            }}>
              <span>⏳</span> Cinematic Universe & Prerequisite Watch Engine
            </div>

            <h1 style={{
              fontSize: 'clamp(32px, 4.5vw, 46px)',
              fontWeight: 700,
              letterSpacing: -0.9,
              margin: '0 0 6px 0',
              lineHeight: 1.15
            }}>
              CineTimeline
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14, maxWidth: 680, margin: 0 }}>
              Preparing for a major cinematic release? Discover the exact order and critical must-watch films required to understand every plot twist, multiverse bridge, and character return.
            </p>
          </div>

          {/* Franchise Selector Pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', background: 'rgba(255, 255, 255, 0.04)', padding: 6, borderRadius: 100, border: '1px solid rgba(255, 255, 255, 0.09)', backdropFilter: 'blur(20px)' }}>
            {FRANCHISES.map(f => {
              const isSelected = f.id === selectedFranchiseId
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    setSelectedFranchiseId(f.id)
                    setSelectedMovieForDetail(null)
                  }}
                  style={{
                    background: isSelected ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
                    border: isSelected ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
                    color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.65)',
                    borderRadius: 9999,
                    padding: '8px 16px',
                    fontSize: 12.5,
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: isSelected ? '0 4px 14px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.3)' : 'none',
                    transition: 'all 0.2s var(--apple-spring-smooth)'
                  }}
                >
                  <span>{f.icon}</span>
                  <span>{f.shortName}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── TARGET DESTINATION & READINESS DASHBOARD ──────────────────────── */}
      <div
        className="apple-glass-card fu d1"
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          backgroundImage: activeFranchise.bgGradient,
          backdropFilter: 'blur(40px) saturate(190%)',
          WebkitBackdropFilter: 'blur(40px) saturate(190%)',
          border: '1.2px solid rgba(255, 255, 255, 0.14)',
          borderRadius: 26,
          padding: '24px 28px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45), inset 0 1px 1.5px rgba(255, 255, 255, 0.2)',
          marginBottom: 32,
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 1.4fr) minmax(280px, 1fr)',
          gap: 28,
          alignItems: 'center'
        }}
      >
        {/* Left Column: Target Destination Picker */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: '#38bdf8' }}>
              🎯 Target Destination Movie:
            </span>
            <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: 9999, color: 'rgba(255,255,255,0.7)' }}>
              {targetMovie?.year || 'Upcoming'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 700, margin: 0, letterSpacing: -0.5 }}>
              {targetMovie?.title}
            </h2>

            {/* Target Movie Dropdown Switcher */}
            {activeFranchise.targetMovies.length > 1 && (
              <select
                value={targetMovieId}
                onChange={e => setTargetMovieId(e.target.value)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 12,
                  padding: '6px 12px',
                  color: 'white',
                  fontSize: 12.5,
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {activeFranchise.targetMovies.map(tm => (
                  <option key={tm.id} value={tm.id} style={{ background: '#0e111d', color: 'white' }}>
                    Destination: {tm.title} ({tm.year})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ fontSize: 13, color: '#fbbf24', fontWeight: 650, marginBottom: 6 }}>
            {targetMovie?.headline}
          </div>

          <p style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.72)', lineHeight: 1.6, margin: 0, maxWidth: 640 }}>
            {targetMovie?.loreSummary}
          </p>
        </div>

        {/* Right Column: Readiness Meter & Binge Estimator */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 20,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.1)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Theater Readiness:
            </span>
            <span style={{ fontSize: 13, fontWeight: 800, color: stats.percentage >= 100 ? '#34d399' : '#38bdf8' }}>
              {stats.percentage}% Prepared
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: 10, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 9999, overflow: 'hidden', position: 'relative' }}>
            <div
              style={{
                width: `${stats.percentage}%`,
                height: '100%',
                background: stats.percentage >= 100
                  ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
                  : 'linear-gradient(90deg, #0a84ff 0%, #38bdf8 100%)',
                borderRadius: 9999,
                boxShadow: '0 0 12px rgba(56, 189, 248, 0.5)',
                transition: 'width 0.4s var(--apple-spring)'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
            <span>
              <strong style={{ color: '#ffffff' }}>{stats.watchedCritical}</strong> of <strong style={{ color: '#ffffff' }}>{stats.totalCritical}</strong> Critical Prerequisites Watched
            </span>
            <span style={{ fontSize: 11.5, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>⏱️</span> {stats.remainingMinutes > 0 ? `${stats.remainingTimeFormatted} left` : 'All Done!'}
            </span>
          </div>

          {/* Quick Helper actions */}
          <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                const newMap = { ...watchedMap }
                activeFranchise.movies.forEach(m => {
                  if (m.prerequisiteFor?.[targetMovieId]?.tier === 'critical') {
                    newMap[m.id] = true
                  }
                })
                setWatchedMap(newMap)
                localStorage.setItem('cinemind_timeline_watched', JSON.stringify(newMap))
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.07)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 8,
                padding: '4px 10px',
                fontSize: 10.5,
                color: 'rgba(255, 255, 255, 0.75)',
                cursor: 'pointer'
              }}
            >
              ✓ Mark All Critical Watched
            </button>

            <button
              onClick={() => {
                const newMap = { ...watchedMap }
                activeFranchise.movies.forEach(m => {
                  delete newMap[m.id]
                })
                setWatchedMap(newMap)
                localStorage.setItem('cinemind_timeline_watched', JSON.stringify(newMap))
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.07)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 8,
                padding: '4px 10px',
                fontSize: 10.5,
                color: 'rgba(255, 255, 255, 0.75)',
                cursor: 'pointer'
              }}
            >
              ↺ Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── CONTROLS & TIMELINE FILTER BAR ───────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        {/* Apple Segmented Control for Timeline Mode */}
        <AppleSegmentedControl
          options={[
            { id: 'chronological', label: `⏱️ In-Universe Timeline (All ${activeFranchise.movies.length} Titles)` },
            { id: 'essential', label: `🎯 Essential Road to ${targetMovie?.title?.split(':')[1] || targetMovie?.title || 'Target'}` },
            { id: 'release', label: '📅 Theatrical Release (Phases 1–6)' }
          ]}
          value={viewMode}
          onChange={setViewMode}
        />

        {/* Search & Checkbox Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search movie, character, lore..."
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: 100,
              padding: '8px 16px',
              fontSize: 12.5,
              color: 'white',
              outline: 'none',
              width: 220
            }}
          />

          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.75)', cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={hideWatched}
              onChange={e => setHideWatched(e.target.checked)}
              style={{ accentColor: '#0a84ff', cursor: 'pointer' }}
            />
            Hide Watched
          </label>

          {viewMode !== 'essential' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.75)', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={onlyCritical}
                onChange={e => setOnlyCritical(e.target.checked)}
                style={{ accentColor: '#e50914', cursor: 'pointer' }}
              />
              Must-Watch Critical Only
            </label>
          )}
        </div>
      </div>

      {/* Active Mode Summary Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.14)', padding: '4px 14px', borderRadius: 9999, color: '#38bdf8', fontWeight: 650 }}>
          {viewMode === 'essential'
            ? `🎯 Showing ${processedMovies.length} Critical & Recommended Prerequisites for ${targetMovie?.title}`
            : `⏱️ Showing all ${processedMovies.length} ${activeFranchise.name} titles in sequence`}
        </span>
        <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.5)' }}>
          Click on any film to inspect lore bridges and key characters.
        </span>
      </div>

      {/* ── TIMELINE CONTAINER & SIDE INSPECTOR SPLIT ─────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedMovieForDetail ? '1fr 380px' : '1fr', gap: 32, alignItems: 'start' }}>
        {/* Timeline Stream */}
        <div style={{ position: 'relative' }}>
          {/* Central Glowing Laser Line */}
          <div
            style={{
              position: 'absolute',
              top: 24,
              bottom: 40,
              left: 28,
              width: 3,
              background: 'linear-gradient(to bottom, #0a84ff 0%, #a855f7 60%, #ec4899 100%)',
              boxShadow: '0 0 16px rgba(10, 132, 255, 0.65)',
              borderRadius: 2
            }}
          />

          {processedMovies.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
              No movies match your current search or filters.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {processedMovies.map((movie, index) => {
                const isWatched = !!watchedMap[movie.id]
                const inWatchlist = watchlist.some(w => w.id === movie.tmdbId || w.title === movie.title)
                const isSelected = selectedMovieForDetail?.id === movie.id

                return (
                  <div
                    key={movie.id}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 22,
                      paddingLeft: 14
                    }}
                  >
                    {/* Glowing Timeline Bead Node */}
                    <div
                      onClick={() => toggleWatched(movie.id)}
                      title={isWatched ? 'Click to unmark watched' : 'Click to mark watched'}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        background: isWatched ? '#10b981' : (movie.isTarget ? '#ec4899' : (movie.isCritical ? '#0a84ff' : '#64748b')),
                        border: '3px solid #090910',
                        boxShadow: isWatched
                          ? '0 0 16px rgba(16, 185, 129, 0.8)'
                          : (movie.isTarget ? '0 0 20px rgba(236, 72, 153, 0.9)' : '0 0 12px rgba(10, 132, 255, 0.5)'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: 12,
                        fontWeight: 900,
                        flexShrink: 0,
                        cursor: 'pointer',
                        zIndex: 2,
                        marginTop: 20,
                        transition: 'transform 0.2s ease, background 0.2s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {isWatched ? '✓' : index + 1}
                    </div>

                    {/* Movie Card Plate */}
                    <div
                      onClick={() => setSelectedMovieForDetail(movie)}
                      className="apple-glass-card"
                      style={{
                        flex: 1,
                        background: isSelected
                          ? 'rgba(255, 255, 255, 0.08)'
                          : (movie.isTarget ? 'rgba(236, 72, 153, 0.07)' : 'rgba(255, 255, 255, 0.04)'),
                        backgroundImage: isSelected
                          ? 'linear-gradient(135deg, rgba(10, 132, 255, 0.14) 0%, rgba(255, 255, 255, 0.02) 100%)'
                          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.01) 100%)',
                        backdropFilter: 'blur(30px) saturate(190%)',
                        WebkitBackdropFilter: 'blur(30px) saturate(190%)',
                        border: isSelected
                          ? '1.5px solid rgba(10, 132, 255, 0.6)'
                          : (movie.isTarget ? '1.5px solid rgba(236, 72, 153, 0.45)' : '1px solid rgba(255, 255, 255, 0.12)'),
                        borderRadius: 22,
                        padding: 20,
                        boxShadow: isSelected
                          ? '0 16px 40px rgba(10, 132, 255, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.3)'
                          : '0 12px 32px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
                        cursor: 'pointer',
                        transition: 'all 0.22s var(--apple-spring-smooth)',
                        display: 'flex',
                        gap: 20,
                        alignItems: 'flex-start'
                      }}
                    >
                      {/* Poster Thumbnail */}
                      <div style={{ position: 'relative', width: 95, flexShrink: 0, borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.5)' }}>
                        <img
                          src={imgUrl(movie.poster_path, 'w185') || `https://placehold.co/95x142/13131f/ffffff?text=${encodeURIComponent(movie.title)}`}
                          alt={movie.title}
                          style={{ width: 95, height: 142, objectFit: 'cover', display: 'block' }}
                          onError={e => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src = `https://placehold.co/95x142/13131f/ffffff?text=${encodeURIComponent(movie.title)}`
                          }}
                        />
                        {isWatched && (
                          <div style={{
                            position: 'absolute', top: 6, left: 6,
                            background: '#10b981', color: 'white',
                            fontSize: 10, fontWeight: 800, padding: '2px 6px',
                            borderRadius: 6, boxShadow: '0 2px 6px rgba(0,0,0,0.5)'
                          }}>
                            ✓ Watched
                          </div>
                        )}
                      </div>

                      {/* Content Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Badges Bar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                          {movie.isTarget ? (
                            <span style={{ fontSize: 10.5, fontWeight: 800, padding: '3px 10px', borderRadius: 9999, background: '#ec4899', color: 'white', letterSpacing: 0.5 }}>
                              👑 DESTINATION TARGET
                            </span>
                          ) : movie.isCritical ? (
                            <span style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 10px', borderRadius: 9999, background: 'rgba(239, 68, 68, 0.18)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.35)' }}>
                              🔴 CRITICAL MUST-WATCH
                            </span>
                          ) : movie.isRecommended ? (
                            <span style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 10px', borderRadius: 9999, background: 'rgba(251, 191, 36, 0.16)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                              🟡 RECOMMENDED LORE
                            </span>
                          ) : (
                            <span style={{ fontSize: 10.5, fontWeight: 600, padding: '3px 10px', borderRadius: 9999, background: 'rgba(255, 255, 255, 0.08)', color: 'rgba(255,255,255,0.6)' }}>
                              ⚪ OPTIONAL
                            </span>
                          )}

                          <span style={{ fontSize: 11, color: '#38bdf8', fontWeight: 600 }}>
                            {movie.phase}
                          </span>

                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>•</span>

                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>
                            In-Universe: <strong>{movie.chronologicalYear}</strong>
                          </span>
                        </div>

                        {/* Title & Meta */}
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', margin: 0 }}>
                            {movie.title}
                          </h3>
                          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                            ({movie.releaseYear}) • {movie.runtimeStr}
                          </span>
                          <span style={{ fontSize: 11, color: '#fbbf24', fontWeight: 700 }}>
                            ⭐ {movie.rating}
                          </span>
                        </div>

                        {/* Lore Bridge / Why this movie is essential */}
                        <div
                          style={{
                            background: movie.isCritical ? 'rgba(10, 132, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                            border: movie.isCritical ? '1px solid rgba(10, 132, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: 12,
                            padding: '10px 14px',
                            fontSize: 12.5,
                            lineHeight: 1.55,
                            color: movie.isCritical ? '#e0f2fe' : 'rgba(255,255,255,0.8)',
                            marginBottom: 12
                          }}
                        >
                          <strong style={{ color: movie.isCritical ? '#38bdf8' : '#fbbf24', display: 'block', marginBottom: 2 }}>
                            {movie.isTarget ? 'Destination Goal:' : `Why watch before ${targetMovie?.title}:`}
                          </strong>
                          {movie.computedLoreBridge}
                        </div>

                        {/* Character Pills */}
                        {movie.characters && movie.characters.length > 0 && (
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                            {movie.characters.slice(0, 4).map(char => (
                              <span
                                key={char}
                                style={{
                                  fontSize: 10,
                                  background: 'rgba(255, 255, 255, 0.06)',
                                  padding: '2px 8px',
                                  borderRadius: 9999,
                                  color: 'rgba(255, 255, 255, 0.7)'
                                }}
                              >
                                {char}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => toggleWatched(movie.id)}
                            style={{
                              background: isWatched ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                              color: isWatched ? '#ffffff' : 'rgba(255, 255, 255, 0.85)',
                              border: isWatched ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
                              borderRadius: 8,
                              padding: '6px 14px',
                              fontSize: 11.5,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                              transition: 'all 0.18s ease'
                            }}
                          >
                            <span>{isWatched ? '✓ Watched' : '○ Mark as Watched'}</span>
                          </button>

                          <button
                            onClick={() => toggleWatchlist({ id: movie.tmdbId, title: movie.title, poster_path: movie.poster_path })}
                            style={{
                              background: inWatchlist ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                              border: inWatchlist ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid rgba(255, 255, 255, 0.12)',
                              color: inWatchlist ? '#d8b4fe' : 'rgba(255, 255, 255, 0.85)',
                              borderRadius: 8,
                              padding: '6px 14px',
                              fontSize: 11.5,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5
                            }}
                          >
                            <span>{inWatchlist ? '✓ Saved' : '+ Watchlist'}</span>
                          </button>

                          <button
                            onClick={() => navigate('movie', movie.tmdbId)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#38bdf8',
                              padding: '6px 12px',
                              fontSize: 11.5,
                              fontWeight: 650,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <span>Movie Details</span>
                            <span>➔</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── SIDE INSPECTOR PANEL (Sticky Apple VisionOS Glass Drawer) ───────── */}
        {selectedMovieForDetail && (
          <div
            className="apple-glass-card"
            style={{
              position: 'sticky',
              top: 24,
              background: 'rgba(255, 255, 255, 0.04)',
              backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.01) 100%)',
              backdropFilter: 'blur(40px) saturate(190%)',
              WebkitBackdropFilter: 'blur(40px) saturate(190%)',
              border: '1.2px solid rgba(255, 255, 255, 0.14)',
              borderRadius: 24,
              padding: 22,
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 1.5px rgba(255, 255, 255, 0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Inspector & Lore Guide
              </span>
              <button
                onClick={() => setSelectedMovieForDetail(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 26,
                  height: 26,
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12
                }}
              >
                ✕
              </button>
            </div>

            {/* Poster / Backdrop Header */}
            <div style={{ borderRadius: 14, overflow: 'hidden', position: 'relative', height: 160, marginBottom: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}>
              <img
                src={imgUrl(selectedMovieForDetail.backdrop_path || selectedMovieForDetail.poster_path, 'w500')}
                alt={selectedMovieForDetail.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = `https://placehold.co/500x280/13131f/ffffff?text=${encodeURIComponent(selectedMovieForDetail.title)}`
                }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(9, 9, 16, 0.95) 0%, rgba(9, 9, 16, 0.2) 100%)' }} />
              <div style={{ position: 'absolute', bottom: 12, left: 14, right: 14 }}>
                <h4 style={{ fontSize: 17, fontWeight: 700, color: 'white', margin: '0 0 2px 0' }}>
                  {selectedMovieForDetail.title}
                </h4>
                <div style={{ fontSize: 11, color: '#fbbf24', fontWeight: 600 }}>
                  Release: {selectedMovieForDetail.releaseYear} • Story: {selectedMovieForDetail.chronologicalYear}
                </div>
              </div>
            </div>

            {/* Synopsis */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 5 }}>
                Synopsis:
              </div>
              <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.75)', lineHeight: 1.55, margin: 0 }}>
                {selectedMovieForDetail.overview}
              </p>
            </div>

            {/* Why you must watch before target */}
            <div style={{
              background: 'rgba(10, 132, 255, 0.12)',
              border: '1px solid rgba(10, 132, 255, 0.35)',
              borderRadius: 14,
              padding: 14,
              marginBottom: 16
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: 4 }}>
                {selectedMovieForDetail.isTarget ? 'The Endgame Target:' : `Connection to ${targetMovie?.title}:`}
              </div>
              <div style={{ fontSize: 12.5, color: '#ffffff', lineHeight: 1.5 }}>
                {selectedMovieForDetail.computedLoreBridge}
              </div>
            </div>

            {/* Key Characters */}
            {selectedMovieForDetail.characters && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
                  Major Characters Featured:
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {selectedMovieForDetail.characters.map(char => (
                    <span
                      key={char}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        padding: '4px 10px',
                        borderRadius: 9999,
                        fontSize: 11,
                        color: 'white'
                      }}
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Open Full Details Button */}
            <button
              onClick={() => navigate('movie', selectedMovieForDetail.tmdbId)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.14)',
                border: '1px solid rgba(255, 255, 255, 0.28)',
                color: 'white',
                padding: '12px',
                borderRadius: 14,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 18px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)'}
            >
              <span>Explore Cast, Trailers & Deep Details</span>
              <span>➔</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
