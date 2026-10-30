// server/redis.js — Upstash Redis TLS Client & Pub/Sub Messaging
import Redis from 'ioredis'

const REDIS_URL = process.env.REDIS_URL

let pubClient = null
let subClient = null
let isConnected = false

export function getRedisPub() {
  if (!pubClient && REDIS_URL) {
    try {
      pubClient = new Redis(REDIS_URL, {
        tls: { rejectUnauthorized: false },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: false,
        reconnectOnError: () => 1
      })
      pubClient.on('connect', () => {
        isConnected = true
        console.log('⚡ Upstash Redis Publisher connected')
      })
      pubClient.on('error', (err) => {
        console.warn('⚠️ Redis Publisher error:', err.message)
      })
    } catch (err) {
      console.warn('⚠️ Could not initialize Redis Publisher:', err.message)
    }
  }
  return pubClient
}

export function createRedisSub() {
  if (!REDIS_URL) return null
  try {
    const sub = new Redis(REDIS_URL, {
      tls: { rejectUnauthorized: false },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
      reconnectOnError: () => 1
    })
    sub.on('error', (err) => {
      console.warn('⚠️ Redis Subscriber error:', err.message)
    })
    return sub
  } catch (err) {
    console.warn('⚠️ Could not initialize Redis Subscriber:', err.message)
    return null
  }
}

export function isRedisActive() {
  return isConnected && !!pubClient
}

// ── Messaging Event Helpers ──────────────────────────────────────────────────
export async function publishEvent(channel, event) {
  const pub = getRedisPub()
  if (!pub) return false
  try {
    await pub.publish(channel, JSON.stringify(event))
    return true
  } catch (err) {
    console.warn(`[Redis] Failed to publish on ${channel}:`, err.message)
    return false
  }
}

export async function setUserPresence(userId, status = 'online') {
  const pub = getRedisPub()
  if (!pub || !userId) return
  try {
    const uid = String(userId)
    if (status === 'online') {
      await pub.set(`presence:${uid}`, 'online', 'EX', 45) // 45s TTL
    } else {
      await pub.del(`presence:${uid}`)
    }
    // Broadcast presence update with explicit type and channel
    await publishEvent('chat:presence', { type: 'presence', userId: uid, status, timestamp: Date.now() })
  } catch (err) {
    console.warn('[Redis] Set presence error:', err.message)
  }
}

export async function getUserPresence(userId) {
  const pub = getRedisPub()
  if (!pub || !userId) return 'offline'
  try {
    const val = await pub.get(`presence:${userId}`)
    return val === 'online' ? 'online' : 'offline'
  } catch {
    return 'offline'
  }
}

export async function getMultiplePresence(userIds = []) {
  const pub = getRedisPub()
  if (!pub || !userIds.length) return {}
  try {
    const pipeline = pub.pipeline()
    userIds.forEach(id => pipeline.get(`presence:${id}`))
    const results = await pipeline.exec()
    const map = {}
    userIds.forEach((id, i) => {
      const res = results[i] && results[i][1]
      map[id] = res === 'online' ? 'online' : 'offline'
    })
    return map
  } catch {
    const fallback = {}
    userIds.forEach(id => { fallback[id] = 'offline' })
    return fallback
  }
}
