import { C } from '@/data/palette'

export const INK = C.ink

/** The house line: 4px ink, round caps. Spread onto any SVG shape. */
export const line = {
  stroke: INK,
  strokeWidth: 4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

export const thin = { ...line, strokeWidth: 2.5 } as const

export type Mood = 'idle' | 'happy' | 'wow' | 'meh' | 'sleepy' | 'wink'

/**
 * A tiny expressive face that can sit on any object. Eyes blink on their own
 * (CSS), and the whole face re-pops when the mood changes.
 */
export function Face({
  x,
  y,
  s = 1,
  mood = 'idle',
  color = INK,
  cheeks = true,
}: {
  x: number
  y: number
  s?: number
  mood?: Mood
  color?: string
  cheeks?: boolean
}) {
  const ex = 9 * s
  const r = 4 * s
  const sw = 3.2 * s
  const stroke = { stroke: color, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const
  return (
    <g key={mood} className="face-pop" style={{ transformOrigin: `${x}px ${y}px` }}>
      {cheeks && (mood === 'happy' || mood === 'wow' || mood === 'idle') && (
        <g fill={C.bubblegum} opacity={0.85}>
          <ellipse cx={x - ex - 6 * s} cy={y + 7 * s} rx={4.5 * s} ry={3 * s} />
          <ellipse cx={x + ex + 6 * s} cy={y + 7 * s} rx={4.5 * s} ry={3 * s} />
        </g>
      )}
      {/* eyes */}
      {mood === 'happy' ? (
        <g {...stroke}>
          <path d={`M${x - ex - r} ${y + 1.5 * s} q${r} ${-6 * s} ${2 * r} 0`} />
          <path d={`M${x + ex - r} ${y + 1.5 * s} q${r} ${-6 * s} ${2 * r} 0`} />
        </g>
      ) : mood === 'sleepy' ? (
        <g {...stroke}>
          <path d={`M${x - ex - r} ${y - 1 * s} q${r} ${5 * s} ${2 * r} 0`} />
          <path d={`M${x + ex - r} ${y - 1 * s} q${r} ${5 * s} ${2 * r} 0`} />
        </g>
      ) : mood === 'meh' ? (
        <g {...stroke}>
          <path d={`M${x - ex - r} ${y} h${2 * r}`} />
          <path d={`M${x + ex - r} ${y} h${2 * r}`} />
        </g>
      ) : mood === 'wink' ? (
        <g>
          <circle cx={x - ex} cy={y} r={r} fill={color} />
          <path {...stroke} d={`M${x + ex - r} ${y + 1 * s} q${r} ${-5 * s} ${2 * r} 0`} />
        </g>
      ) : (
        <g className="blink" fill={color}>
          <circle cx={x - ex} cy={y} r={mood === 'wow' ? r * 1.25 : r} />
          <circle cx={x + ex} cy={y} r={mood === 'wow' ? r * 1.25 : r} />
        </g>
      )}
      {/* mouth */}
      {mood === 'happy' ? (
        <path d={`M${x - 7 * s} ${y + 8 * s} q${7 * s} ${10 * s} ${14 * s} 0 z`} fill={color} stroke={color} strokeWidth={2 * s} strokeLinejoin="round" />
      ) : mood === 'wow' ? (
        <ellipse cx={x} cy={y + 11 * s} rx={4 * s} ry={5 * s} fill={color} />
      ) : mood === 'meh' ? (
        <path {...stroke} d={`M${x - 6 * s} ${y + 11 * s} l${12 * s} ${-2 * s}`} />
      ) : mood === 'sleepy' ? (
        <ellipse cx={x} cy={y + 10 * s} rx={2.5 * s} ry={2 * s} fill={color} />
      ) : mood === 'wink' ? (
        <path {...stroke} d={`M${x - 6 * s} ${y + 9 * s} q${8 * s} ${6 * s} ${12 * s} ${-2 * s}`} />
      ) : (
        <path {...stroke} d={`M${x - 6 * s} ${y + 8 * s} q${6 * s} ${6 * s} ${12 * s} 0`} />
      )}
    </g>
  )
}

/** Four-point sparkle. */
export function Spark({ x, y, r = 10, fill = C.paper, stroke = true }: { x: number; y: number; r?: number; fill?: string; stroke?: boolean }) {
  const k = r * 0.28
  const d = `M${x} ${y - r} Q${x + k} ${y - k} ${x + r} ${y} Q${x + k} ${y + k} ${x} ${y + r} Q${x - k} ${y + k} ${x - r} ${y} Q${x - k} ${y - k} ${x} ${y - r} Z`
  return <path d={d} fill={fill} {...(stroke ? { ...line, strokeWidth: 2.5 } : {})} />
}

/** Dot pattern definition used for halftone shading inside illustrations. */
export function DotDefs({ id, color = INK, gap = 7, r = 1.5, opacity = 0.55 }: { id: string; color?: string; gap?: number; r?: number; opacity?: number }) {
  return (
    <pattern id={id} width={gap} height={gap} patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
      <circle cx={gap / 2} cy={gap / 2} r={r} fill={color} opacity={opacity} />
    </pattern>
  )
}

export function StripeDefs({ id, color = INK, gap = 12, width = 6 }: { id: string; color?: string; gap?: number; width?: number }) {
  return (
    <pattern id={id} width={gap} height={gap} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width={width} height={gap} fill={color} />
    </pattern>
  )
}
