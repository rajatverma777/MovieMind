// src/components/TasteEqualizer.jsx
// Interactive "Taste Tuning Console" (Multi-Dimensional Algorithmic Equalizer)

import { useState, useMemo } from 'react'
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts'
import { useApp } from '@/context/AppContext'
import { MOCK_MOVIES, GN, imgUrl } from '@/data/constants'

export default function TasteEqualizer() {
  const { navigate, toggleWatchlist, watchlist } = useApp()

  // Taste dimensions (0 to 100)
  const [pacing, setPacing] = useState(70)         // Slow Burn (0) -> High Octane (100)
  const [darkness, setDarkness] = useState(60)     // Uplifting (0) -> Dark & Bleak (100)
  const [complexity, setComplexity] = useState(85) // Popcorn (0) -> Mind-Bender (100)
  const [era, setEra] = useState(75)               // Vintage Classics (0) -> Modern 2020s (100)

  // Algorithmic Weights
  const [weightPlot, setWeightPlot] = useState(40)
  const [weightGenre, setWeightGenre] = useState(30)
  const [weightRating, setWeightRating] = useState(30)

  // Real-time multi-dimensional scoring engine
  const scoredMovies = useMemo(() => {
    return MOCK_MOVIES.map(m => {
      const gids = m.genre_ids || []
      const year = parseInt(m.release_date?.split('-')[0] || '2000', 10)

      // Estimate movie's intrinsic dimension coordinates (0 to 100)
      const moviePacing = gids.includes(28) ? 90 : gids.includes(53) ? 80 : gids.includes(16) ? 70 : 40
      const movieDarkness = gids.includes(27) ? 95 : (gids.includes(80) || gids.includes(53)) ? 80 : gids.includes(35) ? 20 : 50
      const movieComplexity = (gids.includes(878) && gids.includes(9648)) ? 95 : gids.includes(878) ? 85 : gids.includes(9648) ? 80 : 45
      const movieEra = Math.min(100, Math.max(0, (year - 1970) * 1.8))

      // Distance from user's current slider positions
      const distPacing = Math.abs(pacing - moviePacing)
      const distDarkness = Math.abs(darkness - movieDarkness)
      const distComplexity = Math.abs(complexity - movieComplexity)
      const distEra = Math.abs(era - movieEra)

      const dimensionAffinity = 100 - (distPacing * 0.3 + distDarkness * 0.3 + distComplexity * 0.25 + distEra * 0.15)
      const ratingBonus = (m.vote_average || 7) * 10

      // Weighted Composite Score
      const totalWeight = weightPlot + weightGenre + weightRating || 1
      const compositeScore = (
        (dimensionAffinity * weightPlot) +
        (dimensionAffinity * 0.9 * weightGenre) +
        (ratingBonus * weightRating)
      ) / totalWeight

      return {
        ...m,
        equalizerScore: Math.min(99, Math.max(20, Math.round(compositeScore))),
        moviePacing,
        movieDarkness,
        movieComplexity
      }
    })
    .sort((a, b) => b.equalizerScore - a.equalizerScore)
    .slice(0, 6)
  }, [pacing, darkness, complexity, era, weightPlot, weightGenre, weightRating])

  // Radar data comparing User calibration vs Top Pick
  const radarData = useMemo(() => {
    const top = scoredMovies[0]
    return [
      { subject: 'Pacing', user: pacing, movie: top?.moviePacing || 50 },
      { subject: 'Tone / Noir', user: darkness, movie: top?.movieDarkness || 50 },
      { subject: 'Complexity', user: complexity, movie: top?.movieComplexity || 50 },
      { subject: 'Recency / Era', user: era, movie: 75 }
    ]
  }, [pacing, darkness, complexity, era, scoredMovies])

  return (
    <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: '24px 26px', marginBottom: 34 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(14,165,233,.12)', border: '1px solid rgba(14,165,233,.25)', borderRadius: 20, padding: '3px 10px', fontSize: 10, fontWeight: 700, color: '#0ea5e9', marginBottom: 6 }}>
            <span>🎛️</span> DYNAMIC CALIBRATION CONSOLE
          </div>
          <h2 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 28, color: 'white', letterSpacing: '.5px' }}>
            Taste Tuning <span style={{ color: '#0ea5e9' }}>Equalizer</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 12 }}>
            Adjust aesthetic dimensions and algorithmic weights in real-time. Watch the recommendation frontier calibrate live.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24, alignItems: 'center' }}>
        {/* Sliders Console */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Slider 1: Pacing */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'white', fontWeight: 600, marginBottom: 6 }}>
              <span>⚡ Pacing Velocity</span>
              <span style={{ color: '#0ea5e9' }}>{pacing < 40 ? 'Slow-Burn' : pacing > 70 ? 'High-Octane' : 'Balanced'} ({pacing}%)</span>
            </div>
            <input
              type="range" min="0" max="100" value={pacing}
              onChange={e => setPacing(+e.target.value)}
              style={{ width: '100%', accentColor: '#0ea5e9', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 2 }}>
              <span>Arthouse Contemplative</span>
              <span>Relentless Action</span>
            </div>
          </div>

          {/* Slider 2: Darkness */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'white', fontWeight: 600, marginBottom: 6 }}>
              <span>🌑 Atmospheric Darkness</span>
              <span style={{ color: '#8b5cf6' }}>{darkness < 40 ? 'Light & Whimsical' : darkness > 70 ? 'Bleak & Gritty' : 'Neutral'} ({darkness}%)</span>
            </div>
            <input
              type="range" min="0" max="100" value={darkness}
              onChange={e => setDarkness(+e.target.value)}
              style={{ width: '100%', accentColor: '#8b5cf6', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 2 }}>
              <span>Feel-Good / Family</span>
              <span>Disturbing Neo-Noir</span>
            </div>
          </div>

          {/* Slider 3: Complexity */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'white', fontWeight: 600, marginBottom: 6 }}>
              <span>🧠 Intellectual Complexity</span>
              <span style={{ color: '#d4a843' }}>{complexity < 40 ? 'Straightforward Fun' : complexity > 70 ? 'Paradoxical Puzzle' : 'Medium'} ({complexity}%)</span>
            </div>
            <input
              type="range" min="0" max="100" value={complexity}
              onChange={e => setComplexity(+e.target.value)}
              style={{ width: '100%', accentColor: '#d4a843', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 2 }}>
              <span>Popcorn Escapism</span>
              <span>Mind-Bending Lore</span>
            </div>
          </div>

          {/* Slider 4: Era */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'white', fontWeight: 600, marginBottom: 6 }}>
              <span>⏳ Era & Vintage</span>
              <span style={{ color: '#10b981' }}>{era < 40 ? 'Golden Classics' : era > 70 ? 'Ultra-Modern' : '90s/2000s'} ({era}%)</span>
            </div>
            <input
              type="range" min="0" max="100" value={era}
              onChange={e => setEra(+e.target.value)}
              style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 2 }}>
              <span>1970s–1980s</span>
              <span>2020s Modern</span>
            </div>
          </div>
        </div>

        {/* Real-time Multi-Dimensional Radar Alignment */}
        <div style={{ background: 'rgba(0,0,0,.25)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', marginBottom: 4 }}>
            🎯 Calibrated Profile vs #1 Pick ({scoredMovies[0]?.title})
          </div>
          <div style={{ width: '100%', height: 190 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke="rgba(255,255,255,.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,.5)', fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Your Target" dataKey="user" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.4} />
                <Radar name="Movie Fit" dataKey="movie" stroke="#e50914" fill="#e50914" fillOpacity={0.25} />
                <Tooltip
                  contentStyle={{ background: '#0e0e1c', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, fontSize: 11 }}
                  itemStyle={{ color: 'white' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, fontSize: 10, marginTop: 4 }}>
            <span style={{ color: '#0ea5e9' }}>● Your Equalizer</span>
            <span style={{ color: '#e50914' }}>● Film Alignment</span>
          </div>
        </div>
      </div>

      {/* Real-Time Recommendations from Equalizer */}
      <div style={{ marginTop: 22, borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', marginBottom: 12 }}>
          ⚡ Live Recalculated Recommendations ({scoredMovies.length}):
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 12 }}>
          {scoredMovies.map(m => {
            const inWL = watchlist.some(w => w.id === m.id)
            return (
              <div
                key={m.id}
                style={{
                  background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)',
                  borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column'
                }}
              >
                <div style={{ position: 'relative' }}>
                  <img
                    src={imgUrl(m.poster_path, 'w185')}
                    alt={m.title}
                    onClick={() => navigate('movie', m.id)}
                    style={{ width: '100%', height: 110, objectFit: 'cover', cursor: 'pointer' }}
                  />
                  <div style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(14,165,233,.9)', color: 'white', borderRadius: 4, padding: '2px 6px', fontSize: 10, fontWeight: 800 }}>
                    {m.equalizerScore}% Fit
                  </div>
                </div>

                <div style={{ padding: '9px 10px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4
                      onClick={() => navigate('movie', m.id)}
                      style={{ fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {m.title}
                    </h4>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>
                      ⭐ {m.vote_average?.toFixed(1)} · {m.release_date?.split('-')[0]}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <button
                      onClick={() => navigate('movie', m.id)}
                      style={{ flex: 1, background: 'rgba(255,255,255,.08)', border: 'none', borderRadius: 4, padding: '4px 0', color: 'white', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}
                    >
                      View
                    </button>
                    <button
                      onClick={() => toggleWatchlist(m)}
                      style={{ background: inWL ? '#e50914' : 'rgba(255,255,255,.08)', border: 'none', borderRadius: 4, padding: '4px 8px', color: 'white', fontSize: 10, cursor: 'pointer' }}
                    >
                      {inWL ? '✓' : '+'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
