import { memo, useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform, type PanInfo } from 'motion/react'
import type { Mood } from '@/art/primitives'
import { HobbyPoster, HobbyPosterBack } from '@/components/hobby/HobbyPoster'
import type { Hobby, Verdict } from '@/data/types'
import { cn } from '@/lib/format'
import { seeded } from '@/lib/random'
import { spring } from '@/motion/springs'

export interface Release {
  x: number
  y: number
  vx: number
  vy: number
  rotate: number
}

export type Lean = 'into' | 'nah' | 'later' | null

const THRESHOLD = 110
const FLICK = 620

/** Which way is a card leaning, given its offset? */
export function leanOf(x: number, y: number): { lean: Lean; amount: number } {
  if (y < -50 && Math.abs(x) < Math.abs(y) * 0.9) return { lean: 'later', amount: Math.min(1, (-y - 50) / 90) }
  if (x > 30) return { lean: 'into', amount: Math.min(1, (x - 30) / 90) }
  if (x < -30) return { lean: 'nah', amount: Math.min(1, (-x - 30) / 90) }
  return { lean: null, amount: 0 }
}

const MOOD: Record<Exclude<Lean, null>, Mood> = { into: 'happy', nah: 'meh', later: 'wow' }

interface DeckCardProps {
  hobby: Hobby
  /** 0 = top of the stack */
  depth: number
  flipped: boolean
  enterFrom?: { x: number; y: number } | null
  onDecide: (v: Verdict, r: Release) => void
  onFlip: () => void
  onOpen: () => void
  onLean: (lean: Lean, amount: number) => void
}

/**
 * A card in the stack. Only the top one is draggable: it rotates depending on
 * where you grabbed it, stamps show which way it's going, the illustration's
 * face reacts, and below the threshold it rubber-bands home with a wobble.
 */
