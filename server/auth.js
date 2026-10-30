// server/auth.js — Better Auth Configuration with MongoDB Atlas Adapter
import { betterAuth } from 'better-auth'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'
import { dash } from '@better-auth/infra'
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017'
const DB_NAME = process.env.MONGODB_DB_NAME || 'moviemind'

// Reuse MongoClient across serverless function invocations
let client
let db

export function getMongoClient() {
  if (!client) {
    client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000
    })
  }
  return client
}

export async function getMongoDb() {
  const c = getMongoClient()
  if (!db) {
    await c.connect().catch(err => {
      console.warn('[MongoDB] Reconnecting client:', err.message)
    })
    db = c.db(DB_NAME)
  }
  return db
}

// Initialize Better Auth with MongoDB Adapter
const mongoClient = getMongoClient()
const mongoDbInstance = mongoClient.db(DB_NAME)

const resetTokenStore = new Map()
export function getLatestResetToken(email) {
  return resetTokenStore.get(email.toLowerCase()) || null
}

export const auth = betterAuth({
  database: mongodbAdapter(mongoDbInstance),
  secret: process.env.BETTER_AUTH_SECRET || 'moviemind_super_secret_session_key_2026_xyz',
  baseURL: process.env.BETTER_AUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5001'),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    maxPasswordLength: 128,
    autoSignIn: true,
    sendResetPassword: async ({ user, url, token }) => {
      console.log(`[Password Reset Token for ${user.email}]: ${token}`)
      resetTokenStore.set(user.email.toLowerCase(), token)
    }
  },
  user: {
    additionalFields: {
      username: { type: 'string', required: false },
      avatar: { type: 'string', required: false, defaultValue: '🎬' },
      bio: { type: 'string', required: false, defaultValue: '' },
      favoriteGenres: { type: 'string', required: false, defaultValue: '[]' }
    }
  },
  session: {
    expiresIn: 30 * 24 * 60 * 60, // 30-day persistent session
    updateAge: 24 * 60 * 60, // 1-day refresh interval
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60
    }
  },
  plugins: [
    ...(process.env.BETTER_AUTH_API_KEY
      ? [dash({ apiKey: process.env.BETTER_AUTH_API_KEY })]
      : [])
  ]
})
