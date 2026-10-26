import type { ReactNode } from 'react'
import { C } from '@/data/palette'
import { Spark } from './primitives'

const INK = C.ink
const P = C.paper

/** Die-cut outline: a fat paper stroke with an ink stroke behind it. */
function Cut({ d, fill }: { d: string; fill: string }) {
  return (
    <>
      <path d={d} fill={INK} stroke={INK} strokeWidth={15} strokeLinejoin="round" />
      <path d={d} fill={fill} stroke={P} strokeWidth={9} strokeLinejoin="round" />
      <path d={d} fill={fill} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    </>
  )
}

const burst = (cx: number, cy: number, r1: number, r2: number, n: number) => {
  let d = ''
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? r2 : r1
    const a = (Math.PI * i) / n - Math.PI / 2
    d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)} `
  }
  return `${d}Z`
}

function Word({ x, y, size, children, fill = INK, rotate = 0 }: { x: number; y: number; size: number; children: ReactNode; fill?: string; rotate?: number }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fontFamily="Archivo, sans-serif"
      fontWeight={900}
      fontSize={size}
      fill={fill}
      transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}
      style={{ fontStretch: '70%' }}
    >
      {children}
    </text>
  )
}

export type StickerId = 'yes' | 'ooh' | 'weird' | 'smiley' | 'bolt' | 'heart' | 'eye' | 'planet' | 'curious' | 'new' | 'flower' | 'arrow'

export const STICKERS: Record<StickerId, { label: string; render: () => ReactNode }> = {
  yes: {
    label: 'YES! sticker',
    render: () => (
      <>
        <Cut d={burst(60, 60, 54, 40, 12)} fill={C.acid} />
        <Word x={60} y={72} size={34} rotate={-8}>
          YES!
        </Word>
      </>
    ),
  },
  ooh: {
    label: 'Ooh sticker',
    render: () => (
      <>
        <Cut d="M14 60 c0 -30 20 -46 46 -46 s46 16 46 46 s-20 46 -46 46 c-8 0 -14 -2 -20 -4 l-18 10 l4 -18 c-8 -8 -12 -20 -12 -34 z" fill={C.bubblegum} />
        <Word x={60} y={72} size={34}>
          OOH
        </Word>
      </>
    ),
  },
  weird: {
    label: 'Weird sticker',
    render: () => (
      <>
        <Cut d="M10 40 q50 -30 100 0 v40 q-50 30 -100 0 z" fill={C.lavender} />
        <Word x={60} y={73} size={36} rotate={-4}>
          WEIRD
        </Word>
      </>
    ),
  },
  smiley: {
    label: 'Halftone smiley sticker',
    render: () => (
      <>
        <Cut d="M60 8 a52 52 0 1 1 -0.1 0 z" fill={C.butter} />
        <circle cx="44" cy="50" r="6" fill={INK} />
        <circle cx="76" cy="50" r="6" fill={INK} />
        <path d="M36 70 q24 26 48 0" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
        <g fill={C.tangerine}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <circle key={i} cx={30 + (i % 3) * 5} cy={70 + Math.floor(i / 3) * 5} r={1.8} />
          ))}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <circle key={`r${i}`} cx={80 + (i % 3) * 5} cy={70 + Math.floor(i / 3) * 5} r={1.8} />
          ))}
        </g>
      </>
    ),
  },
  bolt: {
    label: 'Lightning bolt sticker',
    render: () => <Cut d="M66 6 L22 66 h28 l-12 48 l52 -66 h-30 z" fill={C.butter} />,
  },
  heart: {
    label: 'Heart sticker',
    render: () => (
      <>
        <Cut d="M60 104 C 18 74, 6 50, 18 30 C 30 12, 52 16, 60 34 C 68 16, 90 12, 102 30 C 114 50, 102 74, 60 104 Z" fill={C.tangerine} />
        <path d="M34 40 q6 -10 16 -6" fill="none" stroke={P} strokeWidth={5} strokeLinecap="round" />
      </>
    ),
  },
  eye: {
    label: 'Big eye sticker',
    render: () => (
      <>
        <Cut d="M8 60 Q60 4 112 60 Q60 116 8 60 Z" fill={P} />
        <circle cx="60" cy="60" r="24" fill={C.electric} stroke={INK} strokeWidth={3} />
        <circle cx="60" cy="60" r="11" fill={INK} />
        <circle cx="66" cy="54" r="4" fill={P} />
      </>
    ),
  },
  planet: {
    label: 'Planet sticker',
    render: () => (
      <>
        <Cut d="M60 22 a38 38 0 1 1 -0.1 0 z" fill={C.bubblegum} />
        <ellipse cx="60" cy="60" rx="56" ry="13" fill="none" stroke={INK} strokeWidth={10} transform="rotate(-18 60 60)" />
        <ellipse cx="60" cy="60" rx="56" ry="13" fill="none" stroke={C.acid} strokeWidth={5} transform="rotate(-18 60 60)" />
        <Spark x={100} y={22} r={9} fill={C.butter} />
      </>
    ),
  },
  curious: {
    label: 'Curious sticker',
    render: () => (
      <>
        <Cut d="M6 42 h108 v36 h-108 z" fill={C.electric} />
        <Word x={60} y={72} size={30} fill={P}>
          CURIOUS
        </Word>
      </>
    ),
  },
  new: {
    label: 'New hobby who dis sticker',
    render: () => (
      <>
        <Cut d={burst(60, 60, 54, 46, 20)} fill={C.tangerine} />
        <Word x={60} y={57} size={17}>
          NEW HOBBY
        </Word>
        <Word x={60} y={77} size={17}>
          WHO DIS
        </Word>
      </>
    ),
  },
  flower: {
    label: 'Flower sticker',
    render: () => (
      <>
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i} transform={`rotate(${i * 45} 60 60)`}>
            <Cut d="M60 8 c12 0 16 18 0 34 c-16 -16 -12 -34 0 -34 z" fill={i % 2 ? C.lavender : C.acid} />
          </g>
        ))}
        <circle cx="60" cy="60" r="16" fill={C.butter} stroke={INK} strokeWidth={3} />
      </>
    ),
  },
  arrow: {
    label: 'Doodle arrow sticker',
    render: () => (
      <>
        <path d="M14 96 C 30 40, 70 30, 98 36" fill="none" stroke={P} strokeWidth={16} strokeLinecap="round" />
        <path d="M14 96 C 30 40, 70 30, 98 36" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
        <path d="M80 20 L104 36 L82 54" fill="none" stroke={P} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M80 20 L104 36 L82 54" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
}

export function Sticker({ id, size = 110, className }: { id: StickerId; size?: number; className?: string }) {
  return (
    <svg viewBox="-6 -6 132 132" width={size} height={size} className={className} aria-hidden="true">
      {STICKERS[id].render()}
    </svg>
  )
}
