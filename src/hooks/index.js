import { useState, useEffect, useCallback, useRef } from 'react'
import { useApp } from '@/context/AppContext'
import { MOCK_MOVIES } from '@/data/constants'

export function useScrolled(threshold = 40) {
  const [scrolled, set] = useState(false)
  useEffect(() => {
    const h = () => set(window.scrollY > threshold)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [threshold])
  return scrolled
}

// Apple-style hide-on-scroll with speed dynamics: returns { visible, scrolled }
// Responds to scroll events, wheel velocity, and touch gestures
export function useHideOnScroll(threshold = 6) {
  const [visible, setVisible] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const lastY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(() => {
        const currentY = window.scrollY
        const diff = currentY - lastY.current

        setScrolled(currentY > 25)

        if (currentY <= 35) {
          // Always show near top of page
          setVisible(true)
        } else if (diff > threshold) {
          // Scrolling DOWN with speed — hide both bars
          setVisible(false)
        } else if (diff < -threshold) {
          // Scrolling UP with speed — show both bars
          setVisible(true)
        }

        lastY.current = currentY
        ticking.current = false
      })
    }

    // Wheel event listener for instant responsiveness on Mac trackpad / mouse
    const handleWheel = (e) => {
      if (window.scrollY <= 35 && e.deltaY < 0) {
        setVisible(true)
        return
      }
      if (e.deltaY > 18) {
        // Fast scroll down
        setVisible(false)
      } else if (e.deltaY < -18) {
        // Fast scroll up
        setVisible(true)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('wheel', handleWheel)
    }
  }, [threshold])

  return { visible, scrolled }
}

export function useDebounce(value, delay = 400) {
  const [deb, setDeb] = useState(value)
  useEffect(() => { const id = setTimeout(() => setDeb(value), delay); return () => clearTimeout(id) }, [value, delay])
  return deb
}

export function useKeyDown(key, cb) {
  useEffect(() => {
    const h = e => { if (e.key === key) cb(e) }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [key, cb])
}

export function useOutsideClick(ref, cb) {
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) cb(e) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [ref, cb])
}

export function useTMDBFetch(fetcher, deps = []) {
  const { tmdb, isDemo } = useApp()
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  useEffect(() => {
    setLoading(true); setError(null)
    if (isDemo) { setData([...MOCK_MOVIES].sort(() => Math.random() - .5)); setLoading(false); return }
    if (!tmdb)  { setLoading(false); return }
    fetcher(tmdb)
      .then(r => setData(r.results || r || []))
      .catch(e => { setError(e); setData(MOCK_MOVIES) })
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tmdb, isDemo, ...deps])
  return { data, loading, error }
}

export function useMovieSearch() {
  const { tmdb, isDemo } = useApp()
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const deb = useDebounce(query, 450)
  useEffect(() => {
    if (!deb.trim()) { setResults([]); return }
    setLoading(true)
    if (isDemo) {
      setResults(MOCK_MOVIES.filter(m => m.title.toLowerCase().includes(deb.toLowerCase())))
      setLoading(false); return
    }
    if (!tmdb) { setLoading(false); return }
    tmdb.search(deb)
      .then(d => setResults(d.results || []))
      .catch(() => setResults(MOCK_MOVIES.filter(m => m.title.toLowerCase().includes(deb.toLowerCase()))))
      .finally(() => setLoading(false))
  }, [deb, tmdb, isDemo])
  return { query, setQuery, results, loading }
}
