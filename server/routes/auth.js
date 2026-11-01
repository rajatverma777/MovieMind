// server/routes/auth.js — Authentication Endpoints via Better Auth & MongoDB
import express from 'express'
import { toNodeHandler, fromNodeHeaders } from 'better-auth/node'
import { auth, getMongoDb, getLatestResetToken } from '../auth.js'
import { DB } from '../db/index.js'
import crypto from 'crypto'

const router = express.Router()

// Helper to reliably forward Set-Cookie headers as separate array elements in Express
function forwardCookies(betterAuthRes, expressRes) {
  if (!betterAuthRes?.headers || !expressRes) return
  const rawCookies = betterAuthRes.headers.getSetCookie
    ? betterAuthRes.headers.getSetCookie()
    : [betterAuthRes.headers.get('set-cookie')].filter(Boolean)
  if (rawCookies && rawCookies.length > 0) {
    expressRes.setHeader('set-cookie', rawCookies)
  }
}

// ── Check Username Availability ──────────────────────────────────────────────
router.get('/check-username', async (req, res) => {
  try {
    const raw = req.query.u || req.query.username || ''
    const clean = raw.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
    if (!clean || clean.length < 3) {
      return res.json({ available: false, error: 'Username must be at least 3 characters.' })
    }
    const existing = await DB.findUserByUsername(clean)
    return res.json({ available: !existing, username: clean })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ── Check Email Availability ────────────────────────────────────────────────
router.get('/check-email', async (req, res) => {
  try {
    const raw = req.query.e || req.query.email || ''
    const clean = raw.trim().toLowerCase()
    if (!clean || !clean.includes('@')) {
      return res.json({ available: false, error: 'Valid email required.' })
    }
    const existing = await DB.findUserByEmail(clean)
    return res.json({ available: !existing, email: clean })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ── Get Current Session / Me (Dual: Better Auth Session + Bearer/Cookie Fallback) ──
router.get('/me', async (req, res) => {
  try {
    // 1. Try resolving session via Better Auth native session parser
    let session = null
    try {
      const fetchHeaders = fromNodeHeaders(req.headers)
      session = await auth.api.getSession({ headers: fetchHeaders })
    } catch {}

    if (session && session.user) {
      const userDoc = await DB.findUserById(session.user.id)
      return res.json({
        authenticated: true,
        user: userDoc || session.user,
        session: session.session,
        token: session.session?.token
      })
    }

    // 2. Resilient Fallback: Validate via Bearer Token or Cookie Token directly against MongoDB session collection
    const authHeader = req.headers.authorization || ''
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null
    const cookieHeader = req.headers.cookie || ''
    const cookieTokenMatch = cookieHeader.match(/better-auth\.session_token=([^;]+)/)
    const rawCookieToken = cookieTokenMatch ? decodeURIComponent(cookieTokenMatch[1]).split('.')[0] : null
    const token = bearerToken || rawCookieToken

    if (token) {
      const db = await getMongoDb()
      const dbSession = await db.collection('session').findOne({
        token,
        expiresAt: { $gt: new Date() }
      })
      if (dbSession) {
        const userDoc = await DB.findUserById(dbSession.userId)
        if (userDoc) {
          return res.json({
            authenticated: true,
            user: userDoc,
            session: dbSession,
            token: dbSession.token
          })
        }
      }
    }

    return res.status(401).json({ user: null, authenticated: false })
  } catch (err) {
    console.error('[Auth me error]:', err)
    return res.status(500).json({ error: err.message })
  }
})

// ── Custom Sign In (Supports Email OR Username + Remember Me) ───────────────
router.post('/login', async (req, res) => {
  try {
    const { loginId, email, username, password, rememberMe = true } = req.body || {}
    let targetEmail = email

    // If username or loginId is provided instead of email, resolve it
    const identifier = (loginId || username || email || '').trim()
    if (!identifier) {
      return res.status(400).json({ error: 'Email or username is required.' })
    }
    if (!password) {
      return res.status(400).json({ error: 'Password is required.' })
    }

    if (!identifier.includes('@')) {
      const u = await DB.findUserByUsername(identifier)
      if (!u || !u.email) {
        return res.status(400).json({ error: 'No user found with that username.' })
      }
      targetEmail = u.email
    } else {
      targetEmail = identifier
    }

    // Call Better Auth signInEmail
    const result = await auth.api.signInEmail({
      body: {
        email: targetEmail,
        password,
        rememberMe: !!rememberMe
      },
      headers: fromNodeHeaders(req.headers),
      asResponse: true
    })

    // Forward cookies safely as array
    forwardCookies(result, res)

    const data = await result.json()
    if (!result.ok) {
      return res.status(result.status || 400).json(data)
    }

    const token = data.token || data.session?.token
    const userProfile = await DB.findUserById(data.user?.id)
    return res.json({
      success: true,
      message: 'Logged in successfully!',
      user: userProfile || data.user,
      token
    })
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Login failed' })
  }
})

// ── Sign Up (Full Name, Username, Email, Password, Avatar, Genres) ──────────
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      displayName,
      username,
      email,
      password,
      avatar = '🎬',
      bio = '',
      favoriteGenres = [878, 53]
    } = req.body || {}

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required.' })
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' })
    }

    const cleanUsername = (username || email.split('@')[0])
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_]/g, '')

    // Check unique username
    const existingU = await DB.findUserByUsername(cleanUsername)
    if (existingU) {
      return res.status(400).json({ error: `Username @${cleanUsername} is already taken.` })
    }

    // Check unique email
    const existingE = await DB.findUserByEmail(email)
    if (existingE) {
      return res.status(400).json({ error: 'An account with this email already exists. Please log in.' })
    }

    // Call Better Auth signUpEmail
    const result = await auth.api.signUpEmail({
      body: {
        email: email.trim().toLowerCase(),
        password,
        name: displayName?.trim() || name?.trim() || cleanUsername,
        username: cleanUsername,
        avatar,
        bio: bio.trim(),
        favoriteGenres: JSON.stringify(favoriteGenres)
      },
      headers: fromNodeHeaders(req.headers),
      asResponse: true
    })

    // Forward cookies safely as array
    forwardCookies(result, res)

    const data = await result.json()
    if (!result.ok) {
      return res.status(result.status || 400).json(data)
    }

    // Populate initial preferences
    await DB.updateUserPreferences(data.user?.id, {
      favoriteGenres: Array.isArray(favoriteGenres) ? favoriteGenres : [878, 53]
    })

    const token = data.token || data.session?.token
    const userProfile = await DB.findUserById(data.user?.id)
    return res.json({
      success: true,
      message: 'Account created successfully!',
      user: userProfile || data.user,
      token
    })
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Registration failed' })
  }
})

