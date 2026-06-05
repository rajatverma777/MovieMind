export default function StarRating({ rating }) {
  const n = Math.round((rating || 0) / 2)
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= n ? '#d4a843' : '#2a2a3a', fontSize: 12 }}>★</span>
      ))}
      <span style={{ color: '#d4a843', fontSize: 11, marginLeft: 3 }}>{rating?.toFixed(1)}</span>
    </span>
  )
}
