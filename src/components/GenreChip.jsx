import { GN } from '@/data/constants'

export default function GenreChip({ id }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase',
      padding: '3px 9px', borderRadius: 20,
      background: 'rgba(229,9,20,.11)', color: '#e50914', border: '1px solid rgba(229,9,20,.28)',
    }}>
      {GN[id] || '?'}
    </span>
  )
}
