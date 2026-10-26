import { useId } from 'react'
import { C } from '@/data/palette'
import type { BadgeShape } from '@/data/achievements'

const INK = C.ink

function shapePath(shape: BadgeShape): string {
  switch (shape) {
    case 'hex':
      return 'M50 4 L90 27 L90 73 L50 96 L10 73 L10 27 Z'
    case 'shield':
      return 'M50 4 L88 16 L84 58 Q78 84 50 96 Q22 84 16 58 L12 16 Z'
    case 'ticket':
      return 'M10 18 H90 V40 A10 10 0 0 0 90 60 V82 H10 V60 A10 10 0 0 0 10 40 Z'
    case 'flower': {
      let d = ''
      for (let i = 0; i < 16; i++) {
        const a = (Math.PI * i) / 8 - Math.PI / 2
        const r = i % 2 ? 36 : 46
        d += `${i ? 'L' : 'M'}${(50 + Math.cos(a) * r).toFixed(1)} ${(50 + Math.sin(a) * r).toFixed(1)} `
      }
      return `${d}Z`
    }
    case 'burst': {
      let d = ''
      for (let i = 0; i < 24; i++) {
        const a = (Math.PI * i) / 12 - Math.PI / 2
        const r = i % 2 ? 38 : 47
        d += `${i ? 'L' : 'M'}${(50 + Math.cos(a) * r).toFixed(1)} ${(50 + Math.sin(a) * r).toFixed(1)} `
      }
      return `${d}Z`
    }
    default:
      return 'M50 4 A46 46 0 1 1 49.9 4 Z'
  }
}

/** An achievement badge: coloured when earned, a halftone ghost when not. */
export function Badge({ shape, color, glyph, earned, size = 96 }: { shape: BadgeShape; color: string; glyph: string; earned: boolean; size?: number }) {
  const uid = useId().replace(/:/g, '')
  const d = shapePath(shape)
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" className="badge-art">
      <defs>
        <pattern id={`h${uid}`} width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.3" fill={INK} opacity="0.35" />
        </pattern>
      </defs>
      {earned ? (
        <>
          <path d={d} fill={INK} transform="translate(4 5)" />
          <path d={d} fill={color} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          <path d={d} fill="none" stroke={C.paper} strokeWidth="2" strokeDasharray="3 5" transform="translate(50 50) scale(0.82) translate(-50 -50)" />
          <text x="50" y="58" textAnchor="middle" fontFamily="Silkscreen, Space Mono, monospace" fontSize={glyph.length > 2 ? 15 : 20} fill={INK}>
            {glyph}
          </text>
        </>
      ) : (
        <>
          <path d={d} fill={`url(#h${uid})`} stroke={INK} strokeWidth="2.5" strokeDasharray="5 5" strokeLinejoin="round" opacity="0.6" />
          <text x="50" y="58" textAnchor="middle" fontFamily="Silkscreen, Space Mono, monospace" fontSize="20" fill={INK} opacity="0.45">
            ?
          </text>
        </>
      )}
    </svg>
  )
}
