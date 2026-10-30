// api/index.js — Unified Vercel Serverless Entrypoint for MovieMind AI
// Routes all /api/* requests (Auth, Social, Chat, Consensus, Mashup, Insights) directly through Express
import app from '../server/index.js'

export const maxDuration = 30 // Allow up to 30s for AI inference on Vercel

export default app
