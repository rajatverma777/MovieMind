// server/ai/tools.js
// LangChain Tools for TMDB Search, Details, and Deterministic Recommendations

import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { computeRecommendations } from '../recommendation/engine.js'
import { TMDB_BASE, MOCK_MOVIES, GN } from '../../src/data/constants.js'

const getTmdbApiKey = () => process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY || 'DEMO'

/**
 * Tool 1: Deterministic Content-Based Recommendation Tool
 * Uses genre vectors and cosine similarity
 */
export const recommendMoviesTool = tool(
  async ({ referenceMovieTitle, genres = [], limit = 5 }, config) => {
    try {
      const watchlist = config?.configurable?.watchlist || []
      const recs = await computeRecommendations({
        referenceTitle: referenceMovieTitle,
        genreNames: genres,
        watchlist,
        limit,
        apiKey: getTmdbApiKey()
      })

      if (!recs.length) {
        return JSON.stringify({
          status: 'empty',
          message: 'No matching recommendations found for the given criteria.'
        })
      }

      return JSON.stringify({
        status: 'success',
        algorithm: 'genre_vector_cosine_similarity',
        recommendations: recs
      })
    } catch (err) {
      return JSON.stringify({ status: 'error', error: err.message })
    }
  },
  {
    name: 'recommend_movies',
    description: 'Calculates content-based movie recommendations using genre vectors and cosine similarity. Use this whenever the user asks for recommendations similar to a movie (e.g. "movies like Interstellar"), a genre preference (e.g. "sci-fi and thriller"), or their saved watchlist.',
    schema: z.object({
      referenceMovieTitle: z.string().optional().describe('Title of reference movie to base recommendations on, e.g. "Inception"'),
      genres: z.array(z.string()).optional().describe('List of genre names the user is interested in, e.g. ["Sci-Fi", "Action"]'),
      limit: z.number().optional().default(5).describe('Maximum number of movies to return (default 5)')
    })
  }
)

/**
 * Tool 2: TMDB Search Tool
 * Searches TMDB catalog by title/keyword
 */
export const searchMoviesTool = tool(
  async ({ query }) => {
    const apiKey = getTmdbApiKey()
    if (!apiKey || apiKey === 'DEMO') {
      const q = query.toLowerCase()
      const matches = MOCK_MOVIES.filter(m => m.title.toLowerCase().includes(q))
      return JSON.stringify({
        results: matches.slice(0, 5).map(m => ({
          movieId: m.id,
          title: m.title,
          overview: m.overview,
          releaseDate: m.release_date,
          voteAverage: m.vote_average,
          posterPath: m.poster_path,
          genres: (m.genre_ids || []).map(id => GN[id]).filter(Boolean)
        }))
      })
    }

    try {
      const res = await fetch(`${TMDB_BASE}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`)
      if (!res.ok) {
        return JSON.stringify({ error: `TMDB search returned status ${res.status}` })
      }
      const data = await res.json()
      const results = (data.results || []).slice(0, 5).map(m => ({
        movieId: m.id,
        title: m.title,
        overview: m.overview,
        releaseDate: m.release_date,
        voteAverage: m.vote_average ? Number(m.vote_average.toFixed(1)) : null,
        posterPath: m.poster_path,
        genres: (m.genre_ids || []).map(id => GN[id]).filter(Boolean)
      }))

      return JSON.stringify({ results })
    } catch (err) {
      return JSON.stringify({ error: err.message })
    }
  },
  {
    name: 'search_movies',
    description: 'Searches the TMDB catalog for movies by title or query string. Use this to look up a movie or find candidate films.',
    schema: z.object({
      query: z.string().describe('Search query or movie title, e.g. "The Dark Knight"')
    })
  }
)

/**
 * Tool 3: TMDB Movie Details Tool
 * Retrieves overview, director, cast, runtime, and ratings
 */
export const getMovieDetailsTool = tool(
  async ({ movieId, title }) => {
    const apiKey = getTmdbApiKey()

    let targetId = movieId
    if (!targetId && title) {
      // Find ID by search first
      try {
        const sRes = await fetch(`${TMDB_BASE}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}`)
        if (sRes.ok) {
          const sData = await sRes.json()
          targetId = sData.results?.[0]?.id
        }
      } catch {}
    }

    if (!targetId) {
      // Fallback search in mock
      const found = MOCK_MOVIES.find(m => m.id === movieId || (title && m.title.toLowerCase().includes(title.toLowerCase())))
      if (found) {
        return JSON.stringify({
          movieId: found.id,
          title: found.title,
          overview: found.overview,
          releaseDate: found.release_date,
          voteAverage: found.vote_average,
          posterPath: found.poster_path
        })
      }
      return JSON.stringify({ error: `Movie not found with ID ${movieId} or title ${title}` })
    }

    try {
      const res = await fetch(`${TMDB_BASE}/movie/${targetId}?api_key=${apiKey}&append_to_response=credits`)
      if (!res.ok) {
        return JSON.stringify({ error: `Failed to fetch details for movie ${targetId}` })
      }
      const data = await res.json()
      const director = data.credits?.crew?.find(c => c.job === 'Director')?.name || 'Unknown'
      const topCast = (data.credits?.cast || []).slice(0, 5).map(c => c.name)

      return JSON.stringify({
        movieId: data.id,
        title: data.title,
        overview: data.overview,
        tagline: data.tagline || '',
        runtime: data.runtime ? `${data.runtime} min` : 'Unknown',
        releaseDate: data.release_date,
        voteAverage: data.vote_average ? Number(data.vote_average.toFixed(1)) : null,
        posterPath: data.poster_path,
        genres: (data.genres || []).map(g => g.name),
        director,
        cast: topCast
      })
    } catch (err) {
      return JSON.stringify({ error: err.message })
    }
  },
  {
    name: 'get_movie_details',
    description: 'Retrieves comprehensive metadata for a specific movie, including director, top cast, runtime, overview, and genres.',
    schema: z.object({
      movieId: z.number().optional().describe('TMDB movie ID if available'),
      title: z.string().optional().describe('Movie title if movie ID is not known')
    })
  }
)

export const allTools = [recommendMoviesTool, searchMoviesTool, getMovieDetailsTool]
