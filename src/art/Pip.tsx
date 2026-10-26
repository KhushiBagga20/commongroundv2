import { useEffect, useId, useRef, useState } from 'react'
import { C } from '@/data/palette'
import { onPointerMove, pointer } from '@/hooks/pointer'
import { cn } from '@/lib/format'
import { isCalm } from '@/motion/calm'
import { useCollector } from '@/store/collector'

export type PipMood = 'idle' | 'happy' | 'excited' | 'wow' | 'confused' | 'sleepy' | 'meh' | 'wink' | 'dizzy' | 'love'

interface PipProps {
  mood?: PipMood
  size?: number | string
  /** pupils follow the pointer */
  track?: boolean
  /** clickable: Pip reacts, and gets dizzy if poked five times */
  pokeable?: boolean
  className?: string
}

const INK = C.ink
const stroke = { stroke: INK, strokeWidth: 3.2, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const

/**
 * Pip — the small creature who lives in CommonGround. A butter seedling with a
 * tangerine petal crown. Expressive through face alone; never talks.
 */
export function Pip({ mood = 'idle', size = 120, track = true, pokeable = false, className }: PipProps) {
  const rootRef = useRef<SVGSVGElement>(null)
  const pupilsRef = useRef<SVGGElement>(null)
  const [override, setOverride] = useState<PipMood | null>(null)
  const pokes = useRef<number[]>([])
  const timer = useRef<number>(0)
  const unlockSecret = useCollector((s) => s.unlockSecret)
  const uid = useId().replace(/:/g, '')
  const shown = override ?? mood

  // Pupils drift toward the pointer; the loop sleeps when settled.
  useEffect(() => {
    if (!track) return
    let raf = 0
    let x = 0
    let y = 0
    const tick = () => {
      raf = 0
      const svg = rootRef.current
      const pupils = pupilsRef.current
      if (!svg || !pupils) return
      const r = svg.getBoundingClientRect()
      if (!r.width) return
      let tx = 0
      let ty = 0
      if (pointer.active && !isCalm()) {
        const dx = pointer.x - (r.left + r.width / 2)
        const dy = pointer.y - (r.top + r.height * 0.52)
        const d = Math.hypot(dx, dy) || 1
        const k = Math.min(1, d / 260)
        tx = (dx / d) * 3.8 * k
        ty = (dy / d) * 3.4 * k
      }
      x += (tx - x) * 0.28
      y += (ty - y) * 0.28
      pupils.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`)
      if (Math.abs(tx - x) > 0.03 || Math.abs(ty - y) > 0.03) raf = requestAnimationFrame(tick)
    }
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const off = onPointerMove(wake)
    wake()
    return () => {
      off()
      cancelAnimationFrame(raf)
    }
  }, [track, shown])

  // Blinks on its own schedule.
  useEffect(() => {
    let t = 0
    const loop = () => {
      t = window.setTimeout(
        () => {
          const el = rootRef.current
          if (el && !document.hidden && !isCalm()) {
            el.classList.add('is-blinking')
            window.setTimeout(() => el.classList.remove('is-blinking'), 130)
          }
          loop()
        },
        2200 + Math.random() * 3800,
      )
    }
    loop()
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const poke = () => {
    const now = Date.now()
    pokes.current = [...pokes.current.filter((t) => now - t < 2600), now]
    const el = rootRef.current
    if (el) {
      el.classList.remove('is-squish')
      void el.getBoundingClientRect()
      el.classList.add('is-squish')
    }
    window.clearTimeout(timer.current)
    if (pokes.current.length >= 5) {
      pokes.current = []
      setOverride('dizzy')
      unlockSecret('pip-poker')
      timer.current = window.setTimeout(() => setOverride(null), 2600)
    } else {
      setOverride(pokes.current.length > 2 ? 'confused' : 'wow')
      timer.current = window.setTimeout(() => setOverride(null), 800)
    }
  }

  const svg = (
    <svg
      ref={rootRef}
      viewBox="0 0 140 150"
      width={size}
      height={typeof size === 'number' ? size * (150 / 140) : undefined}
      className={cn('pip', className)}
      data-mood={shown}
      aria-hidden="true"
    >
      <defs>
        <pattern id={`ch${uid}`} width="4.5" height="4.5" patternUnits="userSpaceOnUse">
          <circle cx="2.25" cy="2.25" r="1.35" fill={C.bubblegum} />
        </pattern>
      </defs>
      <ellipse cx="70" cy="140" rx="34" ry="5" fill={INK} opacity={0.18} />
      <g className="pip-body">
        <g className="pip-petals">
          <g className="amb-spin" style={{ transformOrigin: '70px 78px', ['--dur' as string]: '70s' }}>
            {Array.from({ length: 10 }, (_, i) => (
              <ellipse
                key={i}
                cx="70"
                cy="33"
                rx="11"
                ry="16.5"
                transform={`rotate(${i * 36} 70 78)`}
                fill={i % 2 ? C.tangerine : '#FF8A5C'}
                stroke={INK}
                strokeWidth={3.2}
              />
            ))}
          </g>
        </g>
        <path d="M70 44 C 70 32, 74 24, 81 18" {...stroke} />
        <path d="M81 18 c 9 -9 22 -8 27 -3 c -6 10 -19 12 -27 3 z" fill={C.acid} stroke={INK} strokeWidth={3} strokeLinejoin="round" className="pip-leaf" />
        <circle cx="70" cy="78" r="36" fill={C.butter} stroke={INK} strokeWidth={3.4} />
        <circle cx="45" cy="92" r="7.5" fill={`url(#ch${uid})`} />
        <circle cx="95" cy="92" r="7.5" fill={`url(#ch${uid})`} />
        <Eyes mood={shown} pupilsRef={pupilsRef} />
        <Mouth mood={shown} />
        <Extras mood={shown} />
      </g>
    </svg>
  )

  if (!pokeable) return svg
  return (
    <button type="button" className="pip-button" onClick={poke} aria-label="Pip, the CommonGround mascot. Poke gently." data-cursor="poke">
      {svg}
    </button>
  )
}

function Eyes({ mood, pupilsRef }: { mood: PipMood; pupilsRef: React.RefObject<SVGGElement | null> }) {
  if (mood === 'happy' || mood === 'excited') {
    return (
      <g {...stroke} strokeWidth={3.6}>
        <path d="M47 76 q9 -12 18 0" />
        <path d="M75 76 q9 -12 18 0" />
      </g>
    )
  }
  if (mood === 'sleepy') {
    return (
      <g {...stroke}>
        <path d="M47 74 q9 8 18 0" />
        <path d="M75 74 q9 8 18 0" />
      </g>
    )
  }
  if (mood === 'love') {
    const heart = (x: number) => `M${x} 80 c-9 -6 -11 -12 -7 -16 c3 -3 7 -1 7 2 c0 -3 4 -5 7 -2 c4 4 2 10 -7 16 z`
    return (
      <g fill={C.bubblegum} stroke={INK} strokeWidth={2.6} strokeLinejoin="round">
        <path d={heart(56)} />
        <path d={heart(84)} />
      </g>
    )
  }
  if (mood === 'dizzy') {
    const spiral = (x: number) => `M${x} 74 m-1 0 a1.5 1.5 0 1 1 2 1.5 a4 4 0 1 1 -5 -4 a7 7 0 1 1 -2 9`
    return (
      <g {...stroke} strokeWidth={2.6}>
        <path d={spiral(56)} />
        <path d={spiral(84)} />
      </g>
    )
  }
  const wide = mood === 'wow' || mood === 'confused'
  return (
    <g className="pip-eyes">
      {mood === 'wink' ? (
        <path d="M75 76 q9 -10 18 0" {...stroke} strokeWidth={3.6} />
      ) : (
        <ellipse cx="84" cy="74" rx={wide ? 11 : 10} ry={wide ? 13 : 11.5} fill={C.paper} stroke={INK} strokeWidth={3} />
      )}
      <ellipse cx="56" cy="74" rx={wide ? 11 : 10} ry={wide ? 13 : 11.5} fill={C.paper} stroke={INK} strokeWidth={3} />
      <g ref={pupilsRef}>
        <circle cx="57" cy="76" r={mood === 'meh' ? 4 : 5.2} fill={INK} />
        <circle cx="59" cy="73" r="1.7" fill={C.paper} />
        {mood !== 'wink' && (
          <>
            <circle cx="85" cy="76" r={mood === 'meh' ? 4 : 5.2} fill={INK} />
            <circle cx="87" cy="73" r="1.7" fill={C.paper} />
          </>
        )}
      </g>
      {mood === 'meh' && (
        <g fill={C.butter} stroke={INK} strokeWidth={3}>
          <path d="M45 66 h22 v4 a11 11 0 0 1 -22 0 z" />
          <path d="M73 66 h22 v4 a11 11 0 0 1 -22 0 z" />
        </g>
      )}
    </g>
  )
}

function Mouth({ mood }: { mood: PipMood }) {
  switch (mood) {
    case 'happy':
    case 'love':
      return (
        <g>
          <path d="M57 92 q13 17 26 0 z" fill={INK} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
          <path d="M63 99 q7 5 14 0 q-7 -3 -14 0 z" fill={C.bubblegum} />
        </g>
      )
    case 'excited':
      return (
        <g>
          <path d="M53 90 q17 24 34 0 z" fill={INK} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
          <path d="M61 100 q9 6 18 0 q-9 -4 -18 0 z" fill={C.bubblegum} />
        </g>
      )
    case 'wow':
      return <ellipse cx="70" cy="99" rx="6" ry="7.5" fill={INK} />
    case 'confused':
    case 'dizzy':
      return <path d="M57 99 q4 -5 8 0 t8 0 t8 0" {...stroke} />
    case 'sleepy':
      return <ellipse cx="70" cy="98" rx="3.2" ry="2.6" fill={INK} />
    case 'meh':
      return <path d="M61 98 l18 -2" {...stroke} />
    case 'wink':
      return <path d="M59 95 q12 8 22 -3" {...stroke} />
    default:
      return <path d="M60 94 q10 9 20 0" {...stroke} />
  }
}

function Extras({ mood }: { mood: PipMood }) {
  if (mood === 'sleepy')
    return (
      <g {...stroke} strokeWidth={2.6} className="pip-z">
        <path d="M108 40 h9 l-9 10 h9" />
        <path d="M122 24 h6 l-6 7 h6" />
      </g>
    )
  if (mood === 'confused')
    return (
      <>
        <path d="M46 58 q9 -7 18 -2" {...stroke} />
        <path d="M78 60 l15 -1" {...stroke} />
        <text x="112" y="44" fontFamily="Archivo, sans-serif" fontWeight={900} fontSize="26" fill={INK}>
          ?
        </text>
      </>
    )
  if (mood === 'excited')
    return (
      <g fill={C.acid} stroke={INK} strokeWidth={2.4} strokeLinejoin="round">
        <path d="M18 40 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 z" />
        <path d="M120 30 l2.4 6 l6 2.4 l-6 2.4 l-2.4 6 l-2.4 -6 l-6 -2.4 l6 -2.4 z" />
      </g>
    )
  if (mood === 'wow')
    return (
      <g {...stroke} strokeWidth={2.6}>
        <path d="M46 56 q9 -8 18 -3" />
        <path d="M76 53 q9 -5 18 3" />
      </g>
    )
  return null
}
