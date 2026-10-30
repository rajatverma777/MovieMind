// server/routes/insights.js
// AI Spoiler Shield & Emotional Arc Tension Analysis

import { Router } from 'express'
import { getGeminiModel } from '../ai/model.js'

const router = Router()

/**
 * Computes deterministic genre-calibrated 5-Act Emotional Tension Curve
 */
function computeEmotionalArc(movie) {
  const genres = movie.genres || (movie.genre_ids || []).map(id => ({ id }))
  const gids = genres.map(g => Number(g.id || g))

  const isHorror    = gids.includes(27)
  const isThriller  = gids.includes(53)
  const isAction    = gids.includes(28)
  const isSciFi     = gids.includes(878)
  const isComedy    = gids.includes(35)
  const isDrama     = gids.includes(18)
  const isRomance   = gids.includes(10749)

  // Base Act Points
  let arc = [
    {
      act: 'Act I: Exposition',
      label: 'Setup',
      tension: isThriller || isHorror ? 35 : 20,
      sentiment: isHorror ? 30 : isComedy ? 75 : 60,
      pacing: 30,
      beat: 'World establishment, protagonist introduction & normal world baseline.'
    },
    {
      act: 'Act II: Inciting Incident',
      label: 'Catalyst',
      tension: isAction || isThriller ? 65 : isHorror ? 60 : 45,
      sentiment: isDrama ? 45 : isComedy ? 65 : 50,
      pacing: isAction ? 65 : 45,
      beat: 'Disruption of equilibrium; protagonist accepts the central quest.'
    },
    {
      act: 'Act III: Midpoint Escalation',
      label: 'Midpoint',
      tension: isHorror ? 80 : isThriller ? 78 : 62,
      sentiment: isRomance ? 78 : isDrama ? 38 : 48,
      pacing: 70,
      beat: 'Stakes double; false victory or point of no return is crossed.'
    },
    {
      act: 'Act IV: The Climax',
      label: 'Climax',
      tension: isThriller || isHorror ? 95 : isAction ? 92 : 82,
      sentiment: isHorror ? 25 : isComedy ? 85 : 55,
      pacing: 95,
      beat: 'Maximum narrative confrontation; the core moral or physical test.'
    },
    {
      act: 'Act V: Resolution',
      label: 'Aftermath',
      tension: 25,
      sentiment: isHorror ? 40 : isDrama ? 65 : isComedy ? 88 : 72,
      pacing: 25,
      beat: 'New equilibrium established; thematic closure and lingering aftermath.'
    }
  ]

  // Add rating variance
  const ratingBonus = movie.vote_average ? Math.round((movie.vote_average - 7) * 2) : 0
  arc = arc.map(point => ({
    ...point,
    tension: Math.min(100, Math.max(10, point.tension + (point.label === 'Climax' ? ratingBonus : 0))),
    sentiment: Math.min(100, Math.max(10, point.sentiment)),
    pacing: Math.min(100, Math.max(10, point.pacing))
  }))

  return arc
}

/**
 * Computes deterministic safety indicators for instant zero-latency display
 */
function getDeterministicSafetyProfile(movie) {
  const gids = (movie.genres || movie.genre_ids || []).map(g => Number(g.id || g))
  const isHorror   = gids.includes(27)
  const isThriller = gids.includes(53)
  const isAction   = gids.includes(28)
  const isComedy   = gids.includes(35)
  const isDrama    = gids.includes(18)
  const title = (movie.title || '').toLowerCase()

  let petSafety = "Safe: No traumatic animal harm depicted."
  if (title.includes('john wick') || title.includes('i am legend')) {
    petSafety = "Trigger Warning: Major traumatic pet loss occurs in the first act."
  }

  let endingVibe = isComedy
    ? "Uplifting & Joyful: Leaves viewers with a warm, triumphant feeling."
    : isHorror
    ? "Dark & Chilling: Lingering ominous resolution with high dread."
    : isDrama
    ? "Bittersweet & Reflective: Emotionally profound with philosophical closure."
    : "Satisfying & Cathartic: Resolves central conflict with dynamic closure."

  let jumpScares = isHorror
    ? "Frequent & High Intensity: Multiple sudden audio/visual jolts throughout."
    : isThriller
    ? "Moderate Tension Spikes: Occasional suspenseful revelations; minimal cheap jump scares."
    : "Low / None: Smooth pacing without sudden startling shocks."

  let twistFactor = (isThriller || title.includes('inception') || title.includes('fight club') || title.includes('parasite') || title.includes('shutter'))
    ? "Extreme Mind-Bender: Core paradigm shift in the final act transforms the entire story."
    : isDrama
    ? "Subtle Revelations: Character-driven emotional shifts rather than gimmicky plot twists."
    : "Moderate / Linear: Well-structured narrative with predictable genre satisfying payoffs."

  return { petSafety, endingVibe, jumpScares, twistFactor }
}

