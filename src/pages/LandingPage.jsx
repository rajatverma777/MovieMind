import { useState, useEffect, useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import { MOCK_MOVIES } from '@/data/constants'
import { getRecommendations } from '@/utils/recommend'
import HeroBanner from '@/components/HeroBanner'
import MovieRow   from '@/components/MovieRow'
import Footer     from '@/components/Footer'


export default function LandingPage() {
  const { tmdb, isDemo, user, navigate } = useApp()
  const [secs, setSecs] = useState({ tr: [], po: [], tp: [], nw: [] })
  const [ld,   setLd]   = useState({ tr: true, po: true, tp: true, nw: true })

  useEffect(() => {
    const go = async (k, fn) => {
      try {
        if (isDemo) setSecs(s => ({ ...s, [k]: [...MOCK_MOVIES].sort(() => Math.random() - .5) }))
        else if (tmdb) { const d = await fn(); setSecs(s => ({ ...s, [k]: d.results || [] })) }
      } catch { setSecs(s => ({ ...s, [k]: MOCK_MOVIES })) }
      finally  { setLd(l => ({ ...l, [k]: false })) }
    }
    if (tmdb || isDemo) {
      go('tr', () => tmdb.trending())
      go('po', () => tmdb.popular())
      go('tp', () => tmdb.topRated())
      go('nw', () => tmdb.nowPlay())
    }
  }, [tmdb, isDemo])

  const hero = secs.tr.length ? secs.tr : MOCK_MOVIES

  return (
    <div>
      <HeroBanner movies={hero} loading={ld.tr} />
      <div style={{ background: 'var(--bg)', paddingTop: 24 }}>
        {/* ── CineMind Social & Login Callout ── */}
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px 22px' }}>
          <div
            className="glass"
            style={{
              padding: '16px 22px', borderRadius: 16,
              background: 'linear-gradient(90deg, rgba(229,9,20,.12) 0%, rgba(139,92,246,.08) 100%)',
              border: '1px solid rgba(229,9,20,.28)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 14
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(229,9,20,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 0 16px rgba(229,9,20,.3)' }}>
                {user ? user.avatar || '🎬' : '🔑'}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {user ? (
                    <>
                      <span>Welcome back, {user.displayName}!</span>
                      <span style={{ fontSize: 11, background: '#e50914', color: 'white', padding: '1px 8px', borderRadius: 12 }}>@{user.username}</span>
                    </>
                  ) : (
                    <span>CineMind Social Cine-Hub — Unique CineID Authentication</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>
                  {user
                    ? 'Search friends by CineID, send friend requests, 1-on-1 real-time movie chat, and launch Couch Consensus!'
                    : 'Create your unique username / CineID to connect with friends, send movie recommendations in live chat, and sync watchlists!'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              {user ? (
                <>
                  <button
                    onClick={() => navigate('friends')}
                    style={{ background: '#e50914', border: 'none', borderRadius: 8, padding: '8px 16px', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 0 14px rgba(229,9,20,.4)' }}
                  >
                    <span>💬</span> Open Friends & Chat
                  </button>
                  <button
                    onClick={() => navigate('login')}
                    style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 8, padding: '8px 14px', color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
                  >
                    👤 My Profile
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('login')}
                    style={{ background: '#e50914', border: 'none', borderRadius: 8, padding: '9px 18px', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 0 16px rgba(229,9,20,.4)' }}
                  >
                    <span>🔑</span> Login / Create CineID
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        {/* ── Flagship AI Capabilities Hub ── */}
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>⚡</span>
              <h2 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 24, color: 'white', letterSpacing: '.5px' }}>
                Flagship <span style={{ color: '#e50914' }}>AI Capabilities</span>
              </h2>
            </div>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.6px' }}>
              Advanced Engineering & Research Features
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 12 }}>
            {/* 1. Couch Consensus */}
            <div
              onClick={() => navigate('consensus')}
              className="ch glass"
              style={{ padding: '16px 18px', borderRadius: 12, cursor: 'pointer', transition: 'all .25s' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 20 }}>🛋️</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: 'white' }}>Couch Consensus</span>
              </div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', lineHeight: 1.4, margin: 0 }}>
                Pareto-optimal dual taste fusion for couples & friends. End movie decision fatigue.
              </p>
            </div>

            {/* 2. CineGraph */}
            <div
              onClick={() => navigate('cinegraph')}
              className="ch glass"
              style={{ padding: '16px 18px', borderRadius: 12, cursor: 'pointer', transition: 'all .25s' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 20 }}>🕸️</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#a78bfa' }}>CineGraph 3D</span>
              </div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', lineHeight: 1.4, margin: 0 }}>
                Interactive 60fps cinematic knowledge graph and Six Degrees of Cinema pathfinder.
              </p>
            </div>

            {/* 3. Vague Memory Search */}
            <div
              onClick={() => navigate('search')}
              className="ch glass"
              style={{ padding: '16px 18px', borderRadius: 12, cursor: 'pointer', transition: 'all .25s' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 20 }}>🧠</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#0ea5e9' }}>Vague Memory Search</span>
              </div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', lineHeight: 1.4, margin: 0 }}>
                Natural language plot & trope reverse-lookup: "that movie where a guy is trapped in a phone booth".
              </p>
            </div>

            {/* 4. AI Script Studio */}
            <div
              onClick={() => navigate('scriptstudio')}
              className="ch glass"
              style={{ padding: '16px 18px', borderRadius: 12, cursor: 'pointer', transition: 'all .25s' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 20 }}>🎬</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#d4a843' }}>AI Script Studio</span>
              </div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', lineHeight: 1.4, margin: 0 }}>
                Cinema mashup generator synthesizing Hollywood loglines, dream casts, and screenplay excerpts.
              </p>
            </div>

            {/* 5. Taste Equalizer */}
            <div
              onClick={() => navigate('dashboard')}
              className="ch glass"
              style={{ padding: '16px 18px', borderRadius: 12, cursor: 'pointer', transition: 'all .25s' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 20 }}>🎛️</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#0ea5e9' }}>Taste Equalizer</span>
              </div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', lineHeight: 1.4, margin: 0 }}>
                Multi-dimensional console with real-time sliders for pacing, darkness, and radar calibration.
              </p>
            </div>

            {/* 6. OTT Arbitrage Optimizer */}
            <div
              onClick={() => navigate('watchlist')}
              className="ch glass"
              style={{ padding: '16px 18px', borderRadius: 12, cursor: 'pointer', transition: 'all .25s' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 20 }}>💰</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#10b981' }}>OTT Arbitrage (SDG 12)</span>
              </div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', lineHeight: 1.4, margin: 0 }}>
                Greedy set-cover algorithm calculating optimal streaming subscription rotation plans.
              </p>
            </div>

            {/* 7. Cine-Friends & In-Chat Movie Recommendations */}
            <div
              onClick={() => navigate('friends')}
              className="ch glass"
              style={{ padding: '16px 18px', borderRadius: 12, cursor: 'pointer', transition: 'all .25s', border: '1px solid rgba(229,9,20,.35)', background: 'rgba(229,9,20,.05)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 20 }}>💬</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#ff4444' }}>Cine-Friends & Movie Chat</span>
              </div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', lineHeight: 1.4, margin: 0 }}>
                Search friends by unique CineID, send requests, 1-on-1 chat, and drop interactive movie recommendation cards!
              </p>
            </div>
          </div>
        </div>

        <MovieRow title="🔥 Trending This Week"  movies={secs.tr.length ? secs.tr : MOCK_MOVIES} loading={ld.tr} />
        <MovieRow title="🎬 Now Playing"          movies={secs.nw.length ? secs.nw : MOCK_MOVIES} loading={ld.nw} />
        <MovieRow title="⭐ Popular Movies"        movies={secs.po.length ? secs.po : MOCK_MOVIES} loading={ld.po} />
        <MovieRow title="🏆 Top Rated All Time"   movies={secs.tp.length ? secs.tp : MOCK_MOVIES} loading={ld.tp} size="lg" />
        <AIRecommendationRow />
        <Footer />
      </div>
    </div>
  )
}

// Standalone AI row component (avoids circular import)
function AIRecommendationRow() {
  const { watchlist, navigate } = useApp()
  const recs = useMemo(() => getRecommendations(watchlist, MOCK_MOVIES, 9), [watchlist])

  if (!watchlist.length) return (
    <div style={{ padding: '28px 24px' }}>
      <div style={{ background: 'rgba(229,9,20,.05)', border: '1px solid rgba(229,9,20,.14)', borderRadius: 16, padding: '38px', maxWidth: 460, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 11 }}>🤖</div>
        <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 24, color: 'white', marginBottom: 7 }}>AI Recommendations</h3>
        <p style={{ color: 'rgba(255,255,255,.42)', fontSize: 13, lineHeight: 1.6 }}>Add movies to your watchlist to unlock cosine-similarity AI recommendations.</p>
      </div>
    </div>
  )

  return (
    <div style={{ paddingBottom: 28 }}>
      <div style={{ padding: '0 24px 12px', display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,rgba(229,9,20,.22),rgba(139,92,246,.22))', border: '1px solid rgba(229,9,20,.26)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 24, color: 'white' }}>AI-Curated For You</h2>
          <p style={{ color: 'rgba(255,255,255,.32)', fontSize: 10 }}>Powered by cosine similarity vector matching</p>
        </div>
      </div>
      <div className="sx" style={{ paddingLeft: 24, paddingRight: 24 }}>
        {recs.map(m => (
          <div key={m.id} style={{ position: 'relative' }}>
            <div className="mc" style={{ width: 160, position: 'relative', borderRadius: 10, overflow: 'hidden', flexShrink: 0 }} onClick={() => navigate('movie', m.id)}>
              <div style={{ width: 160, height: 240, background: '#13131f', overflow: 'hidden', border: '1px solid rgba(255,255,255,.05)' }}>
                <img src={`https://image.tmdb.org/t/p/w342${m.poster_path}`} alt={m.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => e.target.src = `https://placehold.co/160x240/13131f/444?text=${encodeURIComponent(m.title)}`} />
              </div>
              {m.vote_average > 0 && <div style={{ position: 'absolute', top: 7, right: 7, background: 'rgba(0,0,0,.76)', backdropFilter: 'blur(4px)', borderRadius: 5, padding: '2px 6px', fontSize: 10, fontWeight: 700, color: '#d4a843', border: '1px solid rgba(212,168,67,.24)' }}>⭐{m.vote_average?.toFixed(1)}</div>}
            </div>
            {m._score > 0 && <div style={{ height: 2, background: `linear-gradient(90deg,#e50914 ${m._score * 100}%,rgba(255,255,255,.05) 0)`, margin: '5px 4px 0', borderRadius: 1 }} />}
          </div>
        ))}
      </div>
    </div>
  )
}
