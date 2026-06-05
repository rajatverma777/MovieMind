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
