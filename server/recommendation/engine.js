// server/recommendation/engine.js
// Core deterministic recommendation engine reusing genre vectors & cosine similarity

import { GID, GN, MOCK_MOVIES, TMDB_BASE } from '../../src/data/constants.js'
import { buildGenreVector, cosineSimilarity, getRecommendations } from '../../src/utils/recommend.js'

/**
 * Searches TMDB for a movie by title
 */
async function searchTmdbMovie(title, apiKey) {
  if (!apiKey || apiKey === 'DEMO') {
    return MOCK_MOVIES.find(m => m.title.toLowerCase().includes(title.toLowerCase())) || null
  }
  try {
    const res = await fetch(`${TMDB_BASE}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}`)
    if (!res.ok) return null
    const data = await res.json()
    return data.results?.[0] || null
  } catch (err) {
    console.error('[RecommendationEngine] TMDB search error:', err.message)
    return null
  }
}

/**
 * Fetches a candidate pool of movies from TMDB (popular + top rated)
 */
async function fetchCandidatePool(apiKey) {
  if (!apiKey || apiKey === 'DEMO') {
    return MOCK_MOVIES
  }
  try {
    const [popularRes, topRatedRes] = await Promise.all([
      fetch(`${TMDB_BASE}/movie/popular?api_key=${apiKey}&page=1`),
      fetch(`${TMDB_BASE}/movie/top_rated?api_key=${apiKey}&page=1`)
    ])

    const popular = popularRes.ok ? (await popularRes.json()).results || [] : []
    const topRated = topRatedRes.ok ? (await topRatedRes.json()).results || [] : []

    const poolMap = new Map()
    for (const m of [...popular, ...topRated, ...MOCK_MOVIES]) {
      if (m && m.id && !poolMap.has(m.id)) {
        poolMap.set(m.id, m)
      }
    }
    return Array.from(poolMap.values())
  } catch (err) {
    console.error('[RecommendationEngine] Candidate pool fetch error:', err.message)
    return MOCK_MOVIES
  }
}

/**
 * Deterministic recommendation runner:
 * - Computes genre vector for reference movies / watchlist / genre names
 * - Computes cosine similarity against candidate pool
 * - Returns ranked recommendations with scores and metadata
 */
export async function computeRecommendations({
  referenceTitle,
  genreNames = [],
  watchlist = [],
  limit = 5,
  apiKey = process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY
}) {
  const liked = []

  // 1. Reference movie provided (e.g. "Inception")
  if (referenceTitle) {
    const refMovie = await searchTmdbMovie(referenceTitle, apiKey)
    if (refMovie) {
      liked.push(refMovie)
    }
  }

  // 2. Watchlist provided from user session
  if (Array.isArray(watchlist) && watchlist.length > 0) {
    liked.push(...watchlist)
  }

  // 3. Explicit genre names provided (e.g. ["Sci-Fi", "Thriller"])
  if (genreNames.length > 0 && liked.length === 0) {
    const genreIds = []
    const lowerNames = genreNames.map(g => g.toLowerCase().trim())
    for (const [idStr, name] of Object.entries(GN)) {
      if (lowerNames.some(g => name.toLowerCase().includes(g) || g.includes(name.toLowerCase()))) {
        genreIds.push(Number(idStr))
      }
    }
    if (genreIds.length > 0) {
      liked.push({ id: 0, title: 'Genre Preference', genre_ids: genreIds })
    }
  }

  // Fallback to top mock movie if nothing was specified
  if (liked.length === 0) {
    liked.push(MOCK_MOVIES[0])
  }

  const pool = await fetchCandidatePool(apiKey)
  const ranked = getRecommendations(liked, pool, limit)

  return ranked.map(m => ({
    movieId: m.id,
    title: m.title,
    posterPath: m.poster_path || null,
    releaseDate: m.release_date || null,
    voteAverage: m.vote_average ? Number(m.vote_average.toFixed(1)) : null,
    overview: m.overview || '',
    genres: (m.genre_ids || (m.genres || []).map(g => g.id || g))
      .map(id => GN[id])
      .filter(Boolean),
    score: Number((m._score || 0).toFixed(3))
  }))
}

export { buildGenreVector, cosineSimilarity, getRecommendations }
