// server/routes/consensus.js
// "Couch Consensus" — Multi-User & Couples Taste Fusion Engine with Real-Time Live Rooms

import { Router } from 'express'
import { GID, GN, MOCK_MOVIES } from '../../src/data/constants.js'
import { buildGenreVector, cosineSimilarity } from '../../src/utils/recommend.js'
import { getRedisPub, publishEvent } from '../redis.js'
import { DB } from '../db/index.js'

const router = Router()

// In-Memory Fast Cache (complemented by Upstash Redis and MongoDB Atlas)
const ROOMS = new Map()

// Clean up local cache rooms older than 6 hours
setInterval(() => {
  const cutoff = Date.now() - (6 * 60 * 60 * 1000)
  for (const [id, room] of ROOMS.entries()) {
    if (room.createdAt < cutoff) ROOMS.delete(id)
  }
}, 30 * 60 * 1000)

/**
 * Retrieve room from Upstash Redis, MongoDB Atlas, or local cache
 */
async function getRoom(roomId) {
  if (!roomId) return null
  const rid = String(roomId).toUpperCase()

  // 1. Check Redis (primary real-time shared state across all Vercel serverless instances)
  try {
    const pub = getRedisPub()
    if (pub) {
      const cached = await pub.get(`consensus:room:${rid}`)
      if (cached) {
        const parsed = JSON.parse(cached)
        ROOMS.set(rid, parsed)
        return parsed
      }
    }
  } catch (err) {
    console.warn('[Consensus] Redis get error:', err.message)
  }

  // 2. Check MongoDB Atlas (durable persistent fallback)
  try {
    const doc = await DB.getConsensusRoom(rid)
    if (doc) {
      ROOMS.set(rid, doc)
      // Re-seed Redis cache
      try {
        const pub = getRedisPub()
        if (pub) await pub.set(`consensus:room:${rid}`, JSON.stringify(doc), 'EX', 86400)
      } catch {}
      return doc
    }
  } catch (err) {
    console.warn('[Consensus] DB get error:', err.message)
  }

  // 3. Fallback to local memory cache
  return ROOMS.get(rid) || null
}

/**
 * Save room to local memory, Upstash Redis (with TTL), and MongoDB Atlas,
 * then broadcast real-time update event via Redis Pub/Sub to both participants
 */
async function saveRoom(roomId, room) {
  if (!roomId || !room) return
  const rid = String(roomId).toUpperCase()
  room.roomId = rid
  room.updatedAt = Date.now()

  // 1. Local memory cache
  ROOMS.set(rid, room)

  // 2. Upstash Redis (shared state across Vercel serverless functions, 24h TTL)
  try {
    const pub = getRedisPub()
    if (pub) {
      await pub.set(`consensus:room:${rid}`, JSON.stringify(room), 'EX', 86400)
    }
  } catch (err) {
    console.warn('[Consensus] Redis save error:', err.message)
  }

  // 3. MongoDB Atlas (durable persistence)
  try {
    await DB.saveConsensusRoom(rid, room)
  } catch (err) {
    console.warn('[Consensus] DB save error:', err.message)
  }

  // 4. Real-time Pub/Sub broadcast via Redis SSE
  try {
    // Broadcast on room channel
    await publishEvent(`consensus:room:${rid}`, {
      type: 'consensus_room_update',
      roomId: rid,
      room
    })

    // Broadcast directly to each participant's active SSE user channel
    const participantIds = Object.keys(room.participants || {})
    await Promise.all(
      participantIds.map(uid =>
        publishEvent(`chat:user:${uid}`, {
          type: 'consensus_room_update',
          roomId: rid,
          room
        })
      )
    )
  } catch (err) {
    console.warn('[Consensus] Broadcast error:', err.message)
  }
}

/**
 * Builds user composite vector from liked movies and direct genre picks
 */
function buildUserVector(likedMovies = [], preferredGenreIds = []) {
  const v = new Array(GID.length).fill(0)
  let count = 0

  if (Array.isArray(likedMovies) && likedMovies.length > 0) {
    likedMovies.forEach(m => {
      const mv = buildGenreVector(m)
      mv.forEach((val, i) => { v[i] += val })
      count++
    })
  }

  if (Array.isArray(preferredGenreIds) && preferredGenreIds.length > 0) {
    preferredGenreIds.forEach(gid => {
      const idx = GID.indexOf(Number(gid))
      if (idx >= 0) {
        v[idx] += 1.5
        count += 0.5
      }
    })
  }

  if (count === 0) return v
  return v.map(x => x / count)
}

