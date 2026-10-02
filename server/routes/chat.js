// server/routes/chat.js
// Express route for POST /api/chat

import { Router } from 'express'
import { runMovieMindAgent } from '../ai/agent.js'

const router = Router()

router.post('/', async (req, res) => {
  try {
    const { message, history = [], watchlist = [] } = req.body || {}

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'A non-empty "message" string is required.'
      })
    }

    const result = await runMovieMindAgent({
      message: message.trim(),
      history,
      watchlist
    })

    return res.json(result)
  } catch (err) {
    console.error('[ChatRoute] Unhandled error:', err)
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message || 'An unexpected error occurred while processing your request.',
      recommendations: []
    })
  }
})

export default router
