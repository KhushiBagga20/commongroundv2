import { useId, type ReactNode } from 'react'
import { C } from '@/data/palette'

/**
 * A rubber stamp with text running around a circular path. The slightly
 * rough edge comes from a static displacement filter.
 */
export function Stamp({
  text,
  center,
  color = C.tangerine,
  size = 150,
  rotate = 0,
  faded = false,
}: {
  text: string
  center: ReactNode
  color?: string
  size?: number
  rotate?: number
  faded?: boolean
}) {
  const uid = useId().replace(/:/g, '')
  const label = `${text.toUpperCase()} ✶ `
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} style={{ transform: `rotate(${rotate}deg)` }} aria-hidden="true" className="stamp">
      <defs>
        <path id={`p${uid}`} d="M80 80 m-58 0 a58 58 0 1 1 116 0 a58 58 0 1 1 -116 0" />
        <filter id={`r${uid}`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" />
        </filter>
      </defs>
      <g filter={`url(#r${uid})`} opacity={faded ? 0.28 : 0.95} style={{ mixBlendMode: 'multiply' }}>
        <circle cx="80" cy="80" r="74" fill="none" stroke={color} strokeWidth="5" strokeDasharray={faded ? '6 7' : undefined} />
        <circle cx="80" cy="80" r="44" fill="none" stroke={color} strokeWidth="2.5" />
        <text fill={color} fontFamily="Space Mono, monospace" fontWeight={700} fontSize="12.5" letterSpacing="2.2">
          <textPath href={`#p${uid}`} textLength={2 * Math.PI * 58 - 6} lengthAdjust="spacing">
            {label.repeat(Math.max(1, Math.round(40 / label.length)))}
          </textPath>
        </text>
        <g transform="translate(46 46)">{center}</g>
      </g>
    </svg>
  )
}