/**
 * Calculates harmonic mean consensus ranking with Pareto fairness calibration
 */
export function computeConsensus({ userA, userB, pool = MOCK_MOVIES }) {
  const nameA = userA?.name || 'User 1'
  const nameB = userB?.name || 'User 2'

  const vecA = buildUserVector(userA?.likedMovies, userA?.preferredGenreIds)
  const vecB = buildUserVector(userB?.likedMovies, userB?.preferredGenreIds)

  // Identify genres both users share affinity for
  const sharedGenreNames = []
  GID.forEach((gid, i) => {
    if (vecA[i] > 0.1 && vecB[i] > 0.1) {
      sharedGenreNames.push(GN[gid])
    }
  })

  // Filter out movies both have already watched
  const watchedIds = new Set([
    ...(userA?.likedMovies || []).map(m => m.id),
    ...(userB?.likedMovies || []).map(m => m.id)
  ])

  const scored = pool
    .filter(m => !watchedIds.has(m.id))
    .map(movie => {
      const mv = buildGenreVector(movie)
      const simA = cosineSimilarity(vecA, mv)
      const simB = cosineSimilarity(vecB, mv)

      // Harmonic mean: penalizes asymmetric polarization
      const eps = 0.0001
      const harmonic = (2 * simA * simB) / (simA + simB + eps)

      // Fairness penalty: rewards films where satisfaction gap is small
      const gap = Math.abs(simA - simB)
      const fairness = Math.max(0, 1 - gap)

      // Blended consensus score
      const rawConsensus = (harmonic * 0.65) + (fairness * 0.20) + (((simA + simB) / 2) * 0.15)
      const consensusScore = Math.min(0.99, Math.max(0.1, Number(rawConsensus.toFixed(2))))

      // Derive explainable compromise reason
      const movieGenreNames = (movie.genres || (movie.genre_ids || []).map(id => GN[id])).filter(Boolean)
      const overlapGenres = movieGenreNames.filter(g => sharedGenreNames.includes(g))

      let reason = ""
      if (overlapGenres.length > 0) {
        reason = `Both share affinity for ${overlapGenres.join(' & ')}. Satisfies ${nameA} (${Math.round(simA * 100)}%) and ${nameB} (${Math.round(simB * 100)}%).`
      } else if (gap < 0.15) {
        reason = `Balanced neutral pick: Even satisfaction curve with zero genre polarization.`
      } else if (simA > simB) {
        reason = `Leans slightly toward ${nameA}'s preferred tropes while maintaining acceptable common ground for ${nameB}.`
      } else {
        reason = `Leans slightly toward ${nameB}'s preferred tropes while maintaining acceptable common ground for ${nameA}.`
      }

      return {
        ...movie,
        consensusScore,
        userAScore: Number(simA.toFixed(2)),
        userBScore: Number(simB.toFixed(2)),
        fairnessScore: Number(fairness.toFixed(2)),
        compromiseReason: reason
      }
    })
    .sort((a, b) => b.consensusScore - a.consensusScore)

  return {
    users: { nameA, nameB },
    sharedGenres: sharedGenreNames,
    recommendations: scored.slice(0, 12)
  }
}

// ── Direct Computation Endpoint ──────────────────────────────────────────────
router.post('/match', (req, res) => {
  try {
    const { userA, userB, candidatePool = [] } = req.body || {}
    if (!userA || !userB) {
      return res.status(400).json({ error: 'Both userA and userB profiles are required.' })
    }
    const pool = Array.isArray(candidatePool) && candidatePool.length > 0 ? candidatePool : MOCK_MOVIES
    const result = computeConsensus({ userA, userB, pool })
    return res.json(result)
  } catch (err) {
    console.error('[ConsensusRoute] Error:', err)
    return res.status(500).json({ error: 'Consensus calculation failed', message: err.message })
  }
})

// ── Real-Time Live Room Management ───────────────────────────────────────────

