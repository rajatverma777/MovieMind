// server/routes/semanticSearch.js
// Vague Memory & Semantic Natural Language Movie Search

import { Router } from 'express'
import { MOCK_MOVIES, GN, GID } from '../../src/data/constants.js'
import { getGeminiModel } from '../ai/model.js'

const router = Router()

// Stopwords for fast lexical filtering
const STOPWORDS = new Set([
  'a', 'about', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'how', 'i', 'in', 'is', 'it', 'movie', 'film', 'of', 'on', 'or', 'that',
  'the', 'this', 'to', 'was', 'what', 'where', 'which', 'who', 'with', 'one',
  'some', 'someone', 'there', 'their', 'when', 'into'
])

function tokenize(text) {
  if (!text) return []
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOPWORDS.has(t))
}

/**
 * Deterministic Semantic Matcher (O(N) token and topic frequency with genre grounding)
 */
function rankBySemanticHeuristics(query, movies) {
  const qTokens = tokenize(query)
  if (qTokens.length === 0) return []

  const queryLower = query.toLowerCase()

  // Detect genre hints in natural language query
  const matchedGenreIds = []
  for (const [idStr, name] of Object.entries(GN)) {
    if (queryLower.includes(name.toLowerCase())) {
      matchedGenreIds.push(Number(idStr))
    }
  }

  // Common movie tropes/concepts mapping
  const TROPE_MAP = {
    'space': ['interstellar', 'astronaut', 'wormhole', 'galaxy', 'alien', 'planet'],
    'dream': ['subconscious', 'mind', 'inception', 'sleep', 'reality'],
    'cyberpunk': ['matrix', 'ai', 'hacker', 'future', 'robot', 'blade runner'],
    'alien': ['arrival', 'extraterrestrial', 'linguist', 'spacecraft', 'monsters'],
    'sniper': ['phone booth', 'desert', 'rifle', 'target', 'assassin'],
    'fight': ['club', 'insomniac', 'aggression', 'soap', 'boxing'],
    'mafia': ['corleone', 'godfather', 'mob', 'organized crime', 'gangster'],
    'drum': ['whiplash', 'jazz', 'instructor', 'music', 'tempo'],
    'joker': ['batman', 'dark knight', 'gotham', 'chaos', 'vigilante'],
    'clown': ['it', 'pennywise', 'derry', 'horror', 'children', 'balloon'],
    'parasite': ['wealthy', 'family', 'basement', 'class', 'house'],
    'detective': ['knives out', 'murder', 'investigation', 'harlan', 'mansion', 'mystery'],
    'memory': ['eternal sunshine', 'erase', 'memories', 'heartbroken'],
    'time': ['loop', 'travel', 'wormhole', 'relativity', 'years']
  }

  return movies.map(m => {
    const titleTokens = tokenize(m.title)
    const overviewTokens = tokenize(m.overview)
    const allTokens = [...titleTokens, ...titleTokens, ...overviewTokens] // weight title 2x

    let score = 0
    const matchedTokens = []

    for (const qt of qTokens) {
      if (titleTokens.includes(qt)) {
        score += 4.0
        matchedTokens.push(qt)
      } else if (overviewTokens.includes(qt)) {
        score += 1.8
        matchedTokens.push(qt)
      } else {
        // Partial substring match
        const partial = overviewTokens.find(t => t.includes(qt) || qt.includes(t))
        if (partial) {
          score += 0.8
          matchedTokens.push(partial)
        }
      }

      // Check trope mapping
      for (const [key, tropes] of Object.entries(TROPE_MAP)) {
        if (qt.includes(key) || key.includes(qt)) {
          for (const trope of tropes) {
            if (overviewTokens.includes(trope) || titleTokens.includes(trope)) {
              score += 1.5
              matchedTokens.push(trope)
            }
          }
        }
      }
    }

    // Genre overlap bonus
    if (m.genre_ids && matchedGenreIds.length > 0) {
      const gOverlap = m.genre_ids.filter(gid => matchedGenreIds.includes(gid)).length
      score += gOverlap * 1.2
    }

    // Popularity / Rating normalization
    if (m.vote_average) {
      score += (m.vote_average / 10) * 0.5
    }

    const uniqueMatches = [...new Set(matchedTokens)].slice(0, 4)
    const matchReason = uniqueMatches.length > 0
      ? `Matched narrative concepts: ${uniqueMatches.join(', ')}`
      : `Broad thematic affinity with "${query.slice(0, 30)}..."`

    return {
      ...m,
      semanticScore: Math.min(0.99, Number((score / (qTokens.length * 3.5 + 1)).toFixed(2))),
      matchedTokens: uniqueMatches,
      matchReason
    }
  })
  .filter(m => m.semanticScore > 0.05)
  .sort((a, b) => b.semanticScore - a.semanticScore)
}

router.post('/', async (req, res) => {
  try {
    const { query, candidatePool = [], limit = 12 } = req.body || {}

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Query is required.' })
    }

    const trimmedQuery = query.trim()
    const pool = Array.isArray(candidatePool) && candidatePool.length > 0
      ? candidatePool
      : MOCK_MOVIES

    // Step 1: Fast Heuristic Matcher
    const heuristicResults = rankBySemanticHeuristics(trimmedQuery, pool).slice(0, limit)

    // Step 2: If Gemini is available, enhance the top results with deep reasoning
    const apiKey = process.env.GEMINI_API_KEY
    if (apiKey && heuristicResults.length > 0) {
      try {
        const model = getGeminiModel({ temperature: 0.2 })
        const topCandidates = heuristicResults.slice(0, 5).map(m => `ID: ${m.id} | Title: "${m.title}" | Overview: ${m.overview.slice(0, 160)}`).join('\n')

        const prompt = `A user is trying to find a movie from a vague natural language memory:
User Query: "${trimmedQuery}"

Candidate Films:
${topCandidates}

In 1-2 concise sentences, identify which candidate is the most accurate match for this vague description and explain the exact matching scene, trope, or premise. Keep it informative.`

        const aiResponse = await model.invoke(prompt)
        const explanation = typeof aiResponse.content === 'string'
          ? aiResponse.content
          : JSON.stringify(aiResponse.content)

        return res.json({
          query: trimmedQuery,
          explanation: explanation.trim(),
          results: heuristicResults
        })
      } catch (err) {
        // Fallback to heuristic results if Gemini has any issue
        console.warn('[SemanticSearch] Gemini refinement skipped:', err.message)
      }
    }

    return res.json({
      query: trimmedQuery,
      explanation: heuristicResults.length > 0
        ? `Found ${heuristicResults.length} films matching the conceptual themes of your query.`
        : 'No direct concept match found. Try phrasing by plot twist, setting, or memorable scene.',
      results: heuristicResults
    })
  } catch (err) {
    console.error('[SemanticSearch] Error:', err)
    return res.status(500).json({ error: 'Semantic search failed', message: err.message })
  }
})

export default router
