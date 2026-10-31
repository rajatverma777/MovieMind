// server/db/index.js — MongoDB Atlas Production Database Layer
import mongoose from 'mongoose'
import { getMongoDb } from '../auth.js'
import { GID, GN, MOCK_MOVIES } from '../../src/data/constants.js'
import { cosineSimilarity } from '../../src/utils/recommend.js'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017'
const DB_NAME = process.env.MONGODB_DB_NAME || 'moviemind'

// Reuse Mongoose connection
let isMongooseConnected = false
let mongoosePromise = null

export async function connectDB() {
  if (isMongooseConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection
  }
  if (!mongoosePromise || mongoose.connection.readyState === 0) {
    mongoosePromise = mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME,
      serverSelectionTimeoutMS: 8000,
      maxPoolSize: 10
    })
  }
  await mongoosePromise
  isMongooseConnected = true
  return mongoose.connection
}

// ── Mongoose Schemas & Models ────────────────────────────────────────────────
const WatchlistSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  movie: { type: Object, required: true },
  addedAt: { type: Date, default: Date.now }
})
WatchlistSchema.index({ userId: 1, 'movie.id': 1 }, { unique: true })

const FriendRequestSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true, index: true },
  fromUserId: { type: String, required: true, index: true },
  toUserId: { type: String, required: true, index: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending', index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const MessageSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true, index: true },
  conversationId: { type: String, required: true, index: true },
  fromUserId: { type: String, required: true, index: true },
  toUserId: { type: String, required: true, index: true },
  text: { type: String, default: '' },
  movieRecommendation: { type: Object, default: null },
  delivered: { type: Boolean, default: false, index: true },
  deliveredAt: { type: Date, default: null },
  read: { type: Boolean, default: false, index: true },
  readAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now, index: true }
})

const PreferenceSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true, index: true },
  tasteSliders: {
    pacing: { type: Number, default: 50 },
    darkness: { type: Number, default: 50 },
    intensity: { type: Number, default: 50 },
    intellect: { type: Number, default: 50 },
    nostalgia: { type: Number, default: 50 }
  },
  favoriteGenres: { type: [Number], default: [878, 53] },
  updatedAt: { type: Date, default: Date.now }
})

const ConsensusVoteSchema = new mongoose.Schema({
  roomId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  movie: { type: Object, required: true },
  vote: { type: String, enum: ['yes', 'no'], required: true },
  createdAt: { type: Date, default: Date.now }
})

// Safe model retrieval avoiding Mongoose recompilation errors in serverless
export const WatchlistModel = mongoose.models.Watchlist || mongoose.model('Watchlist', WatchlistSchema)
export const FriendRequestModel = mongoose.models.FriendRequest || mongoose.model('FriendRequest', FriendRequestSchema)
export const MessageModel = mongoose.models.Message || mongoose.model('Message', MessageSchema)
export const PreferenceModel = mongoose.models.Preference || mongoose.model('Preference', PreferenceSchema)
export const ConsensusVoteModel = mongoose.models.ConsensusVote || mongoose.model('ConsensusVote', ConsensusVoteSchema)

// ── Taste Compatibility Metric Helper ────────────────────────────────────────
function hashString(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  h += h << 13
  h ^= h >>> 7
  h += h << 3
  h ^= h >>> 17
  h += h << 5
  return Math.abs(h >>> 0)
}

function getPairwiseAffinity(idA, idB) {
  if (!idA || !idB) return 0.76
  const sorted = [String(idA).trim(), String(idB).trim()].sort().join('::moviemind-cinema-dna::')
  const h = hashString(sorted)
  const val = 60 + (h % 34) // 60 to 93
  return val / 100
}

function getMovieGenreIds(m) {
  if (!m) return []
  if (Array.isArray(m.genre_ids)) return m.genre_ids.map(Number).filter(Boolean)
  if (Array.isArray(m.genres)) return m.genres.map(g => (typeof g === 'object' ? Number(g.id) : Number(g))).filter(Boolean)
  return []
}

function extractGenres(u, p) {
  let g = []
  if (p && Array.isArray(p.favoriteGenres) && p.favoriteGenres.length > 0) {
    g = p.favoriteGenres
  } else if (u) {
    try {
      g = Array.isArray(u.favoriteGenres) ? u.favoriteGenres : JSON.parse(u.favoriteGenres || '[]')
    } catch {
      g = []
    }
  }
  return g.map(Number).filter(Boolean)
}

