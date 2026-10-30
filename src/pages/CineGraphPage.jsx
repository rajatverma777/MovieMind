// src/pages/CineGraphPage.jsx
// CineGraph: Interactive Force-Directed Cinematic Knowledge Graph & "Six Degrees of Cinema" Pathfinder

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useApp } from '@/context/AppContext'
import { MOCK_MOVIES, GN, imgUrl } from '@/data/constants'

// Curated cinematic knowledge graph dataset
const GRAPH_NODES = [
  // Movies
  { id: 'm-inception', label: 'Inception', type: 'movie', movieId: 27205, year: '2010', color: '#e50914', r: 22 },
  { id: 'm-interstellar', label: 'Interstellar', type: 'movie', movieId: 157336, year: '2014', color: '#e50914', r: 22 },
  { id: 'm-dark-knight', label: 'The Dark Knight', type: 'movie', movieId: 155, year: '2008', color: '#e50914', r: 22 },
  { id: 'm-oppenheimer', label: 'Oppenheimer', type: 'movie', movieId: 872585, year: '2023', color: '#e50914', r: 22 },
  { id: 'm-pulp-fiction', label: 'Pulp Fiction', type: 'movie', movieId: 680, year: '1994', color: '#e50914', r: 22 },
  { id: 'm-fight-club', label: 'Fight Club', type: 'movie', movieId: 550, year: '1999', color: '#e50914', r: 22 },
  { id: 'm-godfather', label: 'The Godfather', type: 'movie', movieId: 238, year: '1972', color: '#e50914', r: 22 },
  { id: 'm-whiplash', label: 'Whiplash', type: 'movie', movieId: 244786, year: '2014', color: '#e50914', r: 22 },
  { id: 'm-la-la-land', label: 'La La Land', type: 'movie', movieId: 313369, year: '2016', color: '#e50914', r: 22 },
  { id: 'm-blade-runner', label: 'Blade Runner 2049', type: 'movie', movieId: 335984, year: '2017', color: '#e50914', r: 22 },
  { id: 'm-dune', label: 'Dune: Part One', type: 'movie', movieId: 438631, year: '2021', color: '#e50914', r: 22 },

  // Directors
  { id: 'd-nolan', label: 'Christopher Nolan', type: 'director', color: '#8b5cf6', r: 18 },
  { id: 'd-tarantino', label: 'Quentin Tarantino', type: 'director', color: '#8b5cf6', r: 18 },
  { id: 'd-fincher', label: 'David Fincher', type: 'director', color: '#8b5cf6', r: 18 },
  { id: 'd-coppola', label: 'Francis Ford Coppola', type: 'director', color: '#8b5cf6', r: 18 },
  { id: 'd-chazelle', label: 'Damien Chazelle', type: 'director', color: '#8b5cf6', r: 18 },
  { id: 'd-villeneuve', label: 'Denis Villeneuve', type: 'director', color: '#8b5cf6', r: 18 },

  // Actors
  { id: 'a-dicaprio', label: 'Leonardo DiCaprio', type: 'actor', color: '#0ea5e9', r: 16 },
  { id: 'a-murphy', label: 'Cillian Murphy', type: 'actor', color: '#0ea5e9', r: 16 },
  { id: 'a-bale', label: 'Christian Bale', type: 'actor', color: '#0ea5e9', r: 16 },
  { id: 'a-pitt', label: 'Brad Pitt', type: 'actor', color: '#0ea5e9', r: 16 },
  { id: 'a-gosling', label: 'Ryan Gosling', type: 'actor', color: '#0ea5e9', r: 16 },
  { id: 'a-pacino', label: 'Al Pacino', type: 'actor', color: '#0ea5e9', r: 16 },
  { id: 'a-teller', label: 'Miles Teller', type: 'actor', color: '#0ea5e9', r: 16 },
  { id: 'a-chalamet', label: 'Timothée Chalamet', type: 'actor', color: '#0ea5e9', r: 16 },

  // Cinematographers / Composers
  { id: 'c-zimmer', label: 'Hans Zimmer', type: 'composer', color: '#d4a843', r: 15 },
  { id: 'c-hoytema', label: 'Hoyte van Hoytema', type: 'cinematographer', color: '#d4a843', r: 15 },
  { id: 'c-deakins', label: 'Roger Deakins', type: 'cinematographer', color: '#d4a843', r: 15 },

  // Thematic Movements
  { id: 't-scifi', label: 'Mind-Bending Sci-Fi', type: 'theme', color: '#10b981', r: 14 },
  { id: 't-noir', label: 'Neo-Noir / Crime', type: 'theme', color: '#10b981', r: 14 }
]

