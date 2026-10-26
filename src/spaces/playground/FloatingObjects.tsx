import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { motion } from 'motion/react'
import { HobbyArt } from '@/art/HobbyArt'
import type { Mood } from '@/art/primitives'
import { getHobby } from '@/data/repository'
import { hasFinePointer, onPointerMove, pointer } from '@/hooks/pointer'
import { useDossier } from '@/hooks/useDossier'
import { cn } from '@/lib/format'
import { isCalm } from '@/motion/calm'

export interface FloatSpec {
  id: string
  /** position in % of the hero */
  x: number
  y: number
  size: number
  rot: number
  /** parallax depth: how much it leans toward the cursor */
  depth: number
  mobile?: boolean
}

/**
 * Hobby objects scattered around the hero. They lean toward the cursor, flinch
 * a little when it gets close, change expression on hover, can be thrown
 * around, and open their dossier on a plain click.
 */
export function FloatingObjects({ specs, bounds }: { specs: FloatSpec[]; bounds: RefObject<HTMLElement | null> }) {
  const tilts = useRef<(HTMLSpanElement | null)[]>([])
  const outers = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    if (!hasFinePointer()) return
    let raf = 0
    const cur = specs.map(() => ({ x: 0, y: 0, r: 0, s: 1 }))
    const tick = () => {
      raf = 0
      const calm = isCalm()
      const rects = outers.current.map((o) => o?.getBoundingClientRect())
      let moving = false
      rects.forEach((r, i) => {
        const el = tilts.current[i]
        if (!r || !el) return
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        const dx = pointer.x - cx
        const dy = pointer.y - cy
        const d = Math.hypot(dx, dy)
        const R = 260
        const near = pointer.active && !calm && d < R
        const k = near ? 1 - d / R : 0
        const depth = specs[i].depth
        // lean toward the cursor, but flinch away when it gets really close
        const flinch = k > 0.55 ? (k - 0.55) * 2.2 : 0
        const tx = near ? (dx / (d || 1)) * (k * 18 * depth - flinch * 26) : 0
        const ty = near ? (dy / (d || 1)) * (k * 18 * depth - flinch * 26) : 0
        const tr = near ? Math.max(-14, Math.min(14, dx * 0.06 * depth)) : 0
        const ts = near ? 1 + k * 0.06 : 1
        const c = cur[i]
        c.x += (tx - c.x) * 0.16
        c.y += (ty - c.y) * 0.16
        c.r += (tr - c.r) * 0.16
        c.s += (ts - c.s) * 0.16
        if (Math.abs(tx - c.x) + Math.abs(ty - c.y) + Math.abs(tr - c.r) > 0.05) moving = true
        el.style.transform = `translate3d(${c.x.toFixed(2)}px, ${c.y.toFixed(2)}px, 0) rotate(${c.r.toFixed(2)}deg) scale(${c.s.toFixed(3)})`
      })
      if (moving) raf = requestAnimationFrame(tick)
    }
    const off = onPointerMove(() => {
      if (!raf) raf = requestAnimationFrame(tick)
    })
    return () => {
      off()
      cancelAnimationFrame(raf)
    }
  }, [specs])

  return (
    <>
      {specs.map((s, i) => (
        <FloatingObject
          key={s.id}
          spec={s}
          index={i}
          bounds={bounds}
          outerRef={(el) => {
            outers.current[i] = el
          }}
          tiltRef={(el) => {
            tilts.current[i] = el
          }}
        />
      ))}
    </>
  )
}

function FloatingObject({
  spec,
  index,
  bounds,
  outerRef,
  tiltRef,
}: {
  spec: FloatSpec
  index: number
  bounds: RefObject<HTMLElement | null>
  outerRef: (el: HTMLElement | null) => void
  tiltRef: (el: HTMLSpanElement | null) => void
}) {
  const hobby = getHobby(spec.id)!
  const { open } = useDossier()
  const [mood, setMood] = useState<Mood>('idle')
  const [z, setZ] = useState(1)
  const dragged = useRef(false)

  return (
    <motion.button
      ref={outerRef}
      type="button"
      className={cn('float-obj', !spec.mobile && 'float-obj--desktop')}
      style={
        {
          left: `${spec.x}%`,
          top: `${spec.y}%`,
          width: spec.mobile ? spec.size : `clamp(${Math.round(spec.size * 0.55)}px, ${(spec.size / 14.4).toFixed(2)}vw, ${Math.round(spec.size * 1.1)}px)`,
          zIndex: z,
        } as CSSProperties
      }
      aria-label={`${hobby.name} — open its dossier`}
      data-cursor="drag · click"
      drag
      dragConstraints={bounds}
      dragElastic={0.18}
      dragTransition={{ power: 0.35, timeConstant: 260, bounceStiffness: 320, bounceDamping: 16 }}
      whileDrag={{ scale: 1.1, rotate: spec.rot > 0 ? -8 : 8 }}
      whileTap={{ scale: 0.94 }}
      onPointerDown={() => {
        dragged.current = false
      }}
      onDragStart={() => {
        dragged.current = true
        setMood('wow')
        setZ(10 + index)
      }}
      onDragEnd={() => setMood('happy')}
      onHoverStart={() => setMood('wow')}
      onHoverEnd={() => setMood('idle')}
      onFocus={() => setMood('happy')}
      onBlur={() => setMood('idle')}
      onClick={() => {
        if (!dragged.current) open(hobby.id)
      }}
      initial={{ scale: 0, rotate: spec.rot - 40 }}
      animate={{ scale: 1, rotate: spec.rot }}
      transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.15 + index * 0.06 }}
    >
      <span ref={tiltRef} className="float-obj__tilt">
        <span
          className="float-obj__float amb-float"
          style={{ ['--dur' as string]: `${5 + (index % 4)}s`, ['--delay' as string]: `${-index * 0.7}s`, ['--fy' as string]: `${-8 - (index % 3) * 4}px` }}
        >
          <HobbyArt id={hobby.id} swatch={hobby.swatch} mood={mood} className="float-obj__art" />
        </span>
      </span>
      <span className="float-obj__tag label" aria-hidden="true">
        {hobby.name} ↗
      </span>
    </motion.button>
  )
}
