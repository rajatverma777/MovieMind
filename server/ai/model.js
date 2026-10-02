// server/ai/model.js
// LangChain Google GenAI (Gemini) Model Configuration

import { ChatGoogleGenerativeAI } from '@langchain/google-genai'

export function getGeminiModel({ temperature = 0.4 } = {}) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.')
  }

  // Uses stable Gemini model configured via env var or default
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

  return new ChatGoogleGenerativeAI({
    apiKey,
    model: modelName,
    temperature,
    maxRetries: 2,
  })
}
