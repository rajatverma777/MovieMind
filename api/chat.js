// api/chat.js — Vercel Serverless Function for POST /api/chat
import { runMovieMindAgent } from '../server/ai/agent.js'

export const maxDuration = 30 // Allow up to 30s for AI + tool calling on Vercel

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' })
  }

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

    return res.status(200).json(result)
  } catch (err) {
    console.error('[Vercel Serverless API] Error:', err)
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
      recommendations: []
    })
  }
}
