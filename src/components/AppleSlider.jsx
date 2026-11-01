// src/components/AppleSlider.jsx
// Apple visionOS / iOS 18 Liquid Glass Slider
// Matches Apple Developer Documentation:
// - Vivid system blue active fill (#007aff) with rounded ends
// - Frosted glass capsule thumb (wider squircle with specular rim highlight & drop shadow)
// - Fluid interaction with spring scale dynamics

import { useMemo } from 'react'

export default function AppleSlider({
  value = 50,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  color = '#0a84ff',
  disabled = false,
  ariaLabel = 'Slider',
  style = {},
  className = ''
}) {
  const percentage = useMemo(() => {
    const clamped = Math.min(Math.max(value, min), max)
    const range = max - min || 1
    return ((clamped - min) / range) * 100
  }, [value, min, max])

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: 28,
        userSelect: 'none',
        touchAction: 'none',
        ...style
      }}
      className={`apple-slider-wrap ${className}`}
    >
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={e => onChange?.(+e.target.value)}
        className="apple-slider"
        style={{
          '--val': `${percentage}%`,
          '--accent': color,
          width: '100%',
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
      />
    </div>
  )
}
