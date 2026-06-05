export default function Spinner({ size = 28 }) {
  return (
    <div
      className="spin-a"
      style={{
        width: size, height: size, flexShrink: 0,
        border: `${Math.max(2, size / 10)}px solid rgba(229,9,20,.18)`,
        borderTopColor: '#e50914',
        borderRadius: '50%',
      }}
    />
  )
}
