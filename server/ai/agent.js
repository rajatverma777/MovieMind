// server/ai/agent.js
// LangChain Agent Workflow: Tool Selection, Execution & Structured Output

import { HumanMessage, AIMessage, SystemMessage, ToolMessage } from '@langchain/core/messages'
import { z } from 'zod'
import { getGeminiModel } from './model.js'
import { SYSTEM_PROMPT } from './prompts.js'
import { allTools } from './tools.js'
import { computeRecommendations } from '../recommendation/engine.js'

// Structured output schema for frontend consumption (Gemini-compatible single types)
export const ChatResponseSchema = z.object({
  message: z.string().describe('Conversational answer explaining the recommendations or answering the user query.'),
  recommendations: z.array(
    z.object({
      movieId: z.number().describe('TMDB movie ID'),
      title: z.string().describe('Movie title'),
      posterPath: z.string().optional().describe('TMDB poster_path starting with / if available'),
      releaseDate: z.string().optional().describe('Release year or full release date'),
      voteAverage: z.number().optional().describe('Rating score out of 10'),
      reason: z.string().describe('Compelling reason why this film was chosen'),
      score: z.number().optional().describe('Cosine similarity score (0.0 to 1.0) if applicable')
    })
  ).default([]).describe('Array of recommended movies with metadata, or empty array if none.')
})

/**
 * Executes a tool by name with provided arguments
 */
async function executeTool(toolCall, watchlist) {
  const target = allTools.find(t => t.name === toolCall.name)
  if (!target) {
    return JSON.stringify({ error: `Tool ${toolCall.name} not found` })
  }
  try {
    const res = await target.invoke(toolCall.args, { configurable: { watchlist } })
    return typeof res === 'string' ? res : JSON.stringify(res)
  } catch (err) {
    return JSON.stringify({ error: err.message })
  }
}

/**
 * Main LangChain Agent Runner
 */
export async function runMovieMindAgent({ message, history = [], watchlist = [] }) {
  // 1. Check for valid Gemini API Key
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey === 'your_gemini_api_key_here' || !apiKey.trim()) {
    // If user is just saying hello/greeting
    const isGreeting = /^(hi|hii|hey|hello|yo|greetings|help)\b/i.test(message.trim())
    if (isGreeting) {
      return {
        message: "👋 Hello! I'm **MovieMind AI**. What kind of films are you in the mood for today?\n\nTry asking me for:\n- *\"Recommend movies like Interstellar\"*\n- *\"Top psychological thrillers\"*\n- *\"Best sci-fi films\"*\n\n*(💡 Add your free `GEMINI_API_KEY` to `.env` to enable live conversational AI with Gemini!)*",
        recommendations: []
      }
    }

    // Graceful offline fallback: run deterministic recommendation engine directly
    const recs = await computeRecommendations({
      referenceTitle: message,
      watchlist,
      limit: 3
    })

    return {
      message: `Based on **"${message}"**, here are top recommendations computed directly by our genre-vector recommendation engine:\n\n*(Add your \`GEMINI_API_KEY\` from [Google AI Studio](https://aistudio.google.com) to enable conversational AI!)*`,
      recommendations: recs.map(r => ({
        movieId: r.movieId,
        title: r.title,
        posterPath: r.posterPath,
        releaseDate: r.releaseDate,
        voteAverage: r.voteAverage,
        reason: `Cosine similarity match (${(r.score * 100).toFixed(0)}%).`,
        score: r.score
      }))
    }
  }

  try {
    const model = getGeminiModel()
    const modelWithTools = model.bindTools(allTools)

    // 2. Build Message Chain — exactly ONE SystemMessage for Gemini API
    let fullSystemInstruction = SYSTEM_PROMPT
    if (Array.isArray(watchlist) && watchlist.length > 0) {
      const titles = watchlist.slice(0, 6).map(m => m.title).join(', ')
      fullSystemInstruction += `\n\nUSER WATCHLIST CONTEXT:\nThe user has these films saved in their watchlist: ${titles}. Factor this preference context into your recommendations when relevant.`
    }

    const messages = [new SystemMessage(fullSystemInstruction)]

    // Add last 6 turns of conversation history (Human and AI only)
    const recentHistory = Array.isArray(history) ? history.slice(-6) : []
    for (const h of recentHistory) {
      if (h.role === 'user' && h.content) {
        messages.push(new HumanMessage(h.content))
      } else if (h.role === 'assistant' && h.content) {
        messages.push(new AIMessage(h.content))
      }
    }

    // Add current user prompt
    messages.push(new HumanMessage(message))

    // 3. First Invocation: Model decides whether to call tools
    const firstResponse = await modelWithTools.invoke(messages)

    // 4. Handle Tool Calls if Gemini requested them
    if (firstResponse.tool_calls && firstResponse.tool_calls.length > 0) {
      messages.push(firstResponse)

      // Execute each tool call and collect ToolMessages
      for (const tc of firstResponse.tool_calls) {
        const toolResult = await executeTool(tc, watchlist)
        messages.push(
          new ToolMessage({
            content: toolResult,
            tool_call_id: tc.id || tc.name,
            name: tc.name
          })
        )
      }

      // 5. Final Invocation with Structured Output
      const structuredModel = model.withStructuredOutput(ChatResponseSchema)
      const structuredResult = await structuredModel.invoke(messages)
      return structuredResult
    }

    // If no tools were called, check if response can be formatted via structured output
    // or return directly if conversational
    const textContent = typeof firstResponse.content === 'string'
      ? firstResponse.content
      : JSON.stringify(firstResponse.content)

    // For conversational responses without tool calls
    return {
      message: textContent,
      recommendations: []
    }
  } catch (err) {
    console.error('[MovieMindAgent] Agent error:', err)

    // Resilient fallback: compute deterministic recommendations
    try {
      const fallbackRecs = await computeRecommendations({
        referenceTitle: message,
        watchlist,
        limit: 3
      })

      return {
        message: `I encountered a temporary issue connecting to Gemini (${err.message}). Here are recommendations computed directly by our genre-vector recommendation engine:`,
        recommendations: fallbackRecs.map(r => ({
          movieId: r.movieId,
          title: r.title,
          posterPath: r.posterPath,
          releaseDate: r.releaseDate,
          voteAverage: r.voteAverage,
          reason: `Cosine similarity genre match (${(r.score * 100).toFixed(0)}%).`,
          score: r.score
        }))
      }
    } catch {
      return {
        message: `I ran into an issue processing your request: ${err.message}. Please try asking about a specific movie or genre.`,
        recommendations: []
      }
    }
  }
}