function buildUserTasteVector(user, watchlist, pref) {
  const weights = {}
  // 1. Explicit genres (weight 3.0 each)
  const explicit = extractGenres(user, pref)
  explicit.forEach(gid => {
    weights[gid] = (weights[gid] || 0) + 3.0
  })

  // 2. Watchlist movies genres (weight 2.0 per genre occurrence)
  const wl = Array.isArray(watchlist) ? watchlist : []
  wl.forEach(item => {
    const movie = item.movie || item
    const gids = getMovieGenreIds(movie)
    gids.forEach(gid => {
      weights[gid] = (weights[gid] || 0) + 2.0
    })
  })

  return { weights, watchlistCount: wl.length }
}

function calculateCosine(vecA, vecB) {
  const allKeys = Array.from(new Set([...Object.keys(vecA.weights), ...Object.keys(vecB.weights)]))
  if (allKeys.length === 0) return 0.7
  let dot = 0, magA = 0, magB = 0
  allKeys.forEach(k => {
    const wA = vecA.weights[k] || 0
    const wB = vecB.weights[k] || 0
    dot += wA * wB
    magA += wA * wA
    magB += wB * wB
  })
  const denom = Math.sqrt(magA) * Math.sqrt(magB)
  return denom > 0 ? (dot / denom) : 0.7
}

export function calculateTasteCompatibility(userA, userB, watchlistA = [], watchlistB = [], prefA = null, prefB = null) {
  if (!userA || !userB) return 74

  const idA = userA.id || userA._id || (typeof userA === 'string' ? userA : '')
  const idB = userB.id || userB._id || (typeof userB === 'string' ? userB : '')
  if (idA && idB && String(idA) === String(idB)) return 100

  const baseAffinity = getPairwiseAffinity(idA, idB)
  const vecA = buildUserTasteVector(userA, watchlistA, prefA)
  const vecB = buildUserTasteVector(userB, watchlistB, prefB)

  const rawCosine = calculateCosine(vecA, vecB)
  const tasteSim = 0.40 + (rawCosine * 0.56)

  // Mutual movies in both watchlists
  const wlA = Array.isArray(watchlistA) ? watchlistA : []
  const wlB = Array.isArray(watchlistB) ? watchlistB : []
  let mutualBonus = 0
  if (wlA.length > 0 && wlB.length > 0) {
    const idsA = new Set(wlA.map(m => String((m.movie || m).id || (m.movie || m)._id)).filter(Boolean))
    const mutualCount = wlB.filter(m => idsA.has(String((m.movie || m).id || (m.movie || m)._id))).length
    mutualBonus = Math.min(0.12, mutualCount * 0.04)
  }

  // Equalizer Sliders
  let sliderSim = null
  const sA = prefA?.tasteSliders
  const sB = prefB?.tasteSliders
  if (sA && sB) {
    const keys = ['pacing', 'darkness', 'intensity', 'intellect', 'nostalgia']
    let diffSum = 0
    let count = 0
    keys.forEach(k => {
      if (typeof sA[k] === 'number' && typeof sB[k] === 'number') {
        diffSum += Math.abs(sA[k] - sB[k])
        count++
      }
    })
    if (count > 0) {
      const avgDiff = diffSum / (count * 100)
      sliderSim = 1 - (avgDiff * 0.65)
    }
  }

  const hasMovies = wlA.length > 0 || wlB.length > 0
  let finalScore
  if (sliderSim !== null) {
    finalScore = (tasteSim * (hasMovies ? 0.55 : 0.45)) + (sliderSim * 0.20) + (baseAffinity * (hasMovies ? 0.25 : 0.35)) + mutualBonus
  } else {
    finalScore = (tasteSim * (hasMovies ? 0.68 : 0.52)) + (baseAffinity * (hasMovies ? 0.32 : 0.48)) + mutualBonus
  }

  const percentage = Math.round(finalScore * 100)
  return Math.min(98, Math.max(52, percentage))
}

// Helper to sanitize user object for client
function sanitizeUser(u) {
  if (!u) return null
  const id = u.id || (u._id ? u._id.toString() : null)
  let favoriteGenres = []
  try {
    favoriteGenres = Array.isArray(u.favoriteGenres)
      ? u.favoriteGenres
      : JSON.parse(u.favoriteGenres || '[]')
  } catch {
    favoriteGenres = []
  }
  return {
    id,
    _id: id,
    name: u.name || u.displayName || u.username,
    displayName: u.displayName || u.name || u.username,
    username: u.username || (u.email ? u.email.split('@')[0] : 'cinephile'),
    email: u.email,
    avatar: u.avatar || '🎬',
    bio: u.bio || '',
    favoriteGenres,
    createdAt: u.createdAt
  }
}