// ── Sign Out ────────────────────────────────────────────────────────────────
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || ''
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null
    if (bearerToken) {
      const db = await getMongoDb()
      await db.collection('session').deleteOne({ token: bearerToken }).catch(() => {})
    }

    const result = await auth.api.signOut({
      headers: fromNodeHeaders(req.headers),
      asResponse: true
    })
    forwardCookies(result, res)
    return res.json({ success: true, message: 'Signed out successfully.' })
  } catch (err) {
    return res.json({ success: true, message: 'Signed out.' })
  }
})

// ── Forgot Password Token Generation ────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body || {}
    if (!email) return res.status(400).json({ error: 'Email is required.' })

    const clean = email.trim().toLowerCase()
    const user = await DB.findUserByEmail(clean)
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address.' })
    }

    // Trigger Better Auth native password reset token creation
    await auth.api.requestPasswordReset({
      body: { email: clean }
    })

    const token = getLatestResetToken(clean)

    return res.json({
      success: true,
      message: `Password reset instructions and token generated for ${clean}.`,
      token, // Returned for instant testing and UI fill
      expiresIn: '1 hour'
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ── Reset Password with Token ───────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body || {}
    if (!token || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Token and a new password (min 6 chars) are required.' })
    }

    // Call Better Auth native resetPassword
    await auth.api.resetPassword({
      body: {
        token: token.trim(),
        newPassword
      }
    })

    return res.json({
      success: true,
      message: 'Password reset successfully! Please sign in with your new password.'
    })
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Password reset failed.' })
  }
})

// ── Update Profile ──────────────────────────────────────────────────────────
router.put('/profile', async (req, res) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized. Please log in.' })
    }
    const { displayName, avatar, bio, favoriteGenres } = req.body || {}
    const updated = await DB.updateUserProfile(session.user.id, {
      displayName,
      avatar,
      bio,
      favoriteGenres
    })
    if (favoriteGenres) {
      await DB.updateUserPreferences(session.user.id, {
        favoriteGenres: Array.isArray(favoriteGenres) ? favoriteGenres : JSON.parse(favoriteGenres || '[]')
      }).catch(() => {})
    }
    return res.json({ success: true, user: updated })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ── Pass-through to Better Auth Native Node Handler ─────────────────────────
router.use(toNodeHandler(auth))

export default router
