// server/ai/model.js
// LangChain Google GenAI (Gemini) Model Configuration

import { ChatGoogleGenerativeAI } from '@langchain/google-genai'

export function getGeminiModel({ modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash', temperature = 0.4 } = {}) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.')
  }

  return new ChatGoogleGenerativeAI({
    apiKey,
    model: modelName,
    temperature,
    maxRetries: 1,
  })
}
