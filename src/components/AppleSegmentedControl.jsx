// src/components/AppleSegmentedControl.jsx
// Official Apple visionOS / iOS 18 Liquid Glass Segmented Control
// Matches Apple Developer Documentation:
// - Translucent frosted glass capsule track
// - Floating white specular pill for the active selection
// - Spring-based sliding transformation effect
// - High-contrast text legibility

import { useState, useRef, useEffect, useLayoutEffect } from 'react'

export default function AppleSegmentedControl({
  options = [],
  value,
  onChange,
  size = 'md',
  fullWidth = false,
  style = {},
  className = ''
}) {
  const containerRef = useRef(null)
  const itemRefs = useRef({})
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 3, width: 0, opacity: 0 })

  // Normalize options: can be strings or objects { id, label, icon, badge }
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'string') {
      return { id: opt, label: opt }
    }
    return opt
  })

  // Measure and animate the floating active pill
  const updateIndicator = () => {
    const activeEl = itemRefs.current[value]
    const container = containerRef.current
    if (activeEl && container) {
      const containerRect = container.getBoundingClientRect()
      const elRect = activeEl.getBoundingClientRect()
      const left = elRect.left - containerRect.left
      const width = elRect.width
      setIndicatorStyle({
        left,
        width,
        opacity: 1
      })
    }
  }

  useLayoutEffect(() => {
    updateIndicator()
  }, [value, options])

  useEffect(() => {
    const handleResize = () => updateIndicator()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [value])

  const sizeStyles = {
    sm: { height: 32, padding: '4px 12px', fontSize: 12 },
    md: { height: 38, padding: '7px 18px', fontSize: 13.5 },
    lg: { height: 44, padding: '9px 24px', fontSize: 14.5 }
  }[size] || { height: 38, padding: '7px 18px', fontSize: 13.5 }

  return (
    <div
      ref={containerRef}
      className={`apple-segmented-group has-indicator ${className}`}
      style={{
        position: 'relative',
        display: fullWidth ? 'flex' : 'inline-flex',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(30px) saturate(190%)',
        WebkitBackdropFilter: 'blur(30px) saturate(190%)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 9999,
        padding: 3,
        boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.35)',
        userSelect: 'none',
        width: fullWidth ? '100%' : 'auto',
        ...style
      }}
    >
      {/* ── Active Floating Glass Pill (Authentic visionOS Liquid Glass) ─────────────── */}
      <div
        style={{
          position: 'absolute',
          top: 3,
          bottom: 3,
          left: indicatorStyle.left,
          width: indicatorStyle.width,
          opacity: indicatorStyle.opacity,
          borderRadius: 9999,
          background: 'rgba(255, 255, 255, 0.20)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.24)',
          boxShadow: '0 3px 12px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
          transition: 'all 0.26s cubic-bezier(0.34, 1.25, 0.64, 1)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* ── Segment Items ─────────────────────────────────────────── */}
      {normalizedOptions.map(opt => {
        const isActive = value === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            ref={el => { itemRefs.current[opt.id] = el }}
            onClick={() => onChange?.(opt.id)}
            className="apple-segmented-item"
            style={{
              position: 'relative',
              zIndex: 2,
              flex: fullWidth ? 1 : 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
              borderRadius: 9999,
              padding: sizeStyles.padding,
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', -apple-system, sans-serif",
              fontSize: sizeStyles.fontSize,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.62)',
              textShadow: isActive ? '0 1px 2px rgba(0, 0, 0, 0.4)' : 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              outline: 'none',
              transition: 'color 0.2s ease'
            }}
            onMouseOver={e => {
              if (!isActive) e.currentTarget.style.color = '#ffffff'
            }}
            onMouseOut={e => {
              if (!isActive) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.62)'
            }}
          >
            {opt.icon && <span style={{ fontSize: '1.1em', lineHeight: 1 }}>{opt.icon}</span>}
            <span>{opt.label}</span>
            {opt.badge !== undefined && opt.badge !== null && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: 10,
                  background: isActive ? 'rgba(9, 9, 16, 0.12)' : 'rgba(255, 255, 255, 0.14)',
                  color: isActive ? '#090910' : '#38bdf8'
                }}
              >
                {opt.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
