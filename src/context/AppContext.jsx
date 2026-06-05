// src/context/AppContext.jsx
// Full auth system: login, logout, signup, user avatar, persist across refresh

import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { createTMDBService } from '@/services/tmdb'

const Ctx = createContext(null)
export const useApp = () => {
  const c = useContext(Ctx)
  if (!c) throw new Error('useApp must be used inside <AppProvider>')
  return c
}

// ── Fake user "database" stored in localStorage / memory ──────────────────
const REGISTERED_USERS = (() => {
  try {
    const saved = localStorage.getItem('moviemind_users')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
})()

export function AppProvider({ children }) {
  // ── Navigation ────────────────────────────────────────────────────────
  const [page,    setPage]    = useState('landing')
  const [movieId, setMovieId] = useState(null)

  // ── Auth ──────────────────────────────────────────────────────────────
  const [user,    setUser]    = useState(() => {
    try {
      const saved = localStorage.getItem('moviemind_current_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [authErr, setAuthErr] = useState('')

  // ── API config ────────────────────────────────────────────────────────
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_TMDB_API_KEY || '')

  // ── User data ─────────────────────────────────────────────────────────
  const [watchlist,      setWatchlist]  = useState(() => {
    try {
      const savedUser = localStorage.getItem('moviemind_current_user')
      if (savedUser) {
        const parsed = JSON.parse(savedUser)
        const wl = localStorage.getItem(`moviemind_watchlist_${parsed.email}`)
        return wl ? JSON.parse(wl) : []
      }
    } catch {}
    return []
  })
  const [recentlyViewed, setRecent]     = useState(() => {
    try {
      const savedUser = localStorage.getItem('moviemind_current_user')
      if (savedUser) {
        const parsed = JSON.parse(savedUser)
        const r = localStorage.getItem(`moviemind_recent_${parsed.email}`)
        return r ? JSON.parse(r) : []
      }
    } catch {}
    return []
  })

  // Helper to load user-specific watchlist and recents
  const loadUserData = useCallback((email) => {
    try {
      const wl = localStorage.getItem(`moviemind_watchlist_${email}`)
      setWatchlist(wl ? JSON.parse(wl) : [])
    } catch {
      setWatchlist([])
    }
    try {
      const r = localStorage.getItem(`moviemind_recent_${email}`)
      setRecent(r ? JSON.parse(r) : [])
    } catch {
      setRecent([])
    }
  }, [])

  // ── Navigate ──────────────────────────────────────────────────────────
  const navigate = useCallback((p, id = null) => {
    setPage(p)
    if (id !== null) setMovieId(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // ── Sign up ───────────────────────────────────────────────────────────
  const signUp = useCallback(async ({ name, email, password }) => {
    setAuthErr('')
    await new Promise(r => setTimeout(r, 900)) // simulate network

    const exists = REGISTERED_USERS.find(u => u.email === email)
    if (exists) { setAuthErr('An account with this email already exists.'); return false }

    const newUser = { name, email, password, avatar: name[0].toUpperCase() }
    REGISTERED_USERS.push(newUser)
    try {
      localStorage.setItem('moviemind_users', JSON.stringify(REGISTERED_USERS))
    } catch (e) {
      console.error(e)
    }
    setUser({ name, email, avatar: newUser.avatar })
    localStorage.setItem('moviemind_current_user', JSON.stringify({ name, email, avatar: newUser.avatar }))
    loadUserData(email)
    return true
  }, [loadUserData])

  // ── Sign in ───────────────────────────────────────────────────────────
  const signIn = useCallback(async ({ email, password }) => {
    setAuthErr('')
    await new Promise(r => setTimeout(r, 900))

    // Demo account — always works
    if (email === 'demo@moviemind.ai' && password === 'demo123') {
      const demoUser = { name: 'Demo User', email, avatar: 'D' }
      setUser(demoUser)
      localStorage.setItem('moviemind_current_user', JSON.stringify(demoUser))
      loadUserData(email)
      return true
    }

    const found = REGISTERED_USERS.find(u => u.email === email && u.password === password)
    if (!found) { setAuthErr('Incorrect email or password.'); return false }

    const loggedInUser = { name: found.name, email: found.email, avatar: found.avatar }
    setUser(loggedInUser)
    localStorage.setItem('moviemind_current_user', JSON.stringify(loggedInUser))
    loadUserData(found.email)
    return true
  }, [loadUserData])

  // ── Sign out ──────────────────────────────────────────────────────────
  const signOut = useCallback(() => {
    setUser(null)
    localStorage.removeItem('moviemind_current_user')
    setWatchlist([])
    setRecent([])
    navigate('landing')
  }, [navigate])

  // ── Watchlist ─────────────────────────────────────────────────────────
  const toggleWatchlist = useCallback(movie =>
    setWatchlist(prev => {
      const next = prev.some(m => m.id === movie.id)
        ? prev.filter(m => m.id !== movie.id)
        : [...prev, movie]
      try {
        const savedUser = localStorage.getItem('moviemind_current_user')
        if (savedUser) {
          const parsed = JSON.parse(savedUser)
          localStorage.setItem(`moviemind_watchlist_${parsed.email}`, JSON.stringify(next))
        }
      } catch {}
      return next
    }), [])

  const addToRecent = useCallback(movie =>
    setRecent(prev => {
      const next = [movie, ...prev.filter(m => m.id !== movie.id)].slice(0, 12)
      try {
        const savedUser = localStorage.getItem('moviemind_current_user')
        if (savedUser) {
          const parsed = JSON.parse(savedUser)
          localStorage.setItem(`moviemind_recent_${parsed.email}`, JSON.stringify(next))
        }
      } catch {}
      return next
    }), [])

  // ── TMDB service ──────────────────────────────────────────────────────
  const isDemo = apiKey === 'DEMO'
  const tmdb   = useMemo(
    () => (apiKey && !isDemo ? createTMDBService(apiKey) : null),
    [apiKey, isDemo]
  )

  const value = {
    // navigation
    navigate, page, movieId,
    // auth
    user, authErr, setAuthErr, signIn, signUp, signOut,
    // tmdb
    tmdb, apiKey, setApiKey, isDemo,
    // data
    watchlist, toggleWatchlist,
    recentlyViewed, addToRecent,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
