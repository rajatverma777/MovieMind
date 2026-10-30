// server/index.js
// MovieMind Backend Server (Express + Better Auth + MongoDB Atlas + Upstash Redis)

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import chatRouter from './routes/chat.js'
import semanticSearchRouter from './routes/semanticSearch.js'
import insightsRouter from './routes/insights.js'
import mashupRouter from './routes/mashup.js'
import consensusRouter from './routes/consensus.js'
import authRouter from './routes/auth.js'
import socialRouter from './routes/social.js'
import { connectDB } from './db/index.js'
import { getRedisPub } from './redis.js'

const app = express()
const PORT = process.env.PORT || 5001

// Middleware: CORS with credentials for cookies
app.use(cors({
  origin: true,
  credentials: true
}))
app.use(cookieParser())
app.use(express.json({ limit: '4mb' }))

// Normalize URL path for Vercel Serverless rewrite compatibility
app.use((req, res, next) => {
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + req.url
  }
  next()
})

// Warm-up database & Redis in serverless and long-running modes
connectDB().catch(err => {
  console.warn('⚠️ Initial MongoDB connection error:', err.message)
})
getRedisPub()

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'MovieMind AI Production Server',
    features: ['auth', 'social', 'realtime-chat', 'watchlist', 'consensus', 'insights', 'mashup', 'semantic-search'],
    mongoConfigured: !!process.env.MONGODB_URI,
    redisConfigured: !!process.env.REDIS_URL,
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    tmdbConfigured: !!(process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY)
  })
})

// Feature Routes
app.use('/api/auth', authRouter)
app.use('/api/social', socialRouter)
app.use('/api/watchlist', socialRouter) // Alias for /api/watchlist
app.use('/api/preferences', socialRouter) // Alias for /api/preferences
app.use('/api/chat', chatRouter)
app.use('/api/search/semantic', semanticSearchRouter)
app.use('/api/insights', insightsRouter)
app.use('/api/ai/mashup', mashupRouter)
app.use('/api/consensus', consensusRouter)

// 404 handler for unknown API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' })
  }
  next()
})

// Global Error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err)
  res.status(500).json({ error: 'Internal Server Error', message: err.message })
})

let server
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  server = app.listen(PORT, () => {
    console.log(`🎬 MovieMind AI Server running on http://localhost:${PORT}`)
    console.log(`   - MongoDB Atlas:     ${!!process.env.MONGODB_URI ? 'Connected' : 'Missing MONGODB_URI'}`)
    console.log(`   - Upstash Redis:     ${!!process.env.REDIS_URL ? 'Connected' : 'Missing REDIS_URL'}`)
    console.log(`   - Gemini AI:         ${!!process.env.GEMINI_API_KEY ? 'Configured' : 'Missing'}`)
    console.log(`   - TMDB API:          ${!!(process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY) ? 'Configured' : 'Missing'}`)
  })
}

export { app, server }
export default app
