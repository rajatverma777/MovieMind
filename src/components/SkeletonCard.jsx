export default function SkeletonCard({ w = 160, h = 240 }) {
  return <div className="shimmer" style={{ width: w, height: h, borderRadius: 10, flexShrink: 0 }} />
}
