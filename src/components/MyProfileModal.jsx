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
        className="apple-glass-sheet fu"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 480,
          padding: '32px 28px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: 'rgba(229,9,20,0.18)',
                border: '1.5px solid rgba(229,9,20,0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                boxShadow: '0 8px 24px rgba(229,9,20,0.3), inset 0 1px 1px rgba(255,255,255,0.4)'
              }}
            >
              {user.avatar || '🎬'}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 24, color: 'white', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Bebas Neue', cursive", letterSpacing: 1 }}>
                {user.displayName || user.name}
              </h3>
              <div style={{ fontSize: 13, color: '#e50914', fontWeight: 700 }}>@{user.username}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', marginTop: 2, fontFamily: 'monospace' }}>
                UID: {user.id}
              </div>
            </div>
          </div>
          <button
            onClick={() => setProfileModalOpen(false)}
            className="apple-glass-btn"
            style={{ width: 32, height: 32, padding: 0, borderRadius: '50%', fontSize: 15 }}
          >
            ✕
          </button>
        </div>

        {/* Bio */}
        {user.bio ? (
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '11px 16px', borderRadius: 14, margin: '0 0 18px' }}>
            "{user.bio}"
          </p>
        ) : (
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', margin: '0 0 18px' }}>
            No bio added yet. Click Edit Profile to add your cinema mantra.
          </p>
        )}

        {/* Quick Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#e50914' }}>{watchlist.length}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>Saved Movies</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#38bdf8' }}>{genres.length}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>Top Genres</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>Active</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>MongoDB Session</div>
          </div>
        </div>

        {/* Favorite Genres Chips */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.4 }}>
            Favorite Genres
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {genres.map(gid => (
              <span
                key={gid}
                style={{ background: 'rgba(229,9,20,0.15)', border: '1px solid rgba(229,9,20,0.3)', borderRadius: 100, padding: '4px 12px', fontSize: 11, color: '#ff6b6b', fontWeight: 600 }}
              >
                {GN[gid] || `Genre ${gid}`}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => { setProfileModalOpen(false); setEditProfileModalOpen(true) }}
            className="apple-glass-btn-primary"
            style={{ flex: 1, padding: '12px 0', borderRadius: 100, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            ✏️ Edit Profile
          </button>
          <button
            onClick={() => { setProfileModalOpen(false); navigate('friends') }}
            className="apple-glass-btn"
            style={{ flex: 1, padding: '12px 0', borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            💬 Open Friends
          </button>
        </div>
      </div>
    </div>
  )
}
