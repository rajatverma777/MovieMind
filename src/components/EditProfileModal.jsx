// src/components/EditProfileModal.jsx — Edit Profile & Cinema Persona
import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { GN } from '@/data/constants'

const AVATARS = [
  { emoji: '🎬', label: 'Director' },
  { emoji: '🕶️', label: 'Neo / Noir' },
  { emoji: '🚀', label: 'Explorer' },
  { emoji: '🍿', label: 'Cinephile' },
  { emoji: '⚡', label: 'Hero' },
  { emoji: '🦁', label: 'Epic' },
  { emoji: '🎭', label: 'Drama' },
  { emoji: '🧙', label: 'Mystic' }
]

export default function EditProfileModal() {
  const { user, setUser, editProfileModalOpen, setEditProfileModalOpen } = useApp()
  if (!editProfileModalOpen || !user) return null

  const [displayName, setDisplayName] = useState(user.displayName || user.name || '')
  const [avatar, setAvatar] = useState(user.avatar || '🎬')
  const [bio, setBio] = useState(user.bio || '')
  const [favoriteGenres, setFavoriteGenres] = useState(user.favoriteGenres || [878, 53])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const toggleGenre = (gid) => {
    setFavoriteGenres(prev => (prev.includes(gid) ? prev.filter(x => x !== gid) : [...prev, gid]))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          displayName: displayName.trim(),
          avatar,
          bio: bio.trim(),
          favoriteGenres
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update profile.')

      setUser(data.user)
      setSuccess('Profile updated successfully in MongoDB Atlas!')
      setTimeout(() => {
        setEditProfileModalOpen(false)
      }, 1200)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mod-bg" onClick={() => setEditProfileModalOpen(false)}>
      <div
        className="glass fu"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 480,
          background: '#0a0a16',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.12)',
          padding: '28px 24px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.88)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>✏️</span>
            <div>
              <h3 style={{ margin: 0, fontSize: 20, color: 'white', fontFamily: "'Bebas Neue', cursive", letterSpacing: 1 }}>
                Edit Cinephile Profile
              </h3>
              <div style={{ fontSize: 11, color: '#e50914' }}>@{user.username}</div>
            </div>
          </div>
          <button
            onClick={() => setEditProfileModalOpen(false)}
            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: 20, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#fca5a5', marginBottom: 14 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#a7f3d0', marginBottom: 14 }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Display Name */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
              Display Name
            </label>
            <input
              type="text"
              className="cin-inp"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13 }}
              required
            />
          </div>

          {/* Avatar Persona */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>
              Avatar Persona
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {AVATARS.map(av => (
                <button
                  key={av.label}
                  type="button"
                  onClick={() => setAvatar(av.emoji)}
                  style={{
                    background: avatar === av.emoji ? 'rgba(229,9,20,0.2)' : 'rgba(255,255,255,0.04)',
                    border: avatar === av.emoji ? '1px solid #e50914' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    padding: '6px 4px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <span style={{ fontSize: 20 }}>{av.emoji}</span>
                  <span style={{ fontSize: 9, color: avatar === av.emoji ? '#ff4444' : 'rgba(255,255,255,0.6)' }}>{av.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
              Cinema Bio
            </label>
            <textarea
              className="cin-inp"
              rows={2}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="What kind of cinema moves you?"
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 12, resize: 'none' }}
            />
          </div>

          {/* Favorite Genres */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>
              Favorite Genres (Taste Match %)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {Object.entries(GN).slice(0, 10).map(([id, name]) => {
                const numId = Number(id)
                const sel = favoriteGenres.includes(numId)
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleGenre(numId)}
                    style={{
                      background: sel ? 'rgba(229,9,20,0.2)' : 'rgba(255,255,255,0.04)',
                      border: sel ? '1px solid #e50914' : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 14,
                      padding: '4px 10px',
                      fontSize: 11,
                      color: sel ? 'white' : 'rgba(255,255,255,0.6)',
                      cursor: 'pointer'
                    }}
                  >
                    {sel ? '✓ ' : ''}{name}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => setEditProfileModalOpen(false)}
              style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '11px 0', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-r"
              disabled={busy}
              style={{ flex: 1, border: 'none', padding: '11px 0', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer' }}
            >
              {busy ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