export const DeckCard = memo(function DeckCard({ hobby, depth, flipped, enterFrom, onDecide, onFlip, onOpen, onLean }: DeckCardProps) {
  const top = depth === 0
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const grab = useRef(1)
  const moved = useRef(false)
  const [mood, setMood] = useState<Mood>('idle')
  const leanRef = useRef<Lean>(null)

  const rotate = useTransform(x, (v) => Math.max(-30, Math.min(30, v * 0.07 * grab.current)))
  const intoOpacity = useTransform([x, y], ([vx, vy]) => (leanOf(vx as number, vy as number).lean === 'into' ? leanOf(vx as number, vy as number).amount : 0))
  const nahOpacity = useTransform([x, y], ([vx, vy]) => (leanOf(vx as number, vy as number).lean === 'nah' ? leanOf(vx as number, vy as number).amount : 0))
  const laterOpacity = useTransform([x, y], ([vx, vy]) => (leanOf(vx as number, vy as number).lean === 'later' ? leanOf(vx as number, vy as number).amount : 0))

  const report = () => {
    const { lean, amount } = leanOf(x.get(), y.get())
    onLean(lean, amount)
    if (lean !== leanRef.current) {
      leanRef.current = lean
      setMood(lean ? MOOD[lean] : 'idle')
    }
  }
  useMotionValueEvent(x, 'change', report)
  useMotionValueEvent(y, 'change', report)

  // An undone card slides back in from the side it left.
  useEffect(() => {
    if (!enterFrom) return
    x.set(enterFrom.x)
    y.set(enterFrom.y)
    animate(x, 0, spring.rebound)
    animate(y, 0, spring.rebound)
  }, [enterFrom, x, y])

  const tilt = (seeded(hobby.id)() - 0.5) * 6
  const pose = top ? { scale: 1, y: 0, rotate: 0 } : { scale: 1 - depth * 0.05, y: depth * 18, rotate: tilt * depth * 0.6 }

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const cx = x.get()
    const cy = y.get()
    const { velocity: v } = info
    let verdict: Verdict | null = null
    if (cy < -THRESHOLD && Math.abs(cx) < -cy) verdict = 'later'
    else if (cx > THRESHOLD || (v.x > FLICK && cx > 24)) verdict = 'into'
    else if (cx < -THRESHOLD || (v.x < -FLICK && cx < -24)) verdict = 'nah'
    else if (v.y < -FLICK && cy < -24) verdict = 'later'
    if (verdict) onDecide(verdict, { x: cx, y: cy, vx: v.x, vy: v.y, rotate: rotate.get() })
  }

  return (
    <motion.div
      className={cn('deck-card', top && 'deck-card--top')}
      style={{ zIndex: 10 - depth }}
      initial={{ scale: 0.85, y: 50, opacity: 0 }}
      animate={{ ...pose, opacity: depth > 2 ? 0 : 1 }}
      transition={spring.heavy}
    >
      <motion.div
        className="deck-card__drag"
        style={{ x, y, rotate }}
        drag={top}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.82}
        dragTransition={{ bounceStiffness: 520, bounceDamping: 18 }}
        whileDrag={{ scale: 1.03 }}
        onPointerDown={(e) => {
          moved.current = false
          const r = e.currentTarget.getBoundingClientRect()
          grab.current = e.clientY - r.top < r.height / 2 ? 1 : -1
        }}
        onDragStart={() => {
          moved.current = true
        }}
        onDragEnd={onDragEnd}
        onClick={() => {
          if (top && !moved.current) onFlip()
        }}
        data-cursor={top ? 'swipe · tap to flip' : undefined}
        aria-hidden={!top}
      >
        <motion.div className="deck-card__flip" style={{ transformPerspective: 1400 }} animate={{ rotateY: flipped ? 180 : 0 }} transition={spring.snappy}>
          <div className="deck-card__face">
            <HobbyPoster hobby={hobby} mood={mood} />
          </div>
          <div className="deck-card__face deck-card__face--back">{top && <HobbyPosterBack hobby={hobby} onOpen={onOpen} />}</div>
        </motion.div>
        {top && (
          <>
            <motion.span className="verdict-stamp verdict-stamp--into display" style={{ opacity: intoOpacity }} aria-hidden="true">
              Into it
            </motion.span>
            <motion.span className="verdict-stamp verdict-stamp--nah display" style={{ opacity: nahOpacity }} aria-hidden="true">
              Nah
            </motion.span>
            <motion.span className="verdict-stamp verdict-stamp--later display" style={{ opacity: laterOpacity }} aria-hidden="true">
              Later
            </motion.span>
          </>
        )}
      </motion.div>
    </motion.div>
  )
})

/** A decided card leaving the stack with the momentum it was released with. */
export function FlyingCard({ hobby, verdict, from, onDone }: { hobby: Hobby; verdict: Verdict; from: Release; onDone: () => void }) {
  const dir = verdict === 'into' ? 1 : verdict === 'nah' ? -1 : 0
  const w = window.innerWidth
  const h = window.innerHeight
  const tx = dir ? dir * (w * 0.55 + 420) : from.x + from.vx * 0.15
  const ty = verdict === 'later' ? -(h * 0.7 + 480) : from.y + Math.max(-300, Math.min(300, from.vy * 0.25))
  const tr = from.rotate + (dir ? dir * 28 : -10)
  return (
    <motion.div className="deck-card deck-card--flying" style={{ zIndex: 20 }} aria-hidden="true">
      <motion.div
        className="deck-card__drag"
        initial={{ x: from.x, y: from.y, rotate: from.rotate, scale: 1.03 }}
        animate={{ x: tx, y: ty, rotate: tr, scale: verdict === 'later' ? 0.6 : 1 }}
        transition={{
          x: { type: 'spring', velocity: from.vx || dir * 1400, visualDuration: 0.5, bounce: 0 },
          y: { type: 'spring', velocity: verdict === 'later' ? Math.min(from.vy, -1400) : from.vy, visualDuration: 0.5, bounce: 0 },
          rotate: { duration: 0.5, ease: 'easeOut' },
          scale: { duration: 0.5 },
        }}
        onAnimationComplete={onDone}
      >
        <HobbyPoster hobby={hobby} mood={verdict === 'into' ? 'happy' : verdict === 'nah' ? 'meh' : 'wink'} />
      </motion.div>
    </motion.div>
  )
}