const GRAPH_LINKS = [
  // Nolan Collaborations
  { source: 'd-nolan', target: 'm-inception', relation: 'Directed' },
  { source: 'd-nolan', target: 'm-interstellar', relation: 'Directed' },
  { source: 'd-nolan', target: 'm-dark-knight', relation: 'Directed' },
  { source: 'd-nolan', target: 'm-oppenheimer', relation: 'Directed' },
  { source: 'a-dicaprio', target: 'm-inception', relation: 'Starred in' },
  { source: 'a-murphy', target: 'm-inception', relation: 'Starred in' },
  { source: 'a-murphy', target: 'm-dark-knight', relation: 'Starred in' },
  { source: 'a-murphy', target: 'm-oppenheimer', relation: 'Starred in' },
  { source: 'a-bale', target: 'm-dark-knight', relation: 'Starred in' },
  { source: 'c-zimmer', target: 'm-inception', relation: 'Scored by' },
  { source: 'c-zimmer', target: 'm-interstellar', relation: 'Scored by' },
  { source: 'c-zimmer', target: 'm-dark-knight', relation: 'Scored by' },
  { source: 'c-zimmer', target: 'm-dune', relation: 'Scored by' },
  { source: 'c-hoytema', target: 'm-interstellar', relation: 'Cinematography' },
  { source: 'c-hoytema', target: 'm-oppenheimer', relation: 'Cinematography' },

  // Tarantino
  { source: 'd-tarantino', target: 'm-pulp-fiction', relation: 'Directed' },
  { source: 'a-pitt', target: 'm-fight-club', relation: 'Starred in' },
  { source: 'd-fincher', target: 'm-fight-club', relation: 'Directed' },

  // Godfather
  { source: 'd-coppola', target: 'm-godfather', relation: 'Directed' },
  { source: 'a-pacino', target: 'm-godfather', relation: 'Starred in' },

  // Chazelle
  { source: 'd-chazelle', target: 'm-whiplash', relation: 'Directed' },
  { source: 'd-chazelle', target: 'm-la-la-land', relation: 'Directed' },
  { source: 'a-teller', target: 'm-whiplash', relation: 'Starred in' },
  { source: 'a-gosling', target: 'm-la-la-land', relation: 'Starred in' },

  // Villeneuve
  { source: 'd-villeneuve', target: 'm-blade-runner', relation: 'Directed' },
  { source: 'd-villeneuve', target: 'm-dune', relation: 'Directed' },
  { source: 'a-gosling', target: 'm-blade-runner', relation: 'Starred in' },
  { source: 'a-chalamet', target: 'm-dune', relation: 'Starred in' },
  { source: 'a-chalamet', target: 'm-interstellar', relation: 'Starred in' },
  { source: 'c-deakins', target: 'm-blade-runner', relation: 'Cinematography' },

  // Themes
  { source: 'm-inception', target: 't-scifi', relation: 'Thematic Genre' },
  { source: 'm-interstellar', target: 't-scifi', relation: 'Thematic Genre' },
  { source: 'm-blade-runner', target: 't-scifi', relation: 'Thematic Genre' },
  { source: 'm-dark-knight', target: 't-noir', relation: 'Thematic Genre' },
  { source: 'm-fight-club', target: 't-noir', relation: 'Thematic Genre' },
  { source: 'm-pulp-fiction', target: 't-noir', relation: 'Thematic Genre' }
]

