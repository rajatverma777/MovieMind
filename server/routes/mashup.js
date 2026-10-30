// server/routes/mashup.js
// AI Script Studio & "What If?" Movie Mashup Generator

import { Router } from 'express'
import { getGeminiModel } from '../ai/model.js'

const router = Router()

function generateFallbackMashup(movieA, movieB, style = 'Cinematic Thriller') {
  const titleA = movieA?.title || 'Film Alpha'
  const titleB = movieB?.title || 'Film Beta'

  return {
    title: `${titleA.toUpperCase()}: THE ${titleB.toUpperCase()} PROTOCOL`,
    logline: `When the existential stakes of ${titleA} collide with the relentless world of ${titleB}, two disparate forces are forced to navigate a high-stakes conspiracy before reality unspools.`,
    directorVision: `A hybrid visual aesthetic blending high-contrast shadow work with kinetic handheld Steadicam, scored to pulsating orchestral-electronic dissonance.`,
    dreamCast: [
      { character: 'The Infiltrator', playedBy: 'Lead from ' + titleA, role: 'A veteran operative wrestling with moral fatigue.' },
      { character: 'The Enforcer', playedBy: 'Protagonist from ' + titleB, role: 'A relentless strategist operating on pure conviction.' },
      { character: 'The Architect', playedBy: 'Cillian Murphy / Cate Blanchett', role: 'The shadowy puppet-master orchestrating both timelines.' }
    ],
    screenplay: `INT. ABANDONED OBSERVATORY - CONTINUOUS

Rain HAMMERS against the fractured glass dome. Shafts of sodium-vapor streetlights cut through the rising steam.

LEAD A (40s, rain-soaked trench coat) stands before a humming holographic terminal. His hands TREMBLE as the clock counts down: 00:03:14.

LEAD B emerges from the shadows, pistol holstered, eyes like cold steel.

LEAD B
You're three minutes late. The paradox is already cascading.

LEAD A
(without turning)
Time isn't linear here. You know what happens if we sever the uplink. We erase both timelines.

LEAD B
(steps closer, voice low)
Then we erase them. Some universes aren't meant to survive their own creators.

A deafening CRACK OF THUNDER shakes the foundation. The terminal FLASHES CRIMSON.

LEAD A
Look at the monitor. It's not our world collapsing.
(turns slowly)
It's theirs.

CUT TO BLACK.`,
    posterConcept: {
      colorPalette: 'Obsidian Black, Neon Crimson, and Pale Amber',
      composition: 'Split-face silhouette showing the iconic profiles of both lead worlds merging along a fractured glass axis.',
      tagline: 'Two Realities. One Impossible Choice.'
    }
  }
}

router.post('/', async (req, res) => {
  try {
    const { movieA, movieB, style = 'Cinematic Thriller' } = req.body || {}

    if (!movieA || !movieB) {
      return res.status(400).json({ error: 'Both movieA and movieB objects are required.' })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (apiKey) {
      try {
        const model = getGeminiModel({ temperature: 0.7 })
        const prompt = `You are an elite Hollywood Creative Executive and Screenwriter.
Synthesize a high-concept cinematic crossover mashup between these two films:
Film A: "${movieA.title}" - Overview: ${movieA.overview || 'N/A'}
Film B: "${movieB.title}" - Overview: ${movieB.overview || 'N/A'}
Requested Style/Tone: "${style}"

Create a compelling creative package in strict JSON format:
{
  "title": "string (punchy, creative mashup title)",
  "logline": "string (one-sentence Hollywood logline)",
  "directorVision": "string (visual aesthetic, cinematography, and musical score vision)",
  "dreamCast": [
    { "character": "string", "playedBy": "string (actor name)", "role": "string" },
    { "character": "string", "playedBy": "string (actor name)", "role": "string" },
    { "character": "string", "playedBy": "string (actor name)", "role": "string" }
  ],
  "screenplay": "string (an authentic, properly formatted Hollywood script scene: INT./EXT., action blocks, character cues, dialogue, parentheticals)",
  "posterConcept": {
    "colorPalette": "string",
    "composition": "string",
    "tagline": "string"
  }
}`

        const aiRes = await model.invoke(prompt)
        const text = typeof aiRes.content === 'string' ? aiRes.content : JSON.stringify(aiRes.content)
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          return res.json(parsed)
        }
      } catch (err) {
        console.warn('[MashupRoute] Gemini synthesis fallback:', err.message)
      }
    }

    // High quality fallback
    const fallback = generateFallbackMashup(movieA, movieB, style)
    return res.json(fallback)
  } catch (err) {
    console.error('[MashupRoute] Error:', err)
    return res.status(500).json({ error: 'Mashup generation failed', message: err.message })
  }
})

export default router
