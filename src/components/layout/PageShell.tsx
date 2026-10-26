import { useState, type ReactNode } from 'react'
import { motion, useIsPresent, usePresenceData } from 'motion/react'
import { useCalm } from '@/motion/calm'
import { getTransitionOrigin } from '@/motion/origin'
import { ease, spring } from '@/motion/springs'
import type { ChannelMeta } from './spaces'

/**
 * Channel change. On exit, a disc in the destination's colour grows from the
 * point you clicked and carries the channel name; on enter, that disc lifts
 * away as a curved wipe while the new space rises into place.
 */
export function PageShell({ meta, children }: { meta: ChannelMeta; children: ReactNode }) {
  const calm = useCalm()
  const isPresent = useIsPresent()
  const exiting = usePresenceData() as { next: ChannelMeta } | undefined
  const [enterOrigin] = useState(getTransitionOrigin)
  const shown = !isPresent && exiting?.next ? exiting.next : meta
  const o = isPresent ? enterOrigin : getTransitionOrigin()
  const vw = window.innerWidth
  const vh = window.innerHeight
  const D = 2 * Math.hypot(Math.max(o.x, vw - o.x), Math.max(o.y, vh - o.y)) + 40

  // The content wrapper is always the first child, so toggling calm mode never remounts the page.
  return (
    <>
      <motion.div
        initial={calm ? { opacity: 0 } : { y: 28 }}
        animate={calm ? { opacity: 1 } : { y: 0 }}
        exit={calm ? { opacity: 0 } : { y: -10 }}
        transition={calm ? { duration: 0.15 } : { ...spring.gentle, delay: 0.12 }}
      >
        {children}
      </motion.div>
      {!calm && <Curtain o={o} D={D} shown={shown} />}
    </>
  )
}

function Curtain({ o, D, shown }: { o: { x: number; y: number }; D: number; shown: ChannelMeta }) {
  return (
    <>
      <motion.div
        aria-hidden="true"
        className="curtain"
        style={{ left: o.x - D / 2, top: o.y - D / 2, width: D, height: D, background: shown.color }}
        initial={{ scale: 1, y: 0 }}
        animate={{ scale: 1, y: -(o.y + D / 2 + 40), transition: { duration: 0.62, ease: ease.inOut, delay: 0.06 } }}
        exit={{ scale: [0, 1], y: [0, 0], transition: { duration: 0.36, ease: ease.in } }}
      />
      <motion.div
        aria-hidden="true"
        className="curtain-label"
        style={{ color: shown.fg }}
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 0, y: -80, transition: { duration: 0.4, ease: ease.in, delay: 0.08 } }}
        exit={{ opacity: [0, 1], y: [40, 0], transition: { duration: 0.3, ease: ease.outExpo, delay: 0.1 } }}
      >
        <span className="pixel curtain-label__no">CH {shown.no}</span>
        <span className="display curtain-label__name">{shown.name}</span>
      </motion.div>
    </>
  )
}
