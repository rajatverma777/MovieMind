import { TMDB_BASE, imgUrl } from '@/data/constants'

export function createTMDBService(apiKey) {
  const q = (ep, p = {}) =>
    fetch(`${TMDB_BASE}${ep}?${new URLSearchParams({ api_key: apiKey, ...p })}`)
      .then(r => r.ok ? r.json() : Promise.reject(r))

  return {
    trending:  ()   => q('/trending/movie/week'),
    popular:   ()   => q('/movie/popular'),
    topRated:  ()   => q('/movie/top_rated'),
    nowPlay:   ()   => q('/movie/now_playing'),
    search:    s    => q('/search/movie', { query: s }),
    detail:    id   => q(`/movie/${id}`, { append_to_response: 'videos,credits,similar' }),
    genre:     ids  => q('/discover/movie', { with_genres: ids.join(','), sort_by: 'popularity.desc' }),
    img:       imgUrl,
    async validate() {
      try { const r = await fetch(`${TMDB_BASE}/movie/popular?api_key=${apiKey}`); return r.ok }
      catch { return false }
    }
  }
}