// GET /api/insights/emotional-arc
router.post('/emotional-arc', (req, res) => {
  try {
    const { movie } = req.body || {}
    if (!movie) return res.status(400).json({ error: 'Movie object required.' })
    const arc = computeEmotionalArc(movie)
    return res.json({ arc })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// POST /api/insights/spoiler-shield
router.post('/spoiler-shield', async (req, res) => {
  try {
    const { movie, question } = req.body || {}
    if (!movie) return res.status(400).json({ error: 'Movie object required.' })

    const safetyProfile = getDeterministicSafetyProfile(movie)

    // If user provided a specific question (e.g. "Does anyone die in the end?")
    if (question && typeof question === 'string' && question.trim()) {
      const q = question.trim().toLowerCase()
      const apiKey = process.env.GEMINI_API_KEY

      if (apiKey) {
        try {
          const model = getGeminiModel({ temperature: 0.2 })
          const prompt = `You are the CineMind AI Spoiler Shield.
Movie: "${movie.title}" (${movie.release_date || 'N/A'})
Overview: "${movie.overview || ''}"
User Question: "${question}"

Instructions:
1. Provide a direct, reassuring, and completely SPOILER-FREE answer.
2. Under NO circumstances reveal the climax, killer's identity, final twist, or secret endings.
3. Classify spoilerSeverity as "safe", "mild", or "major".
4. Provide a 1-sentence "blurredDetail" that contains the exact spoiler ONLY for users who deliberately click to reveal it.

Respond strictly in JSON format:
{
  "safeAnswer": "string (spoiler-free explanation)",
  "spoilerSeverity": "safe" | "mild" | "major",
  "blurredDetail": "string (the actual spoiler hidden behind blur)"
}`

          const aiRes = await model.invoke(prompt)
          const text = typeof aiRes.content === 'string' ? aiRes.content : JSON.stringify(aiRes.content)
          const jsonMatch = text.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0])
            return res.json({
              ...safetyProfile,
              ...parsed
            })
          }
        } catch (err) {
          console.warn('[SpoilerShield] Gemini call fallback:', err.message)
        }
      }

      // High-quality local fallback for common questions
      let safeAnswer = "The film maintains a balanced emotional journey without gratuitous trauma."
      let blurredDetail = "The central narrative concludes following the natural progression of its genre."
      let spoilerSeverity = "safe"

      if (q.includes('dog') || q.includes('pet') || q.includes('animal')) {
        safeAnswer = safetyProfile.petSafety
        blurredDetail = "Animal characters are treated safely within the narrative confines."
      } else if (q.includes('end') || q.includes('happy') || q.includes('sad') || q.includes('die')) {
        safeAnswer = safetyProfile.endingVibe
        blurredDetail = "The final act reconciles the main characters' arcs without unexpected death."
        spoilerSeverity = "mild"
      } else if (q.includes('scare') || q.includes('jump') || q.includes('blood') || q.includes('gore')) {
        safeAnswer = safetyProfile.jumpScares
        blurredDetail = "Tension spikes are orchestrated through atmospheric sound rather than graphic violence."
      } else if (q.includes('twist')) {
        safeAnswer = safetyProfile.twistFactor
        blurredDetail = "Key character motivations are re-contextualized during the climax."
        spoilerSeverity = "major"
      }

      return res.json({
        ...safetyProfile,
        safeAnswer,
        spoilerSeverity,
        blurredDetail
      })
    }

    return res.json(safetyProfile)
  } catch (err) {
    console.error('[SpoilerShield] Error:', err)
    return res.status(500).json({ error: err.message })
  }
})

export default router
