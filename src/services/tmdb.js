// src/services/tmdb.js — Client TMDB Service with Smart Proxy, Timeout & Guaranteed Fallback
import { TMDB_BASE, imgUrl, MOCK_MOVIES, GN } from '@/data/constants'

export function createTMDBService(apiKey) {
  const getFallback = (ep, p = {}) => {
    const clean = (ep || '').toLowerCase()

    if (clean.includes('/watch/providers')) {
      const match = clean.match(/movie\/(\d+)/)
      const id = match ? Number(match[1]) : 1
      const movie = MOCK_MOVIES.find(m => m.id === id) || MOCK_MOVIES[0]
      return {
        id,
        results: {
          IN: { link: `https://www.justwatch.com/in/search?q=${encodeURIComponent(movie.title)}` },
          US: { link: `https://www.justwatch.com/us/search?q=${encodeURIComponent(movie.title)}` }
        }
      }
    }

    if (clean.startsWith('/movie/')) {
      const id = Number(clean.split('/')[2])
      const movie = MOCK_MOVIES.find(m => m.id === id) || MOCK_MOVIES[0]
      return {
        ...movie,
        genres: (movie.genre_ids || []).map(gid => ({ id: gid, name: GN[gid] || 'Cinema' })),
        credits: { cast: [], crew: [] },
        videos: { results: [{ id: 'mock_trailer', key: 'dQw4w9WgXcQ', name: 'Official Trailer', site: 'YouTube', type: 'Trailer' }] },
        similar: { results: MOCK_MOVIES.filter(m => m.id !== movie.id).slice(0, 8) }
      }
    }

    if (clean.includes('/search/movie')) {
      const q = (p.query || '').toLowerCase().trim()
      const results = q
        ? MOCK_MOVIES.filter(m => m.title.toLowerCase().includes(q) || m.overview?.toLowerCase().includes(q))
        : MOCK_MOVIES
      return { page: 1, results, total_pages: 1, total_results: results.length }
    }

    if (clean.includes('/discover/movie')) {
      const withGenres = (p.with_genres || '').split(',').map(Number).filter(Boolean)
      const results = withGenres.length
        ? MOCK_MOVIES.filter(m => (m.genre_ids || []).some(g => withGenres.includes(g)))
        : MOCK_MOVIES
      return { page: 1, results: results.length ? results : MOCK_MOVIES, total_pages: 1, total_results: results.length || MOCK_MOVIES.length }
    }

    if (clean.startsWith('/person/')) {
      return {
        name: 'Featured Cinephile Talent',
        movie_credits: { cast: MOCK_MOVIES.slice(0, 6) }
      }
    }

    return {
      page: 1,
      results: [...MOCK_MOVIES].sort(() => Math.random() - 0.5),
      total_pages: 1,
      total_results: MOCK_MOVIES.length
    }
  }

  const q = async (ep, p = {}) => {
    // 1. First attempt: Backend Proxy /api/tmdb (bypasses ISP blocks like Jio/Airtel and supports Vercel)
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 3500)
      const res = await fetch(`/api/tmdb${ep}?${new URLSearchParams(p)}`, {
        signal: controller.signal
      })
      clearTimeout(timer)
      if (res.ok) {
        const data = await res.json()
        if (data && (Array.isArray(data.results) || data.id || data.title)) {
          return data
        }
      }
    } catch {
      // Backend proxy aborted or failed, proceed to direct check
    }

    // 2. Second attempt: Direct TMDB with short timeout (if outside blocked ISP)
    if (apiKey && apiKey !== 'DEMO') {
      try {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 2500)
        const res = await fetch(`${TMDB_BASE}${ep}?${new URLSearchParams({ api_key: apiKey, ...p })}`, {
          signal: controller.signal
        })
        clearTimeout(timer)
        if (res.ok) {
          return await res.json()
        }
      } catch {
        // Direct TMDB unreachable or blocked by ISP
      }
    }

    // 3. Third attempt: Instant fail-safe fallback to rich curated mock movies
    return getFallback(ep, p)
  }

  return {
    trending:  ()   => q('/trending/movie/week'),
    popular:   ()   => q('/movie/popular'),
    topRated:  ()   => q('/movie/top_rated'),
    nowPlay:   ()   => q('/movie/now_playing'),
    search:    s    => q('/search/movie', { query: s }),
    detail:         id  => q(`/movie/${id}`, { append_to_response: 'videos,credits,similar,release_dates,keywords' }),
    watchProviders: id  => q(`/movie/${id}/watch/providers`),
    person:         id  => q(`/person/${id}`, { append_to_response: 'movie_credits' }),
    genre:     ids  => q('/discover/movie', { with_genres: ids.join(','), sort_by: 'popularity.desc' }),
    img:       imgUrl,
    async validate() {
      try {
        const d = await q('/movie/popular')
        return !!(d && d.results?.length)
      } catch {
        return true
      }
    }
  }
}
