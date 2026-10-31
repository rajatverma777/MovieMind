// src/components/MovieShareModal.jsx
// In-Chat Movie Recommender Drawer: Pick any film and share it as an interactive card

import { useState } from 'react'
import { MOCK_MOVIES, GN, imgUrl } from '@/data/constants'

export default function MovieShareModal({ isOpen, onClose, onShareMovie, recipientName }) {
  const [query, setQuery] = useState('')
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [personalNote, setPersonalNote] = useState('You have to watch this! The plot and cinematography are unbelievable.')

  if (!isOpen) return null

  const filtered = MOCK_MOVIES.filter(m =>
    !query.trim() || m.title.toLowerCase().includes(query.toLowerCase())
  )

  const handleSend = () => {
    if (!selectedMovie) return
    const recPayload = {
      id: selectedMovie.id,
      title: selectedMovie.title,
      poster_path: selectedMovie.poster_path,
      vote_average: selectedMovie.vote_average,
      release_date: selectedMovie.release_date,
      genres: (selectedMovie.genre_ids || []).map(id => GN[id]).filter(Boolean),
      personalNote: personalNote.trim(),
      status: 'suggested'
    }
    onShareMovie(recPayload)
    onClose()
  }

  return (
    <div className="mod-bg" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="glass ch"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 520, borderRadius: 16, background: '#0e0e1c',
          border: '1px solid rgba(255,255,255,.12)', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,.9)'
        }}
      >
        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 22, color: 'white', letterSpacing: '.5px', margin: 0 }}>
              🎬 Recommend Movie to {recipientName || 'Friend'}
            </h3>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>
              Sends an interactive movie card directly into your chat with live trailer & watchlist actions.
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', fontSize: 20, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: 22 }}>
          {/* Search Catalog */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', marginBottom: 6 }}>
              1. Select Movie to Recommend:
            </label>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by title (e.g. Inception, Whiplash)..."
              style={{
                width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 8, padding: '9px 12px', color: 'white', fontSize: 13, outline: 'none'
              }}
            />
          </div>

          {/* Movie Carousel / Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(90px,1fr))', gap: 8, maxHeight: 180, overflowY: 'auto', marginBottom: 16, paddingRight: 4 }}>
            {filtered.map(m => {
              const isSelected = selectedMovie?.id === m.id
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMovie(m)}
                  style={{
                    background: isSelected ? 'rgba(229,9,20,.25)' : 'rgba(255,255,255,.03)',
                    border: isSelected ? '2px solid #e50914' : '1px solid rgba(255,255,255,.06)',
                    borderRadius: 8, padding: 5, textAlign: 'center', cursor: 'pointer', transition: 'all .2s'
                  }}
                >
                  <img
                    src={imgUrl(m.poster_path, 'w92')}
                    alt={m.title}
                    style={{ width: '100%', height: 74, objectFit: 'cover', borderRadius: 4, marginBottom: 4 }}
                  />
                  <div style={{ fontSize: 10, color: 'white', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.title}
                  </div>
                  <div style={{ fontSize: 9, color: '#d4a843' }}>⭐{m.vote_average?.toFixed(1)}</div>
                </div>
              )
            })}
          </div>

          {/* Selected Preview Box */}
          {selectedMovie && (
            <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: 12, display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
              <img
                src={imgUrl(selectedMovie.poster_path, 'w92')}
                alt={selectedMovie.title}
                style={{ width: 44, height: 64, borderRadius: 6, objectFit: 'cover' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{selectedMovie.title}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>
                  ⭐ {selectedMovie.vote_average?.toFixed(1)} · {selectedMovie.release_date?.split('-')[0]} · {(selectedMovie.genre_ids || []).map(id => GN[id]).slice(0, 2).join(', ')}
                </div>
              </div>
            </div>
          )}

          {/* Personal Note */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', marginBottom: 6 }}>
              2. Add Your Personal Note / Reason:
            </label>
            <textarea
              rows={3}
              value={personalNote}
              onChange={e => setPersonalNote(e.target.value)}
              placeholder="Tell them why they should watch it..."
              style={{
                width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 8, padding: '10px 12px', color: 'white', fontSize: 12, outline: 'none', resize: 'none'
              }}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            style={{
              width: '100%', background: 'linear-gradient(135deg,#e50914,#8b5cf6)', border: 'none',
              borderRadius: 8, padding: '12px 0', color: 'white', fontFamily: "'DM Sans',sans-serif",
              fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all .2s'
            }}
          >
            🚀 Send Recommendation Card
          </button>
        </div>
      </div>
    </div>
  )
}
