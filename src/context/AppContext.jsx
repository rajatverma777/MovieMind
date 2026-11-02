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
  // ── Authentication State with Resilient Persistent Session Cache ───────────
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('moviemind_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [authChecking, setAuthChecking] = useState(() => {
    try {
      // If user is already cached in localStorage, do not block the page with a loading spinner
      return !localStorage.getItem('moviemind_user')
    } catch {
      return true
    }
  })
  const [redirectAfterLogin, setRedirectAfterLogin] = useState('landing')

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false)
  const [accountSettingsModalOpen, setAccountSettingsModalOpen] = useState(false)

  // ── Navigation (Restores last visited page on refresh if logged in) ────────
  const [page, setPage] = useState(() => {
    try {
      const savedUser = localStorage.getItem('moviemind_user')
      if (!savedUser) return 'login'
      const savedPage = localStorage.getItem('moviemind_page')
      return savedPage && savedPage !== 'login' ? savedPage : 'landing'
    } catch {
      return 'login'
    }
  })
  const [previousPage, setPreviousPage] = useState(null)
  const [navHistory, setNavHistory] = useState([])
  const [movieId, setMovieId] = useState(null)
  const [activeChatFriend, setActiveChatFriend] = useState(null)
  const [viewingUser, setViewingUser] = useState(null)

  // Save current active page to localStorage
  useEffect(() => {
    if (page && page !== 'login') {
      try {
        localStorage.setItem('moviemind_page', page)
      } catch {}
    }
  }, [page])

  // ── API config ────────────────────────────────────────────────────────────
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_TMDB_API_KEY || 'DEMO')

  // ── User Watchlist (Loaded from and Persisted in MongoDB Atlas) ────────────
  const [watchlist, setWatchlist] = useState([])
  const [recentlyViewed, setRecent] = useState([])

  // ── Realtime Redis & SSE Hook ─────────────────────────────────────────────
  const realtime = useRealtime(user)

  // ── Check Current Session on Mount (Dual Cookie + Bearer Token) ───────────
  const checkSession = useCallback(async () => {
    try {
      const savedToken = localStorage.getItem('moviemind_session_token')
      const headers = {}
      if (savedToken) {
        headers['Authorization'] = `Bearer ${savedToken}`
      }

      const res = await fetch('/api/auth/me', {
        credentials: 'include',
        headers
      })

      if (res.ok) {
        const data = await res.json()
        if (data.authenticated && data.user) {
          setUser(data.user)
          try {
            localStorage.setItem('moviemind_user', JSON.stringify(data.user))
            if (data.token) {
              localStorage.setItem('moviemind_session_token', data.token)
            }
          } catch {}
          setPage(prev => (prev === 'login' ? 'landing' : prev))
          return data.user
        }
      }

      // Explicitly unauthenticated by server (e.g. 401 or 403)
      if (res.status === 401 || res.status === 403) {
        try {
          localStorage.removeItem('moviemind_session_token')
          localStorage.removeItem('moviemind_user')
        } catch {}
        setUser(null)
        setPage('login')
        return null
      }
    } catch (err) {
      console.warn('[Session validation network issue]:', err.message)
      // Keep offline/cached user session active on network glitch
      try {
        const cached = localStorage.getItem('moviemind_user')
        if (cached) {
          const parsed = JSON.parse(cached)
          setUser(parsed)
          return parsed
        }
      } catch {}
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
  const login = useCallback((userData, rememberMe = true, token = null) => {
    setUser(userData)
    try {
      localStorage.setItem('moviemind_user', JSON.stringify(userData))
      if (token) {
        localStorage.setItem('moviemind_session_token', token)
      }
    } catch {}
    setPage(prev => (prev === 'login' ? (redirectAfterLogin || 'landing') : prev))
    setRedirectAfterLogin('landing')
  }, [redirectAfterLogin])

  // ── Logout Handler ────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('moviemind_session_token')
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
    } catch {}
    try {
      localStorage.removeItem('moviemind_session_token')
      localStorage.removeItem('moviemind_user')
      localStorage.removeItem('moviemind_page')
    } catch {}
    setUser(null)
    setWatchlist([])
    setPage('login')
  }, [])

  // ── Protected Navigation ──────────────────────────────────────────────────
  const navigate = useCallback((targetPage, id = null) => {
    // If leaving messages/chat, guarantee body scroll lock is fully removed
    if (targetPage !== 'messages') {
      document.body.style.removeProperty('overflow')
      document.body.style.removeProperty('padding-bottom')
      document.body.style.overflow = ''
      document.body.style.paddingBottom = ''
    }

    // If not authenticated and attempting to visit private pages, redirect to login
    if (!user && targetPage !== 'login') {
      setRedirectAfterLogin(targetPage)
      setPage('login')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // If authenticated and visiting login, go to home
    if (user && targetPage === 'login') {
      setPage('landing')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setPage(current => {
      const isOpeningOtherProfile = targetPage === 'profile' && id !== null
      const fromLabel = (current === 'profile' && !viewingUser) ? 'own_profile' : current
      if (targetPage !== current || isOpeningOtherProfile) {
        setPreviousPage(fromLabel)
        setNavHistory(prev => [...prev.slice(-15), fromLabel])
      }
      return targetPage
    })

    if (targetPage === 'movie') {
      if (id !== null) setMovieId(id)
    } else if (targetPage === 'profile') {
      setViewingUser(id) // can be a user object, userId string, or null (self)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [user, viewingUser])

  // ── Smart Go Back (Remembers source: Search, Friends, Chat, Watchlist, Home) ──
  const goBack = useCallback((fallback = 'landing') => {
    setViewingUser(null)
    setNavHistory(prev => {
      const copy = [...prev]
      const last = copy.pop()
      const target = last || previousPage || fallback
      if (target !== 'messages') {
        document.body.style.removeProperty('overflow')
        document.body.style.removeProperty('padding-bottom')
        document.body.style.overflow = ''
        document.body.style.paddingBottom = ''
      }
      if (target === 'own_profile') {
        setPage('profile')
      } else {
        setPage(target)
      }
      setPreviousPage(copy[copy.length - 1] || null)
      return copy
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [previousPage])

  // ── Watchlist Management (Persisted in MongoDB Atlas per User) ─────────────
  const toggleWatchlist = useCallback(async (movie) => {
    if (!movie || !movie.id) return
    const userId = user?.id || user?._id
    if (!user || !userId) {
      setRedirectAfterLogin('watchlist')
      setPage('login')
      return
    }

    const movieId = Number(movie.id)
    const genre_ids = Array.isArray(movie.genre_ids) && movie.genre_ids.length > 0
      ? movie.genre_ids.map(Number).filter(Boolean)
      : (Array.isArray(movie.genres) ? movie.genres.map(g => (typeof g === 'object' ? Number(g.id) : Number(g))).filter(Boolean) : [])

    const normalizedMovie = {
      ...movie,
      id: movieId,
      genre_ids
    }

    const inWL = watchlist.some(m => Number(m.id) === movieId)
    if (inWL) {
      // Remove
      setWatchlist(prev => prev.filter(m => Number(m.id) !== movieId))
      try {
        await fetch('/api/social/watchlist/remove', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, movieId })
        })
      } catch (err) {
        console.warn('Watchlist remove error:', err)
      }
    } else {
      // Add
      setWatchlist(prev => [normalizedMovie, ...prev.filter(m => Number(m.id) !== movieId)])
      try {
        await fetch('/api/social/watchlist/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, movie: normalizedMovie })
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
    navigate, goBack, page, previousPage, movieId, setMovieId,
    authChecking, redirectAfterLogin,
    viewingUser, setViewingUser,
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
