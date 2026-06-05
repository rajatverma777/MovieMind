export default function SearchBar({ value, onChange, placeholder = 'Search movies, actors, genres...' }) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', fontSize: 17, color: 'rgba(255,255,255,.33)', pointerEvents: 'none' }}>🔍</span>
      <input
        className="cin-inp"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', padding: '14px 46px', borderRadius: 12, fontSize: 15, fontFamily: "'DM Sans',sans-serif" }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.35)', fontSize: 18 }}
        >✕</button>
      )}
    </div>
  )
}