export default function CineGraphPage() {
  const { navigate } = useApp()
  const canvasRef = useRef(null)

  // Interactive selection state
  const [selectedNode, setSelectedNode] = useState(GRAPH_NODES[0])
  const [hoveredNode, setHoveredNode] = useState(null)

  // Six Degrees Pathfinder
  const [pathSource, setPathSource] = useState('d-nolan')
  const [pathTarget, setPathTarget] = useState('a-gosling')
  const [pathResult, setPathResult] = useState(null)

  // Filter state
  const [activeFilter, setActiveFilter] = useState('all')

  // Graph state coordinates
  const nodesRef = useRef([])
  const transformRef = useRef({ x: 0, y: 0, scale: 1 })
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, node: null })

  // Initialize node layout once
  useEffect(() => {
    const w = 900
    const h = 560
    nodesRef.current = GRAPH_NODES.map((n, i) => {
      const angle = (i / GRAPH_NODES.length) * Math.PI * 2
      const radius = n.type === 'movie' ? 170 : n.type === 'director' ? 90 : 250
      return {
        ...n,
        x: w / 2 + Math.cos(angle) * radius + (Math.random() - 0.5) * 40,
        y: h / 2 + Math.sin(angle) * radius + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0
      }
    })
  }, [])

  // Breadth-First-Search (BFS) Shortest Path Algorithm
  const findShortestPath = useCallback((startId, endId) => {
    if (startId === endId) return [startId]

    const adj = {}
    GRAPH_NODES.forEach(n => { adj[n.id] = [] })
    GRAPH_LINKS.forEach(l => {
      adj[l.source]?.push({ id: l.target, relation: l.relation })
      adj[l.target]?.push({ id: l.source, relation: l.relation })
    })

    const queue = [[startId]]
    const visited = new Set([startId])
    const relationMap = {}

    while (queue.length > 0) {
      const path = queue.shift()
      const curr = path[path.length - 1]

      if (curr === endId) {
        return path
      }

      for (const neighbor of adj[curr] || []) {
        if (!visited.has(neighbor.id)) {
          visited.add(neighbor.id)
          relationMap[`${curr}->${neighbor.id}`] = neighbor.relation
          queue.push([...path, neighbor.id])
        }
      }
    }
    return null
  }, [])

  // Run pathfinder when source/target change
  useEffect(() => {
    const path = findShortestPath(pathSource, pathTarget)
    setPathResult(path)
  }, [pathSource, pathTarget, findShortestPath])

  // Canvas render loop with smooth relaxation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()

      const { x: tx, y: ty, scale } = transformRef.current
      ctx.translate(tx, ty)
      ctx.scale(scale, scale)

      const nodes = nodesRef.current
      const nodeMap = new Map(nodes.map(n => [n.id, n]))

      // Gentle force physics simulation step
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i]
          const n2 = nodes[j]
          const dx = n2.x - n1.x
          const dy = n2.y - n1.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          if (dist < 180) {
            const force = (180 - dist) / dist * 0.04
            n1.x -= dx * force
            n1.y -= dy * force
            n2.x += dx * force
            n2.y += dy * force
          }
        }
      }

      // Draw Edges
      GRAPH_LINKS.forEach(link => {
        const s = nodeMap.get(link.source)
        const t = nodeMap.get(link.target)
        if (!s || !t) return

        const isPath = pathResult && pathResult.includes(s.id) && pathResult.includes(t.id) &&
          Math.abs(pathResult.indexOf(s.id) - pathResult.indexOf(t.id)) === 1

        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(t.x, t.y)

        if (isPath) {
          ctx.strokeStyle = '#10b981'
          ctx.lineWidth = 3.5
          ctx.shadowColor = '#10b981'
          ctx.shadowBlur = 12
        } else {
          ctx.strokeStyle = 'rgba(255,255,255,.08)'
          ctx.lineWidth = 1.2
          ctx.shadowBlur = 0
        }
        ctx.stroke()
        ctx.shadowBlur = 0
      })

      // Draw Nodes
      nodes.forEach(n => {
        if (activeFilter !== 'all' && n.type !== activeFilter) return

        const isSelected = selectedNode?.id === n.id
        const isHovered = hoveredNode?.id === n.id
        const isPathNode = pathResult?.includes(n.id)

        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r + (isHovered ? 4 : 0), 0, Math.PI * 2)
        ctx.fillStyle = n.color

        if (isSelected || isPathNode) {
          ctx.shadowColor = isPathNode ? '#10b981' : n.color
          ctx.shadowBlur = 18
        }
        ctx.fill()
        ctx.shadowBlur = 0

        // White border
        ctx.lineWidth = isSelected ? 3 : 1.5
        ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(255,255,255,.3)'
        ctx.stroke()

        // Label
        ctx.fillStyle = 'rgba(255,255,255,.9)'
        ctx.font = `${n.type === 'movie' ? 'bold 11px' : '10px'} 'DM Sans', sans-serif`
        ctx.textAlign = 'center'
        ctx.fillText(n.label, n.x, n.y + n.r + 14)
      })

      ctx.restore()
      animId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(animId)
  }, [selectedNode, hoveredNode, pathResult, activeFilter])

  // Canvas Mouse Interactivity
  const handleMouseDown = e => {
    const rect = canvasRef.current.getBoundingClientRect()
    const mx = (e.clientX - rect.left - transformRef.current.x) / transformRef.current.scale
    const my = (e.clientY - rect.top - transformRef.current.y) / transformRef.current.scale

    const clicked = nodesRef.current.find(n => {
      const dx = n.x - mx
      const dy = n.y - my
      return Math.sqrt(dx * dx + dy * dy) <= n.r + 5
    })

    if (clicked) {
      setSelectedNode(clicked)
      dragRef.current = { isDragging: true, node: clicked, startX: mx, startY: my }
    } else {
      dragRef.current = { isDragging: true, node: null, startX: e.clientX, startY: e.clientY }
    }
  }

  const handleMouseMove = e => {
    const rect = canvasRef.current.getBoundingClientRect()
    const mx = (e.clientX - rect.left - transformRef.current.x) / transformRef.current.scale
    const my = (e.clientY - rect.top - transformRef.current.y) / transformRef.current.scale

    if (dragRef.current.isDragging) {
      if (dragRef.current.node) {
        dragRef.current.node.x = mx
        dragRef.current.node.y = my
      } else {
        const dx = e.clientX - dragRef.current.startX
        const dy = e.clientY - dragRef.current.startY
        transformRef.current.x += dx
        transformRef.current.y += dy
        dragRef.current.startX = e.clientX
        dragRef.current.startY = e.clientY
      }
    } else {
      const hovered = nodesRef.current.find(n => {
        const dx = n.x - mx
        const dy = n.y - my
        return Math.sqrt(dx * dx + dy * dy) <= n.r + 5
      })
      setHoveredNode(hovered || null)
    }
  }

  const handleMouseUp = () => {
    dragRef.current.isDragging = false
  }

  return (
    <div style={{ minHeight: '100vh', padding: '88px 24px 64px', maxWidth: 1400, margin: '0 auto', fontFamily: "'DM Sans',sans-serif" }}>
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="fu" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 22 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(139,92,246,.12)', border: '1px solid rgba(139,92,246,.25)', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 700, color: '#a78bfa', marginBottom: 8 }}>
            <span>🕸️</span> KNOWLEDGE GRAPH & GRAPH THEORY
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 50, letterSpacing: 1, color: 'white', marginBottom: 5 }}>
            Cine<span style={{ color: '#8b5cf6' }}>Graph</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 13, maxWidth: 650 }}>
            Explore cinema as an interconnected network. Uncover hidden auteur connections, collaborative networks, and run shortest-path cinema traversals.
          </p>
        </div>

        {/* Legend / Filter Pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Nodes' },
            { id: 'movie', label: '🎬 Movies' },
            { id: 'director', label: '🎥 Directors' },
            { id: 'actor', label: '🎭 Actors' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              style={{
                background: activeFilter === f.id ? '#8b5cf6' : 'rgba(255,255,255,.05)',
                border: 'none', borderRadius: 14, padding: '6px 12px', fontSize: 11,
                color: activeFilter === f.id ? 'white' : 'rgba(255,255,255,.6)', cursor: 'pointer', fontWeight: 600
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── SIX DEGREES PATHFINDER BAR ──────────────────────────────────── */}
      <div className="fu d1" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '.6px' }}>
            ⚡ Six Degrees of Cinema:
          </span>
          <select
            value={pathSource}
            onChange={e => setPathSource(e.target.value)}
            style={{ background: '#0e0e1c', color: 'white', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, padding: '6px 10px', fontSize: 12, outline: 'none' }}
          >
            {GRAPH_NODES.map(n => <option key={n.id} value={n.id}>{n.label} ({n.type})</option>)}
          </select>
          <span style={{ color: 'rgba(255,255,255,.3)' }}>➔</span>
          <select
            value={pathTarget}
            onChange={e => setPathTarget(e.target.value)}
            style={{ background: '#0e0e1c', color: 'white', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, padding: '6px 10px', fontSize: 12, outline: 'none' }}
          >
            {GRAPH_NODES.map(n => <option key={n.id} value={n.id}>{n.label} ({n.type})</option>)}
          </select>
        </div>

        {/* Path result badge */}
        {pathResult && (
          <div style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>
            Connected in <strong>{pathResult.length - 1} hops</strong>: {pathResult.map(id => GRAPH_NODES.find(n => n.id === id)?.label).join(' ➔ ')}
          </div>
        )}
      </div>

      {/* ── INTERACTIVE CANVAS & INSPECTOR ──────────────────────────────── */}
      <div className="fu d2" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        {/* Canvas Area */}
        <div style={{ background: '#090915', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, overflow: 'hidden', position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={940}
            height={560}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ width: '100%', height: 'auto', display: 'block', cursor: hoveredNode ? 'pointer' : 'grab' }}
          />

          {/* Quick instructions overlay */}
          <div style={{ position: 'absolute', bottom: 12, left: 16, fontSize: 11, color: 'rgba(255,255,255,.3)', pointerEvents: 'none' }}>
            💡 Drag nodes to rearrange · Click any node to inspect · Glowing green line marks shortest collaborative path
          </div>
        </div>

        {/* Node Inspector Side Panel */}
        <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, padding: 20 }}>
          {selectedNode ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: selectedNode.color }} />
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: selectedNode.color }}>
                  {selectedNode.type}
                </span>
              </div>

              <h3 style={{ fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 8 }}>
                {selectedNode.label}
              </h3>

              {selectedNode.year && (
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginBottom: 14 }}>
                  Release Year: {selectedNode.year}
                </div>
              )}

              {/* Direct links from this node */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', paddingTop: 14, marginTop: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', marginBottom: 10 }}>
                  Direct Connections ({GRAPH_LINKS.filter(l => l.source === selectedNode.id || l.target === selectedNode.id).length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                  {GRAPH_LINKS
                    .filter(l => l.source === selectedNode.id || l.target === selectedNode.id)
                    .map((l, i) => {
                      const otherId = l.source === selectedNode.id ? l.target : l.source
                      const other = GRAPH_NODES.find(n => n.id === otherId)
                      return (
                        <div
                          key={i}
                          onClick={() => other && setSelectedNode(other)}
                          style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 8, padding: '7px 10px', fontSize: 12, cursor: 'pointer', transition: 'all .2s' }}
                          onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,.2)'}
                          onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,.06)'}
                        >
                          <span style={{ color: 'rgba(255,255,255,.4)', fontSize: 10 }}>{l.relation} ➔ </span>
                          <strong style={{ color: other?.color || 'white' }}>{other?.label}</strong>
                        </div>
                      )
                    })}
                </div>
              </div>

              {/* Action if Movie */}
              {selectedNode.type === 'movie' && selectedNode.movieId && (
                <div style={{ marginTop: 20 }}>
                  <button
                    onClick={() => navigate('movie', selectedNode.movieId)}
                    style={{ width: '100%', background: '#e50914', border: 'none', borderRadius: 8, padding: '10px 0', color: 'white', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}
                  >
                    Open Movie Details →
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>
              Select a node in the graph to inspect cinematic details.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
