export default function Spinner({ size = 28 }) {
  return (
    <div
      className="spin-a"
      style={{
        width: size, height: size, flexShrink: 0,
        border: `${Math.max(2, size / 10)}px solid rgba(255,255,255,0.12)`,
        borderTopColor: 'rgba(255,255,255,0.85)',
        borderRadius: '50%',
      }}
    />
  )
}