// ── Unified Database API ─────────────────────────────────────────────────────
export const DB = {
  // ── USER MANAGEMENT ────────────────────────────────────────────────────────
  async findUserById(id) {
    if (!id) return null
    const db = await getMongoDb()
    const { ObjectId } = await import('mongodb')
    let user = null
    try {
      if (ObjectId.isValid(id)) {
        user = await db.collection('user').findOne({ _id: new ObjectId(id) })
      }
    } catch {}
    if (!user) {
      user = await db.collection('user').findOne({ id: String(id) })
    }
    return sanitizeUser(user)
  },

  async findUserByUsername(username) {
    if (!username) return null
    const clean = username.trim().toLowerCase().replace(/^@/, '')
    const db = await getMongoDb()
    const user = await db.collection('user').findOne({
      username: { $regex: new RegExp(`^${clean}$`, 'i') }
    })
    return sanitizeUser(user)
  },

  async findUserByEmail(email) {
    if (!email) return null
    const clean = email.trim().toLowerCase()
    const db = await getMongoDb()
    const user = await db.collection('user').findOne({
      email: { $regex: new RegExp(`^${clean}$`, 'i') }
    })
    return sanitizeUser(user)
  },

  async updateUserProfile(userId, { displayName, username, avatar, bio, favoriteGenres }) {
    const db = await getMongoDb()
    const { ObjectId } = await import('mongodb')
    const update = { updatedAt: new Date() }
    if (displayName !== undefined) update.name = displayName
    if (username !== undefined) update.username = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '')
    if (avatar !== undefined) update.avatar = avatar
    if (bio !== undefined) update.bio = bio
    if (favoriteGenres !== undefined) {
      update.favoriteGenres = Array.isArray(favoriteGenres) ? JSON.stringify(favoriteGenres) : String(favoriteGenres)
    }

    let filter = { id: String(userId) }
    try {
      if (ObjectId.isValid(userId)) {
        filter = { $or: [{ _id: new ObjectId(userId) }, { id: String(userId) }] }
      }
    } catch {}

    await db.collection('user').updateOne(filter, { $set: update })
    return this.findUserById(userId)
  },

  async searchUsers(query, excludeUserId) {
    const q = (query || '').trim().toLowerCase().replace(/^@/, '')
    if (!q) return []
    const db = await getMongoDb()
    const users = await db.collection('user').find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    }).limit(20).toArray()

    return users
      .map(sanitizeUser)
      .filter(u => u && u.id !== String(excludeUserId) && (!excludeUserId || u._id !== String(excludeUserId)))
  },

  // ── WATCHLIST (USER ISOLATED) ──────────────────────────────────────────────
  async getWatchlist(userId) {
    if (!userId) return []
    await connectDB()
    const items = await WatchlistModel.find({ userId: String(userId) }).sort({ addedAt: -1 }).lean()
    return items.map(it => it.movie)
  },

  async addToWatchlist(userId, movie) {
    if (!userId || !movie || !movie.id) return []
    await connectDB()
    await WatchlistModel.findOneAndUpdate(
      { userId: String(userId), 'movie.id': movie.id },
      { $set: { userId: String(userId), movie, addedAt: new Date() } },
      { upsert: true, new: true }
    )
    return this.getWatchlist(userId)
  },

  async removeFromWatchlist(userId, movieId) {
    if (!userId || !movieId) return []
    await connectDB()
    await WatchlistModel.deleteOne({ userId: String(userId), 'movie.id': Number(movieId) })
    return this.getWatchlist(userId)
  },

  async isMovieInWatchlist(userId, movieId) {
    if (!userId || !movieId) return false
    await connectDB()
    const found = await WatchlistModel.findOne({ userId: String(userId), 'movie.id': Number(movieId) }).lean()
    return !!found
  },

  // ── FRIEND REQUESTS & SOCIAL GRAPH ─────────────────────────────────────────
  async sendFriendRequest(fromUserId, toUserId) {
    if (fromUserId === toUserId) throw new Error('Cannot send friend request to yourself.')
    await connectDB()

    // Verify recipient exists
    const recipient = await this.findUserById(toUserId)
    if (!recipient) throw new Error('User not found.')

    // Check if already friends
    const existingFriendship = await FriendRequestModel.findOne({
      $or: [
        { fromUserId, toUserId, status: 'accepted' },
        { fromUserId: toUserId, toUserId: fromUserId, status: 'accepted' }
      ]
    })
    if (existingFriendship) throw new Error('You are already friends.')

    // Check for pending request
    const pending = await FriendRequestModel.findOne({
      $or: [
        { fromUserId, toUserId, status: 'pending' },
        { fromUserId: toUserId, toUserId: fromUserId, status: 'pending' }
      ]
    })
    if (pending) {
      if (pending.fromUserId === fromUserId) throw new Error('Friend request already sent.')
      // Auto-accept if recipient had already sent a request to you!
      pending.status = 'accepted'
      pending.updatedAt = new Date()
      await pending.save()
      return pending.toObject()
    }

    const reqId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const newReq = await FriendRequestModel.create({
      id: reqId,
      fromUserId: String(fromUserId),
      toUserId: String(toUserId),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    return newReq.toObject()
  },

  async getFriendRequests(userId) {
    await connectDB()
    const uid = String(userId)
    const incoming = await FriendRequestModel.find({ toUserId: uid, status: 'pending' }).sort({ createdAt: -1 }).lean()
    const outgoing = await FriendRequestModel.find({ fromUserId: uid, status: 'pending' }).sort({ createdAt: -1 }).lean()

    // Attach sender & receiver details
    const enrich = async (reqs, isIncoming) => {
      const list = []
      for (const r of reqs) {
        const otherId = isIncoming ? r.fromUserId : r.toUserId
        const otherUser = await this.findUserById(otherId)
        const reqId = r.id || (r._id ? r._id.toString() : null)
        list.push({
          ...r,
          id: reqId,
          user: otherUser || { id: otherId, name: 'Cinephile', username: 'user', avatar: '🎬' },
          fromUser: isIncoming ? otherUser : await this.findUserById(r.fromUserId),
          toUser: isIncoming ? await this.findUserById(r.toUserId) : otherUser
        })
      }
      return list
    }

    return {
      incoming: await enrich(incoming, true),
      outgoing: await enrich(outgoing, false)
    }
  },

  async respondFriendRequest(requestId, action, userId) {
    await connectDB()
    const { ObjectId } = await import('mongodb')
    let req = null
    try {
      if (ObjectId.isValid(requestId)) {
        req = await FriendRequestModel.findOne({ $or: [{ id: requestId }, { _id: new ObjectId(requestId) }] })
      }
    } catch {}
    if (!req) {
      req = await FriendRequestModel.findOne({ id: requestId })
    }
    if (!req) throw new Error('Friend request not found.')
    if (userId && String(req.toUserId) !== String(userId)) {
      throw new Error('Not authorized to respond to this request.')
    }

    if (action === 'accept') {
      req.status = 'accepted'
    } else {
      req.status = 'declined'
    }
    req.updatedAt = new Date()
    await req.save()
    return req.toObject()
  },

  async cancelFriendRequest(requestId, userId) {
    await connectDB()
    const { ObjectId } = await import('mongodb')
    let filter = { id: requestId, fromUserId: String(userId) }
    try {
      if (ObjectId.isValid(requestId)) {
        filter = { $or: [{ id: requestId }, { _id: new ObjectId(requestId) }], fromUserId: String(userId) }
      }
    } catch {}
    const res = await FriendRequestModel.deleteOne(filter)
    return res.deletedCount > 0
  },

  async getUserFriends(userId) {
    await connectDB()
    const uid = String(userId)
    const accepted = await FriendRequestModel.find({
      $or: [
        { fromUserId: uid, status: 'accepted' },
        { toUserId: uid, status: 'accepted' }
      ]
    }).lean()

    const friendIds = accepted.map(r => r.fromUserId === uid ? r.toUserId : r.fromUserId)
    const friends = []
    for (const fid of friendIds) {
      const u = await this.findUserById(fid)
      if (u) friends.push(u)
    }
    return friends
  },

  async areFriends(userA, userB) {
    if (!userA || !userB) return false
    await connectDB()
    const uA = String(userA)
    const uB = String(userB)
    const friendship = await FriendRequestModel.findOne({
      $or: [
        { fromUserId: uA, toUserId: uB, status: 'accepted' },
        { fromUserId: uB, toUserId: uA, status: 'accepted' }
      ]
    }).lean()
    return !!friendship
  },

  async removeFriend(userA, userB) {
    if (!userA || !userB) return false
    await connectDB()
    const uA = String(userA)
    const uB = String(userB)
    const res = await FriendRequestModel.deleteMany({
      $or: [
        { fromUserId: uA, toUserId: uB },
        { fromUserId: uB, toUserId: uA }
      ]
    })
    return res.deletedCount > 0
  },

  async getRecentChatUsers(userId) {
    await connectDB()
    const uid = String(userId)
    const msgs = await MessageModel.find({
      $or: [{ fromUserId: uid }, { toUserId: uid }]
    }).sort({ createdAt: -1 }).limit(100).lean()

    const userIds = new Set()
    msgs.forEach(m => {
      const other = m.fromUserId === uid ? m.toUserId : m.fromUserId
      if (other && other !== uid) userIds.add(other)
    })

    const users = []
    for (const id of userIds) {
      const u = await this.findUserById(id)
      if (u) users.push(u)
    }
    return users
  },

  // ── MESSAGES & 1-ON-1 CHAT ─────────────────────────────────────────────────
  getConversationId(userA, userB) {
    return [String(userA), String(userB)].sort().join('__')
  },

  async sendMessage({ fromUserId, toUserId, text = '', movieRecommendation = null, isDelivered = false }) {
    if (!fromUserId || !toUserId) throw new Error('fromUserId and toUserId are required.')
    await connectDB()
    const conversationId = this.getConversationId(fromUserId, toUserId)
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

    const newMsg = await MessageModel.create({
      id: msgId,
      conversationId,
      fromUserId: String(fromUserId),
      toUserId: String(toUserId),
      text: text.trim(),
      movieRecommendation,
      delivered: !!isDelivered,
      deliveredAt: isDelivered ? new Date() : null,
      read: false,
      readAt: null,
      createdAt: new Date()
    })
    return newMsg.toObject()
  },

  async getConversation(userA, userB, limit = 50) {
    await connectDB()
    const conversationId = this.getConversationId(userA, userB)
    const messages = await MessageModel.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean()
    return messages
  },

  async markMessagesAsDelivered(toUserId, messageIds = null) {
    await connectDB()
    const query = { toUserId: String(toUserId), delivered: false }
    if (messageIds && messageIds.length > 0) {
      query.id = { $in: messageIds }
    }
    const result = await MessageModel.updateMany(
      query,
      { $set: { delivered: true, deliveredAt: new Date() } }
    )
    return result.modifiedCount || 0
  },

  async markMessagesAsRead(toUserId, fromUserId) {
    await connectDB()
    const conversationId = this.getConversationId(toUserId, fromUserId)
    const now = new Date()
    const result = await MessageModel.updateMany(
      { conversationId, toUserId: String(toUserId), read: false },
      { $set: { read: true, readAt: now, delivered: true, deliveredAt: now } }
    )
    return result.modifiedCount || 0
  },

  async getUnreadCount(userId) {
    await connectDB()
    const count = await MessageModel.countDocuments({
      toUserId: String(userId),
      read: false
    })
    return count
  },

  // ── TASTE PREFERENCES & CONSENSUS VOTES ─────────────────────────────────────
  async getUserPreferences(userId) {
    await connectDB()
    const pref = await PreferenceModel.findOne({ userId: String(userId) }).lean()
    if (!pref) {
      return {
        userId: String(userId),
        tasteSliders: { pacing: 50, darkness: 50, intensity: 50, intellect: 50, nostalgia: 50 },
        favoriteGenres: [878, 53]
      }
    }
    return pref
  },

  async updateUserPreferences(userId, prefs) {
    await connectDB()
    const updated = await PreferenceModel.findOneAndUpdate(
      { userId: String(userId) },
      { $set: { ...prefs, userId: String(userId), updatedAt: new Date() } },
      { upsert: true, new: true }
    ).lean()
    return updated
  },

  async recordConsensusVote(roomId, userId, movie, vote) {
    await connectDB()
    const newVote = await ConsensusVoteModel.create({
      roomId: String(roomId),
      userId: String(userId),
      movie,
      vote,
      createdAt: new Date()
    })
    return newVote.toObject()
  },

  async getConsensusVotes(roomId) {
    await connectDB()
    const votes = await ConsensusVoteModel.find({ roomId: String(roomId) }).lean()
    return votes
  }
}
