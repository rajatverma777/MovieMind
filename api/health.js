// api/health.js — Vercel Serverless Function for GET /api/health
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    service: 'MovieMind AI Serverless on Vercel',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'),
    tmdbConfigured: !!(process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY)
  })
}
