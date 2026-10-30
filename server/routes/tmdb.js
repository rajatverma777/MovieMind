// server/routes/tmdb.js — High-performance TMDB Proxy with DNS Bypass, In-Memory Caching & Seamless Fallback
import { Router } from 'express'
import https from 'node:https'
import dns from 'node:dns'
import { MOCK_MOVIES, GN } from '../../src/data/constants.js'

const router = Router()

// Custom DNS Resolver using Cloudflare (1.1.1.1) and Google (8.8.8.8)
// This bypasses ISP-level DNS blocks (e.g. Jio, Airtel, ACT in India)
const resolver = new dns.Resolver()
resolver.setServers(['1.1.1.1', '8.8.8.8'])

const agent = new https.Agent({
  keepAlive: true,
  maxSockets: 50,
  lookup: (hostname, options, callback) => {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }
    resolver.resolve4(hostname, (err, addrs) => {
      if (err || !addrs?.length) {
        return dns.lookup(hostname, options, callback)
      }
      if (options && options.all) {
        return callback(null, addrs.map(a => ({ address: a, family: 4 })))
      }
      return callback(null, addrs[0], 4)
    })
  }
})

// In-memory cache with TTL (15 minutes for lists, 1 hour for details)
const cache = new Map()
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes

function getCached(key) {
  const item = cache.get(key)
  if (!item) return null
  if (Date.now() > item.expires) {
    cache.delete(key)
    return null
  }
  return item.data
}

function setCached(key, data, ttl = CACHE_TTL) {
  if (cache.size > 300) {
    const firstKey = cache.keys().next().value
    if (firstKey) cache.delete(firstKey)
  }
  cache.set(key, { data, expires: Date.now() + ttl })
}

const TMDB_API_KEY = process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY || '2f7d49e6ef43d3ab0d750a130e131725'

// Generate rich mock data when upstream TMDB is blocked or unreachable
function getFallbackData(subpath, query) {
  const cleanPath = subpath.toLowerCase()

  // Movie watch providers
  if (cleanPath.includes('/watch/providers')) {
    const match = cleanPath.match(/movie\/(\d+)/)
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

  // Movie Details
  if (cleanPath.startsWith('movie/')) {
    const id = Number(cleanPath.split('/')[1])
    const movie = MOCK_MOVIES.find(m => m.id === id) || MOCK_MOVIES[0]
    return {
      ...movie,
      genres: (movie.genre_ids || []).map(gid => ({ id: gid, name: GN[gid] || 'Cinema' })),
      credits: { cast: [], crew: [] },
      videos: { results: [{ id: 'mock_trailer', key: 'dQw4w9WgXcQ', name: 'Official Trailer', site: 'YouTube', type: 'Trailer' }] },
      similar: { results: MOCK_MOVIES.filter(m => m.id !== movie.id).slice(0, 8) }
    }
  }

  // Search Movie
  if (cleanPath.includes('search/movie')) {
    const q = (query.query || '').toLowerCase().trim()
    const results = q ? MOCK_MOVIES.filter(m => m.title.toLowerCase().includes(q) || m.overview.toLowerCase().includes(q)) : MOCK_MOVIES
    return {
      page: 1,
      results,
      total_pages: 1,
      total_results: results.length
    }
  }

  // Discover by genre
  if (cleanPath.includes('discover/movie')) {
    const withGenres = (query.with_genres || '').split(',').map(Number).filter(Boolean)
    const results = withGenres.length
      ? MOCK_MOVIES.filter(m => (m.genre_ids || []).some(g => withGenres.includes(g)))
      : MOCK_MOVIES
    return {
      page: 1,
      results: results.length ? results : MOCK_MOVIES,
      total_pages: 1,
      total_results: results.length || MOCK_MOVIES.length
    }
  }

  // Person / credits
  if (cleanPath.startsWith('person/')) {
    return {
      name: 'Featured Cinephile Talent',
      movie_credits: { cast: MOCK_MOVIES.slice(0, 6) }
    }
  }

  // Default: Trending / Popular / Top Rated / Now Playing
  return {
    page: 1,
    results: [...MOCK_MOVIES].sort(() => Math.random() - 0.5),
    total_pages: 1,
    total_results: MOCK_MOVIES.length
  }
}

// Generic TMDB Proxy Handler (handles all subpaths under /api/tmdb)
router.use(async (req, res) => {
  const subpath = req.path.replace(/^\//, '')
  const queryParams = new URLSearchParams(req.query)
  queryParams.set('api_key', TMDB_API_KEY)

  const cacheKey = `${subpath}?${queryParams.toString()}`
  const cachedData = getCached(cacheKey)
  if (cachedData) {
    res.setHeader('X-Cache', 'HIT')
    return res.json(cachedData)
  }

  const tmdbUrl = `https://api.themoviedb.org/3/${subpath}?${queryParams.toString()}`

  const requestOptions = {
    agent,
    timeout: 3500,
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    }
  }

  let handled = false
  const sendFallback = (reason) => {
    if (handled) return
    handled = true
    const fallback = getFallbackData(subpath, req.query)
    setCached(cacheKey, fallback, 60 * 1000) // Cache fallback briefly (1 min)
    res.setHeader('X-Fallback', 'true')
    res.setHeader('X-Fallback-Reason', reason || 'network')
    return res.json(fallback)
  }

  const tmdbReq = https.get(tmdbUrl, requestOptions, (tmdbRes) => {
    let raw = ''
    tmdbRes.setEncoding('utf8')

    tmdbRes.on('data', chunk => {
      raw += chunk
    })

    tmdbRes.on('end', () => {
      if (handled) return
      handled = true
      try {
        const parsed = JSON.parse(raw)
        if (tmdbRes.statusCode >= 200 && tmdbRes.statusCode < 300) {
          setCached(cacheKey, parsed)
          res.setHeader('X-Cache', 'MISS')
          return res.status(tmdbRes.statusCode).json(parsed)
        } else {
          return sendFallback(`http-${tmdbRes.statusCode}`)
        }
      } catch {
        return sendFallback('json-parse')
      }
    })
  })

  tmdbReq.on('timeout', () => {
    tmdbReq.destroy()
    sendFallback('timeout')
  })

  tmdbReq.on('error', (err) => {
    sendFallback(err.code || 'network-error')
  })
})

export default router
