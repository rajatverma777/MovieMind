// server/index.js
// MovieMind Backend Server (Express + LangChain + Gemini + TMDB)

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import chatRouter from './routes/chat.js'

const app = express()
const PORT = process.env.PORT || 5001

// Middleware
app.use(cors())
app.use(express.json({ limit: '1mb' }))

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'MovieMind AI Server',
    model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    tmdbConfigured: !!(process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY)
  })
})

// AI Chatbot Route
app.use('/api/chat', chatRouter)

// 404 handler for unknown API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' })
  }
  next()
})

// Error handler
app.use((err, req, res, next) => {
  console.error('[Server] Error:', err)
  res.status(500).json({ error: 'Internal Server Error', message: err.message })
})

let server
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`🎬 MovieMind AI Server running on http://localhost:${PORT}`)
    console.log(`   - Gemini API Key configured: ${!!process.env.GEMINI_API_KEY ? 'Yes' : 'No (add to .env)'}`)
    console.log(`   - TMDB API Key configured:   ${!!(process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY) ? 'Yes' : 'No'}`)
  })
}

export { app, server }
export default app
