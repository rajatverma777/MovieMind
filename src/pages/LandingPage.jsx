import { useState, useEffect, useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import { MOCK_MOVIES } from '@/data/constants'
import { getRecommendations } from '@/utils/recommend'
import HeroBanner from '@/components/HeroBanner'
import MovieRow   from '@/components/MovieRow'
import Footer     from '@/components/Footer'


export default function LandingPage() {
  const { tmdb, isDemo } = useApp()
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
      <div style={{ background: 'var(--bg)', paddingTop: 28 }}>
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
