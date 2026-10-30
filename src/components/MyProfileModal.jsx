// src/components/MyProfileModal.jsx — View User Profile & Cinema Stats
import { useApp } from '@/context/AppContext'
import { GN } from '@/data/constants'

export default function MyProfileModal() {
  const { user, profileModalOpen, setProfileModalOpen, setEditProfileModalOpen, watchlist, navigate } = useApp()
  if (!profileModalOpen || !user) return null

  const genres = user.favoriteGenres || [878, 53]

  return (
    <div className="mod-bg" onClick={() => setProfileModalOpen(false)}>
      <div
        className="glass fu"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 480,
          background: '#0a0a16',
          borderRadius: 22,
          border: '1px solid rgba(255,255,255,0.12)',
          padding: '32px 26px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.88)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                background: 'rgba(229,9,20,0.15)',
                border: '2px solid rgba(229,9,20,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32
              }}
            >
              {user.avatar || '🎬'}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 24, color: 'white', fontFamily: "'Bebas Neue', cursive", letterSpacing: 1 }}>
                {user.displayName || user.name}
              </h3>
              <div style={{ fontSize: 13, color: '#e50914', fontWeight: 700 }}>@{user.username}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2, fontFamily: 'monospace' }}>
                UID: {user.id}
              </div>
            </div>
          </div>
          <button
            onClick={() => setProfileModalOpen(false)}
            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: 20, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Bio */}
        {user.bio ? (
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: 10, margin: '0 0 16px' }}>
            "{user.bio}"
          </p>
        ) : (
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', margin: '0 0 16px' }}>
            No bio added yet. Click Edit Profile to add your cinema mantra.
          </p>
        )}

        {/* Quick Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#e50914' }}>{watchlist.length}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Saved Movies</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#38bdf8' }}>{genres.length}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Top Genres</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>Active</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>MongoDB Session</div>
          </div>
        </div>

        {/* Favorite Genres Chips */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: 8 }}>
            Favorite Genres
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {genres.map(gid => (
              <span
                key={gid}
                style={{ background: 'rgba(229,9,20,0.15)', border: '1px solid rgba(229,9,20,0.3)', borderRadius: 12, padding: '3px 10px', fontSize: 11, color: '#ff6b6b' }}
              >
                {GN[gid] || `Genre ${gid}`}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => { setProfileModalOpen(false); setEditProfileModalOpen(true) }}
            className="btn-r"
            style={{ flex: 1, border: 'none', padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            ✏️ Edit Profile
          </button>
          <button
            onClick={() => { setProfileModalOpen(false); navigate('friends') }}
            style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            💬 Open Friends
          </button>
        </div>
      </div>
    </div>
  )
}
