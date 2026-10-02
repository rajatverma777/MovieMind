// src/context/AppContext.jsx
// Global state management: navigation, TMDB service, watchlist, and recently viewed

import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { createTMDBService } from '@/services/tmdb'

const Ctx = createContext(null)
export const useApp = () => {
  const c = useContext(Ctx)
  if (!c) throw new Error('useApp must be used inside <AppProvider>')
  return c
}

export function AppProvider({ children }) {
  // ── Navigation ────────────────────────────────────────────────────────
  const [page,    setPage]    = useState('landing')
  const [movieId, setMovieId] = useState(null)

  // ── API config ────────────────────────────────────────────────────────
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_TMDB_API_KEY || 'DEMO')

  // ── User data (persisted in localStorage) ─────────────────────────────
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem('moviemind_watchlist')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [recentlyViewed, setRecent] = useState(() => {
    try {
      const saved = localStorage.getItem('moviemind_recent')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // ── Navigate ──────────────────────────────────────────────────────────
  const navigate = useCallback((p, id = null) => {
    setPage(p)
    if (id !== null) setMovieId(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // ── Watchlist management ──────────────────────────────────────────────
  const toggleWatchlist = useCallback(movie => {
    setWatchlist(prev => {
      const next = prev.some(m => m.id === movie.id)
        ? prev.filter(m => m.id !== movie.id)
        : [...prev, movie]
      try {
        localStorage.setItem('moviemind_watchlist', JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

  const addToRecent = useCallback(movie => {
    setRecent(prev => {
      const next = [movie, ...prev.filter(m => m.id !== movie.id)].slice(0, 12)
      try {
        localStorage.setItem('moviemind_recent', JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

  // ── TMDB service ──────────────────────────────────────────────────────
  const isDemo = apiKey === 'DEMO'
  const tmdb   = useMemo(
    () => (apiKey && !isDemo ? createTMDBService(apiKey) : null),
    [apiKey, isDemo]
  )

  const value = {
    // navigation
    navigate, page, movieId,
    // tmdb
    tmdb, apiKey, setApiKey, isDemo,
    // data
    watchlist, toggleWatchlist,
    recentlyViewed, addToRecent,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
