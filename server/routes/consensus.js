// server/routes/consensus.js
// "Couch Consensus" — Multi-User & Couples Taste Fusion Engine with Real-Time Live Rooms

import { Router } from 'express'
import { GID, GN, MOCK_MOVIES } from '../../src/data/constants.js'
import { buildGenreVector, cosineSimilarity } from '../../src/utils/recommend.js'

const router = Router()

// In-Memory Real-Time Live Rooms Store
const ROOMS = new Map()

// Clean up rooms older than 6 hours
setInterval(() => {
  const cutoff = Date.now() - (6 * 60 * 60 * 1000)
  for (const [id, room] of ROOMS.entries()) {
    if (room.createdAt < cutoff) ROOMS.delete(id)
  }
}, 30 * 60 * 1000)

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
router.post('/room/create', (req, res) => {
  try {
    const { hostName = 'Host', likedMovies = [], preferredGenreIds = [], roomId: customRoomId, hostId, userId, name } = req.body || {}
    const roomId = (customRoomId || `MIND-${Math.floor(1000 + Math.random() * 9000)}`).toUpperCase()
    const activeUserId = String(userId || hostId || 'host')
    const activeName = name || hostName

    let room = ROOMS.get(roomId)
    if (!room) {
      room = {
        roomId,
        createdAt: Date.now(),
        status: 'waiting',
        participants: {},
        results: null
      }
      ROOMS.set(roomId, room)
    }

    if (!room.participants) room.participants = {}
    if (!room.participants[activeUserId]) {
      room.participants[activeUserId] = {
        userId: activeUserId,
        name: activeName,
        likedMovies: Array.isArray(likedMovies) ? likedMovies : [],
        preferredGenreIds: Array.isArray(preferredGenreIds) ? preferredGenreIds : [],
        ready: false,
        lastUpdated: Date.now()
      }
    } else {
      if (activeName) room.participants[activeUserId].name = activeName
      if (likedMovies.length > 0) room.participants[activeUserId].likedMovies = likedMovies
      if (preferredGenreIds.length > 0) room.participants[activeUserId].preferredGenreIds = preferredGenreIds
    }

    return res.json(room)
  } catch (err) {
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
    const { publishEvent } = await import('../redis.js')
    const { DB } = await import('../db/index.js')
    const sender = await DB.findUserById(fromUserId)

    // 1. Broadcast real-time Redis notification
    await publishEvent(`chat:user:${toUserId}`, {
      type: 'consensus_invite',
      roomId,
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
    return res.status(500).json({ error: err.message })
  }
})

// Get live room status (polled by clients)
router.get('/room/:roomId', (req, res) => {
  const { roomId } = req.params
  const room = ROOMS.get(roomId.toUpperCase())
  if (!room) {
    return res.status(404).json({ error: 'Room not found or expired.' })
  }
  return res.json(room)
})

// Update selections by userId
router.post('/room/:roomId/update', (req, res) => {
  const { roomId } = req.params
  const { userId, name, likedMovies, preferredGenreIds, ready } = req.body || {}
  const room = ROOMS.get(roomId.toUpperCase())

  if (!room) {
    return res.status(404).json({ error: 'Room not found.' })
  }

  if (!room.participants) room.participants = {}
  const uid = String(userId || 'host')

  room.participants[uid] = {
    userId: uid,
    name: name || room.participants[uid]?.name || 'Participant',
    likedMovies: Array.isArray(likedMovies) ? likedMovies : (room.participants[uid]?.likedMovies || []),
    preferredGenreIds: Array.isArray(preferredGenreIds) ? preferredGenreIds : (room.participants[uid]?.preferredGenreIds || []),
    ready: typeof ready === 'boolean' ? ready : !!room.participants[uid]?.ready,
    lastUpdated: Date.now()
  }

  return res.json(room)
})

// Compute final consensus for room
router.post('/room/:roomId/compute', (req, res) => {
  const { roomId } = req.params
  const { userAId, userBId } = req.body || {}
  const room = ROOMS.get(roomId.toUpperCase())

  if (!room) {
    return res.status(404).json({ error: 'Room not found.' })
  }

  const keys = Object.keys(room.participants || {})
  const pA = room.participants?.[userAId] || room.participants?.[keys[0]]
  const pB = room.participants?.[userBId] || room.participants?.[keys[1]]

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

  return res.json(room)
})

export default router
