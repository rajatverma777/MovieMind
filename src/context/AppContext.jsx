// src/context/AppContext.jsx — Central Application State with Better Auth & MongoDB Watchlist
import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { createTMDBService } from '@/services/tmdb'
import { useRealtime } from '@/hooks/useRealtime'

const Ctx = createContext(null)
export const useApp = () => {
  const c = useContext(Ctx)
  if (!c) throw new Error('useApp must be used inside <AppProvider>')
  return c
}

export function AppProvider({ children }) {
  // ── Authentication State ──────────────────────────────────────────────────
  const [user, setUser] = useState(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [redirectAfterLogin, setRedirectAfterLogin] = useState('dashboard')

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false)
  const [accountSettingsModalOpen, setAccountSettingsModalOpen] = useState(false)

  // ── Navigation (Login-First Flow) ─────────────────────────────────────────
  const [page, setPage] = useState('login')
  const [movieId, setMovieId] = useState(null)
  const [activeChatFriend, setActiveChatFriend] = useState(null)

  // ── API config ────────────────────────────────────────────────────────────
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_TMDB_API_KEY || 'DEMO')

  // ── User Watchlist (Loaded from and Persisted in MongoDB Atlas) ────────────
  const [watchlist, setWatchlist] = useState([])
  const [recentlyViewed, setRecent] = useState([])

  // ── Realtime Redis & SSE Hook ─────────────────────────────────────────────
  const realtime = useRealtime(user)

  // ── Check Current Session on Mount ────────────────────────────────────────
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        if (data.authenticated && data.user) {
          setUser(data.user)
          setPage(prev => (prev === 'login' ? 'dashboard' : prev))
          return data.user
        }
      }
      setUser(null)
      setPage('login')
      return null
    } catch {
      setUser(null)
      setPage('login')
      return null
    } finally {
      setAuthChecking(false)
    }
  }, [])

  useEffect(() => {
    checkSession()
  }, [checkSession])

  // ── Load User Watchlist from MongoDB Atlas when Authenticated ─────────────
  useEffect(() => {
    if (!user || !user.id) {
      setWatchlist([])
      return
    }
    const loadWatchlist = async () => {
      try {
        const res = await fetch(`/api/social/watchlist?userId=${encodeURIComponent(user.id)}`)
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.watchlist)) {
            setWatchlist(data.watchlist)
          }
        }
      } catch (err) {
        console.warn('Failed to fetch watchlist from MongoDB:', err.message)
      }
    }
    loadWatchlist()
  }, [user])

  // ── Login Handler ─────────────────────────────────────────────────────────
  const login = useCallback((userData, rememberMe = true) => {
    setUser(userData)
    setPage(prev => (prev === 'login' ? (redirectAfterLogin || 'dashboard') : prev))
    setRedirectAfterLogin('dashboard')
  }, [redirectAfterLogin])

  // ── Logout Handler ────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {}
    setUser(null)
    setWatchlist([])
    setPage('login')
  }, [])

  // ── Protected Navigation ──────────────────────────────────────────────────
  const navigate = useCallback((targetPage, id = null) => {
    // If not authenticated and attempting to visit private pages, redirect to login
    if (!user && targetPage !== 'login') {
      setRedirectAfterLogin(targetPage)
      setPage('login')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // If authenticated and visiting login, go to dashboard
    if (user && targetPage === 'login') {
      setPage('dashboard')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setPage(targetPage)
    if (id !== null) setMovieId(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [user])

  // ── Watchlist Management (Persisted in MongoDB Atlas per User) ─────────────
  const toggleWatchlist = useCallback(async (movie) => {
    if (!movie || !movie.id) return
    if (!user || !user.id) {
      setRedirectAfterLogin('watchlist')
      setPage('login')
      return
    }

    const inWL = watchlist.some(m => m.id === movie.id)
    if (inWL) {
      // Remove
      setWatchlist(prev => prev.filter(m => m.id !== movie.id))
      try {
        await fetch('/api/social/watchlist/remove', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, movieId: movie.id })
        })
      } catch (err) {
        console.warn('Watchlist remove error:', err)
      }
    } else {
      // Add
      setWatchlist(prev => [movie, ...prev.filter(m => m.id !== movie.id)])
      try {
        await fetch('/api/social/watchlist/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, movie })
        })
      } catch (err) {
        console.warn('Watchlist add error:', err)
      }
    }
  }, [user, watchlist])

  const addToRecent = useCallback(movie => {
    setRecent(prev => [movie, ...prev.filter(m => m.id !== movie.id)].slice(0, 12))
  }, [])

  // ── Notification Alerts (Polling + Realtime) ──────────────────────────────
  const [alerts, setAlerts] = useState({ unreadMessages: 0, pendingRequests: 0, totalAlerts: 0 })

  const fetchAlerts = useCallback(async () => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/social/unread?me=${encodeURIComponent(user.id)}`).then(r => r.json())
      if (res && typeof res.totalAlerts === 'number') {
        setAlerts(res)
      }
    } catch {}
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return
    fetchAlerts()
    const timer = setInterval(fetchAlerts, 6000)
    return () => clearInterval(timer)
  }, [user?.id, fetchAlerts])

  // ── TMDB Service ──────────────────────────────────────────────────────────
  const isDemo = apiKey === 'DEMO'
  const tmdb = useMemo(
    () => (apiKey && !isDemo ? createTMDBService(apiKey) : null),
    [apiKey, isDemo]
  )

  const value = {
    // navigation
    navigate, page, movieId, setMovieId,
    authChecking, redirectAfterLogin,
    // tmdb
    tmdb, apiKey, setApiKey, isDemo,
    // data
    watchlist, toggleWatchlist,
    recentlyViewed, addToRecent,
    // social & auth
    user, setUser, login, logout, checkSession,
    authModalOpen, setAuthModalOpen,
    profileModalOpen, setProfileModalOpen,
    editProfileModalOpen, setEditProfileModalOpen,
    accountSettingsModalOpen, setAccountSettingsModalOpen,
    activeChatFriend, setActiveChatFriend,
    alerts, fetchAlerts,
    // Realtime Upstash Redis & SSE
    realtime
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
