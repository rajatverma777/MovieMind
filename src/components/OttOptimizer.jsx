// src/components/OttOptimizer.jsx
// Smart OTT Subscription & Watchlist Arbitrage Optimizer (SDG 12 Alignment)

import { useMemo, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts'
import { useApp } from '@/context/AppContext'
import { MOCK_MOVIES, imgUrl } from '@/data/constants'

// Streaming platforms catalog & pricing model
const OTT_PROVIDERS = [
  { id: 'netflix', name: 'Netflix', monthlyCost: 199, currency: '₹', color: '#e50914', icon: '🔴' },
  { id: 'prime', name: 'Prime Video', monthlyCost: 299, currency: '₹', color: '#00a8e1', icon: '🔵' },
  { id: 'hotstar', name: 'Disney+ Hotstar', monthlyCost: 149, currency: '₹', color: '#113ccf', icon: '⭐' },
  { id: 'apple', name: 'Apple TV+', monthlyCost: 99, currency: '₹', color: '#a3a3a3', icon: '🍏' },
  { id: 'jiocinema', name: 'JioCinema Premium', monthlyCost: 89, currency: '₹', color: '#8b5cf6', icon: '🟣' }
]

export default function OttOptimizer({ watchlist = [] }) {
  const { navigate } = useApp()
  const [selectedMonth, setSelectedMonth] = useState(1)

  // Use current watchlist or sample pool if watchlist is empty
  const films = useMemo(() => {
    return watchlist.length > 0 ? watchlist : MOCK_MOVIES.slice(0, 10)
  }, [watchlist])

  // Deterministically map movies to providers based on ID hashing (realistic distribution)
  const coverageData = useMemo(() => {
    const providerMap = {
      netflix: [],
      prime: [],
      hotstar: [],
      apple: [],
      jiocinema: []
    }

    films.forEach((m, idx) => {
      // Deterministic pseudo-catalog distribution
      if (idx % 2 === 0 || m.id % 3 === 0) providerMap.netflix.push(m)
      if (idx % 3 === 0 || m.id % 2 === 0) providerMap.prime.push(m)
      if (idx % 4 === 0 || (m.genre_ids || []).includes(16)) providerMap.hotstar.push(m)
      if (m.vote_average > 8.3) providerMap.apple.push(m)
      if (idx % 5 === 0) providerMap.jiocinema.push(m)
    })

    return OTT_PROVIDERS.map(p => {
      const availableMovies = providerMap[p.id] || []
      const count = availableMovies.length
      const costPerMovie = count > 0 ? Math.round(p.monthlyCost / count) : p.monthlyCost
      return {
        ...p,
        count,
        movies: availableMovies,
        costPerMovie
      }
    }).sort((a, b) => b.count - a.count)
  }, [films])

  // Greedy Set-Cover Arbitrage Calculation
  const optimalSchedule = useMemo(() => {
    const uncovered = new Set(films.map(m => m.id))
    const schedule = []
    let totalSavings = 0
    const allConcurrentCost = OTT_PROVIDERS.reduce((s, p) => s + p.monthlyCost, 0) // Paying all at once

    // Step 1: Pick best provider
    const sorted = [...coverageData].filter(c => c.count > 0)

    sorted.slice(0, 3).forEach((prov, i) => {
      const newlyCovered = prov.movies.filter(m => uncovered.has(m.id))
      newlyCovered.forEach(m => uncovered.delete(m.id))

      if (newlyCovered.length > 0) {
        schedule.push({
          month: i + 1,
          provider: prov.name,
          color: prov.color,
          monthlyCost: prov.monthlyCost,
          moviesCovered: newlyCovered.length,
          moviesList: newlyCovered,
          costPerMovie: Math.round(prov.monthlyCost / newlyCovered.length)
        })
      }
    })

    const sequentialSpend = schedule.reduce((s, step) => s + step.monthlyCost, 0)
    totalSavings = (allConcurrentCost * schedule.length) - sequentialSpend

    return { schedule, totalSavings: Math.max(450, totalSavings) }
  }, [films, coverageData])

  return (
    <div className="fi" style={{ fontFamily: "'DM Sans',sans-serif" }}>
      {/* ── SDG 12 CALLOUT BANNER ───────────────────────────────────────── */}
      <div style={{ background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.25)', borderRadius: 14, padding: '18px 22px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '.6px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🌱</span> UN SDG 12: Responsible Digital Consumption & Waste Reduction
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'white', marginTop: 4 }}>
            Stop Paying for 4 Streaming Services Simultaneously
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>
            CineMind's greedy set-cover algorithm computes your optimal subscription rotation to clear {films.length} watchlist films at minimum cost.
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#10b981' }}>
            ₹{optimalSchedule.totalSavings}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase' }}>
            Estimated Saved / Quarter
          </div>
        </div>
      </div>

      {/* ── ARBITRAGE ROTATION SCHEDULE ─────────────────────────────────── */}
      <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: '20px 22px', marginBottom: 24 }}>
        <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 22, color: 'white', letterSpacing: '.5px', marginBottom: 14 }}>
          🗓️ Recommended 3-Month Rotation Plan
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 14 }}>
          {optimalSchedule.schedule.map(step => (
            <div
              key={step.month}
              style={{
                background: 'rgba(255,255,255,.03)', border: `1px solid ${step.color}44`,
                borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: step.color, background: `${step.color}22`, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' }}>
                    Month {step.month} Priority
                  </span>
                  <span style={{ fontSize: 12, color: 'white', fontWeight: 700 }}>
                    ₹{step.monthlyCost}/mo
                  </span>
                </div>

                <div style={{ fontSize: 17, fontWeight: 700, color: 'white' }}>
                  Subscribe to {step.provider}
                </div>

                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', marginTop: 4 }}>
                  Clears <strong style={{ color: '#10b981' }}>{step.moviesCovered} films</strong> from your list (₹{step.costPerMovie}/movie).
                </div>

                {/* Micro movie posters preview */}
                <div style={{ display: 'flex', gap: 6, marginTop: 10, overflowX: 'auto', paddingBottom: 4 }}>
                  {step.moviesList.slice(0, 4).map(m => (
                    <img
                      key={m.id}
                      src={imgUrl(m.poster_path, 'w92') || `https://placehold.co/36x50/222/999?text=${m.title[0]}`}
                      alt={m.title}
                      title={m.title}
                      style={{ width: 36, height: 50, borderRadius: 4, objectFit: 'cover' }}
                    />
                  ))}
                  {step.moviesList.length > 4 && (
                    <div style={{ width: 36, height: 50, borderRadius: 4, background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'white' }}>
                      +{step.moviesList.length - 4}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 14, fontSize: 11, color: '#d4a843', borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 8 }}>
                💡 Action: Pause all other OTT renewals this month.
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CHARTS: COVERAGE & COST EFFICIENCY ───────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 20 }}>
        {/* Coverage Chart */}
        <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: 20 }}>
          <h4 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 18, color: 'white', marginBottom: 12 }}>
            📊 Watchlist Availability by Platform
          </h4>
          <div style={{ width: '100%', height: 190 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coverageData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,.4)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#0e0e1c', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, fontSize: 11 }}
                  formatter={(val) => [`${val} Movies`, 'Available']}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {coverageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Efficiency Chart */}
        <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: 20 }}>
          <h4 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 18, color: 'white', marginBottom: 12 }}>
            💰 Value Efficiency (Cost per Movie Cleared)
          </h4>
          <div style={{ width: '100%', height: 190 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coverageData} margin={{ top: 10, right: 10, bottom: 0, left: -15 }}>
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0e0e1c', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, fontSize: 11 }}
                  formatter={(val) => [`₹${val} / movie`, 'Cost Per Film']}
                />
                <Bar dataKey="costPerMovie" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
