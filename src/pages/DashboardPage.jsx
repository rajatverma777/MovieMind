import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useApp } from '@/context/AppContext'
import { MOCK_MOVIES, GN } from '@/data/constants'
import { getRecommendations } from '@/utils/recommend'
import MovieCard from '@/components/MovieCard'

const CHART_COLORS = ['#e50914', '#d4a843', '#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b']

const tooltipStyle = {
  contentStyle: { background: '#0e0e1c', border: '1px solid rgba(255,255,255,.09)', borderRadius: 8, color: 'white', fontSize: 11 },
  cursor: { fill: 'rgba(255,255,255,.02)' },
}

export default function DashboardPage() {
  const { user, watchlist, recentlyViewed, navigate } = useApp()

  const genreData = useMemo(() => {
    const c = {}
    watchlist.forEach(m => (m.genre_ids || []).forEach(id => { c[id] = (c[id] || 0) + 1 }))
    return Object.entries(c)
      .map(([id, count]) => ({ name: GN[id] || '?', count }))
      .sort((a, b) => b.count - a.count).slice(0, 6)
  }, [watchlist])

  const ratingData = useMemo(() => {
    const r = [
      { name: '9-10', v: 0 }, { name: '8-9', v: 0 }, { name: '7-8', v: 0 },
      { name: '6-7', v: 0 },  { name: '<6',  v: 0 },
    ]
    watchlist.forEach(m => {
      const x = m.vote_average || 0
      if (x >= 9) r[0].v++; else if (x >= 8) r[1].v++; else if (x >= 7) r[2].v++
      else if (x >= 6) r[3].v++; else r[4].v++
    })
    return r
  }, [watchlist])

  const avgRating = watchlist.length
    ? (watchlist.reduce((s, m) => s + (m.vote_average || 0), 0) / watchlist.length).toFixed(1)
    : '—'

  const aiRecs = useMemo(() => getRecommendations(watchlist, MOCK_MOVIES, 8), [watchlist])

  const stats = [
    { label: 'Watchlist',    value: watchlist.length,         icon: '🎬', color: '#e50914' },
    { label: 'Avg Rating',   value: avgRating,                icon: '⭐', color: '#d4a843' },
    { label: 'Top Genre',    value: genreData[0]?.name || '—', icon: '🎭', color: '#0ea5e9' },
    { label: 'Recently Seen',value: recentlyViewed.length,    icon: '👁️', color: '#8b5cf6' },
  ]

  return (
    <div style={{ minHeight: '100vh', padding: '88px 24px 56px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div className="fu" style={{ marginBottom: 34 }}>
        <h1 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 50, letterSpacing: 1, color: 'white', marginBottom: 5 }}>
          Your <span style={{ color: '#e50914' }}>Dashboard</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,.38)', fontSize: 13 }}>
          Welcome back, {user?.name || 'Cinephile'} · AI-Powered Insights
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(185px,1fr))', gap: 13, marginBottom: 32 }}>
        {stats.map((s, i) => (
          <div key={s.label} className={`glass ch fu d${i + 1}`} style={{ borderRadius: 15, padding: 22 }}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 34, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
            <div style={{ color: 'rgba(255,255,255,.38)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.6px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts — only show with 2+ movies */}
      {watchlist.length > 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 32 }}>
          {/* Genre distribution */}
          <div className="glass ch fu d2" style={{ borderRadius: 15, padding: 22 }}>
            <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 20, color: 'white', marginBottom: 18 }}>Genre Distribution</h3>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={genreData} margin={{ top: 0, right: 0, bottom: 0, left: -22 }}>
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,.3)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {genreData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Rating spread */}
          <div className="glass ch fu d3" style={{ borderRadius: 15, padding: 22 }}>
            <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 20, color: 'white', marginBottom: 18 }}>Rating Spread</h3>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={ratingData} margin={{ top: 0, right: 0, bottom: 0, left: -22 }}>
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,.3)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="v" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {aiRecs.length > 0 && (
        <div className="fu d4" style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg,rgba(229,9,20,.22),rgba(139,92,246,.22))', border: '1px solid rgba(229,9,20,.26)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>🤖</div>
            <div>
              <h2 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 24, color: 'white' }}>AI Recommendations</h2>
              <p style={{ color: 'rgba(255,255,255,.32)', fontSize: 10 }}>Cosine similarity vector matching</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(145px,1fr))', gap: 15 }}>
            {aiRecs.map(m => (
              <div key={m.id}>
                <MovieCard movie={m} size="sm" />
                <div style={{ marginTop: 7, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,.07)', borderRadius: 1, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${m._score * 100}%`, background: 'linear-gradient(90deg,#e50914,#d4a843)', transition: 'width .8s' }} />
                  </div>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', whiteSpace: 'nowrap' }}>{(m._score * 100).toFixed(0)}% match</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <div className="fu d5">
          <h2 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 24, color: 'white', marginBottom: 15 }}>Recently Viewed</h2>
          <div style={{ display: 'flex', gap: 11, overflowX: 'auto', paddingBottom: 8 }}>
            {recentlyViewed.map(m => <MovieCard key={m.id} movie={m} size="sm" />)}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!watchlist.length && !recentlyViewed.length && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 56, marginBottom: 14 }}>🎬</div>
          <h2 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 32, color: 'white', marginBottom: 9 }}>Start Your Cinematic Journey</h2>
          <p style={{ color: 'rgba(255,255,255,.38)', marginBottom: 22, fontSize: 13 }}>Add movies to your watchlist to see personalized AI insights here</p>
          <button className="btn-r" onClick={() => navigate('landing')} style={{ border: 'none', padding: '12px 28px', borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans',sans-serif", fontWeight: 700 }}>
            Discover Movies
          </button>
        </div>
      )}
    </div>
  )
}
