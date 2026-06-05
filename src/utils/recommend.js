import { GID } from '@/data/constants'

export function buildGenreVector(movie) {
  const v = new Array(GID.length).fill(0)
  const ids = movie.genre_ids || (movie.genres || []).map(g => g.id)
  ids.forEach(id => { const i = GID.indexOf(+id); if (i >= 0) v[i] = 1 })
  return v
}

export function cosineSimilarity(a, b) {
  const dot = a.reduce((s, x, i) => s + x * b[i], 0)
  const ma  = Math.sqrt(a.reduce((s, x) => s + x * x, 0))
  const mb  = Math.sqrt(b.reduce((s, x) => s + x * x, 0))
  return ma && mb ? dot / (ma * mb) : 0
}

export function getRecommendations(liked, pool, n = 10) {
  if (!liked.length || !pool.length) return []
  const vecs = liked.map(buildGenreVector)
  const avg  = vecs
    .reduce((a, v) => a.map((x, i) => x + v[i]), new Array(GID.length).fill(0))
    .map(x => x / vecs.length)
  const ids  = new Set(liked.map(m => m.id))
  return pool
    .filter(m => !ids.has(m.id))
    .map(m => ({ ...m, _score: cosineSimilarity(avg, buildGenreVector(m)) }))
    .sort((a, b) => b._score - a._score)
    .slice(0, n)
}

export function genreAffinities(watchlist, gnMap) {
  const counts = {}
  watchlist.forEach(m => (m.genre_ids || []).forEach(id => { counts[id] = (counts[id] || 0) + 1 }))
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1
  return Object.entries(counts)
    .map(([id, count]) => ({ id: +id, name: gnMap[id] || '?', count, pct: Math.round(count / total * 100) }))
    .sort((a, b) => b.count - a.count)
}