// Create or retrieve a collaborative room
router.post('/room/create', async (req, res) => {
  try {
    const { hostName = 'Host', likedMovies = [], preferredGenreIds = [], roomId: customRoomId, hostId, userId, name, ready } = req.body || {}
    const roomId = (customRoomId || `MIND-${Math.floor(1000 + Math.random() * 9000)}`).toUpperCase()
    const activeUserId = String(userId || hostId || 'host')
    const activeName = name || hostName

    let room = await getRoom(roomId)
    if (!room) {
      room = {
        roomId,
        createdAt: Date.now(),
        status: 'waiting',
        participants: {},
        results: null
      }
    }

    if (!room.participants) room.participants = {}
    const existingP = room.participants[activeUserId] || {}
    room.participants[activeUserId] = {
      userId: activeUserId,
      name: activeName || existingP.name || 'Participant',
      likedMovies: Array.isArray(likedMovies) ? likedMovies : (existingP.likedMovies || []),
      preferredGenreIds: Array.isArray(preferredGenreIds) ? preferredGenreIds : (existingP.preferredGenreIds || []),
      ready: typeof ready === 'boolean' ? ready : !!existingP.ready,
      lastUpdated: Date.now()
    }

    await saveRoom(roomId, room)
    return res.json(room)
  } catch (err) {
    console.error('[Consensus create error]:', err)
    return res.status(500).json({ error: err.message })
  }
})

// Send in-app Couch Consensus invite to friend via Upstash Redis
router.post('/invite', async (req, res) => {
  try {
    const { fromUserId, toUserId, roomId } = req.body || {}
    if (!fromUserId || !toUserId || !roomId) {
      return res.status(400).json({ error: 'fromUserId, toUserId, and roomId required' })
    }
    const sender = await DB.findUserById(fromUserId)

    // 1. Broadcast real-time Redis notification directly to friend's personal SSE channel
    await publishEvent(`chat:user:${toUserId}`, {
      type: 'consensus_invite',
      roomId: String(roomId).toUpperCase(),
      fromUser: sender,
      timestamp: Date.now()
    })

    // 2. Also drop a friendly message in their 1-on-1 chat
    await DB.sendMessage({
      fromUserId,
      toUserId,
      text: `🛋️ Couch Consensus: I invited you to a movie-matching session! Open Couch Consensus to pick our film tonight.`
    })

    return res.json({ success: true, message: 'Invite sent to friend!' })
  } catch (err) {
    console.error('[Consensus invite error]:', err)
    return res.status(500).json({ error: err.message })
  }
})

// Get live room status (polled by clients, backed by Upstash Redis and MongoDB Atlas)
router.get('/room/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params
    const room = await getRoom(roomId)
    if (!room) {
      return res.status(404).json({ error: 'Room not found or expired.' })
    }
    return res.json(room)
  } catch (err) {
    console.error('[Consensus get room error]:', err)
    return res.status(500).json({ error: err.message })
  }
})

// Update selections by userId — auto-upserts room and broadcasts instantly to both users
router.post('/room/:roomId/update', async (req, res) => {
  try {
    const { roomId } = req.params
    const { userId, name, likedMovies, preferredGenreIds, ready } = req.body || {}
    let room = await getRoom(roomId)

    if (!room) {
      room = {
        roomId: String(roomId).toUpperCase(),
        createdAt: Date.now(),
        status: 'waiting',
        participants: {},
        results: null
      }
    }

    if (!room.participants) room.participants = {}
    const uid = String(userId || 'host')
    const existingP = room.participants[uid] || {}

    room.participants[uid] = {
      userId: uid,
      name: name || existingP.name || 'Participant',
      likedMovies: Array.isArray(likedMovies) ? likedMovies : (existingP.likedMovies || []),
      preferredGenreIds: Array.isArray(preferredGenreIds) ? preferredGenreIds : (existingP.preferredGenreIds || []),
      ready: typeof ready === 'boolean' ? ready : !!existingP.ready,
      lastUpdated: Date.now()
    }

    await saveRoom(roomId, room)
    return res.json(room)
  } catch (err) {
    console.error('[Consensus update error]:', err)
    return res.status(500).json({ error: err.message })
  }
})

// Compute final consensus for room and broadcast results to both participants
router.post('/room/:roomId/compute', async (req, res) => {
  try {
    const { roomId } = req.params
    const { userAId, userBId } = req.body || {}
    const room = await getRoom(roomId)

    if (!room) {
      return res.status(404).json({ error: 'Room not found.' })
    }

    const keys = Object.keys(room.participants || {})
    const pA = room.participants?.[userAId] || room.participants?.[String(userAId)] || room.participants?.[keys[0]]
    const pB = room.participants?.[userBId] || room.participants?.[String(userBId)] || room.participants?.[keys[1]]

    if (!pA || !pB) {
      return res.status(400).json({ error: 'Both participants must join the room before computing.' })
    }

    const results = computeConsensus({
      userA: pA,
      userB: pB,
      pool: MOCK_MOVIES
    })

    room.results = results
    room.status = 'computed'

    await saveRoom(roomId, room)
    return res.json(room)
  } catch (err) {
    console.error('[Consensus compute error]:', err)
    return res.status(500).json({ error: err.message })
  }
})

export default router
