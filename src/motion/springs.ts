import type { Transition } from 'motion/react'

/** The motion vocabulary. Every spring in the app comes from here. */
export const spring = {
  /** button / key travel */
  press: { type: 'spring', stiffness: 700, damping: 32 },
  /** state changes in UI chrome */
  snappy: { type: 'spring', stiffness: 520, damping: 32 },
  /** stickers, celebrations, pops */
  bouncy: { type: 'spring', stiffness: 420, damping: 14 },
  /** cards settling into a stack */
  heavy: { type: 'spring', stiffness: 260, damping: 28, mass: 1.3 },
  /** sheets, camera moves */
  gentle: { type: 'spring', stiffness: 140, damping: 20 },
  /** rebound after a near-miss swipe — a little wobble */
  rebound: { type: 'spring', stiffness: 520, damping: 20 },
} satisfies Record<string, Transition>

export const ease = {
  outExpo: [0.16, 1, 0.3, 1],
  inOut: [0.7, 0, 0.2, 1],
  in: [0.6, 0, 0.9, 0.4],
} as const
