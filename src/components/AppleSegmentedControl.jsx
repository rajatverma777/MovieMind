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
      className={`apple-segmented-group ${className}`}
      style={{
        position: 'relative',
        display: fullWidth ? 'flex' : 'inline-flex',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.12)',
        backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.04) 100%)',
        backdropFilter: 'blur(28px) saturate(190%)',
        WebkitBackdropFilter: 'blur(28px) saturate(190%)',
        border: '1.2px solid rgba(255, 255, 255, 0.18)',
        borderRadius: 9999,
        padding: 3.5,
        boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.28), 0 4px 16px rgba(0, 0, 0, 0.2)',
        userSelect: 'none',
        width: fullWidth ? '100%' : 'auto',
        ...style
      }}
    >
      {/* ── Active Floating Glass Pill ─────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: 3.5,
          bottom: 3.5,
          left: indicatorStyle.left,
          width: indicatorStyle.width,
          opacity: indicatorStyle.opacity,
          borderRadius: 9999,
          background: '#ffffff',
          backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #f1f1f5 100%)',
          boxShadow: '0 3px 12px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.18), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.95)',
          transition: 'all 0.28s cubic-bezier(0.34, 1.2, 0.64, 1)',
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
            className={`apple-segmented-item ${isActive ? 'active' : ''}`}
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
              borderRadius: 9999,
              padding: sizeStyles.padding,
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'DM Sans', sans-serif",
              fontSize: sizeStyles.fontSize,
              fontWeight: isActive ? 700 : 550,
              color: isActive ? '#090910' : 'rgba(255, 255, 255, 0.65)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'color 0.22s ease, transform 0.18s ease'
            }}
            onMouseOver={e => {
              if (!isActive) e.currentTarget.style.color = '#ffffff'
            }}
            onMouseOut={e => {
              if (!isActive) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)'
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
