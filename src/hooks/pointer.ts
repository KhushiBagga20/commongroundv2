import { useEffect, useSyncExternalStore, type RefObject } from 'react'
import { isCalm } from '@/motion/calm'

const fineQuery = typeof window !== 'undefined' ? window.matchMedia('(hover: hover) and (pointer: fine)') : null

function subscribeFine(cb: () => void) {
  fineQuery?.addEventListener('change', cb)
  return () => fineQuery?.removeEventListener('change', cb)
}

/** True on devices with a precise hovering pointer (mouse / trackpad). */
export function useFinePointer(): boolean {
  return useSyncExternalStore(
    subscribeFine,
    () => !!fineQuery?.matches,
    () => false,
  )
}

export const hasFinePointer = () => !!fineQuery?.matches

/**
 * Shared pointer position for all proximity effects: one passive listener,
 * subscribers read from it inside their own rAF loops. No React state.
 */
export const pointer = { x: -9999, y: -9999, active: false }
const moveListeners = new Set<() => void>()

if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.active = true
      moveListeners.forEach((fn) => fn())
    },
    { passive: true },
  )
  document.documentElement.addEventListener('pointerleave', () => {
    pointer.active = false
    moveListeners.forEach((fn) => fn())
  })
}

/** Subscribe to pointer movement; use it to wake an idle rAF loop. */
export function onPointerMove(fn: () => void): () => void {
  moveListeners.add(fn)
  return () => moveListeners.delete(fn)
}

/**
 * Magnetic pull: the element drifts toward the cursor when it's within
 * `radius` px. Writes transforms directly and sleeps when settled.
 * Fine pointers only, never in calm mode.
 */
export function useMagnetic<T extends HTMLElement>(ref: RefObject<T | null>, { strength = 0.3, radius = 90 } = {}) {
  useEffect(() => {
    const el = ref.current
    if (!el || !hasFinePointer()) return
    let raf = 0
    let x = 0
    let y = 0

    const tick = () => {
      raf = 0
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2 - x
      const cy = rect.top + rect.height / 2 - y
      const dx = pointer.x - cx
      const dy = pointer.y - cy
      const near = pointer.active && !isCalm() && Math.hypot(dx, dy) < radius + Math.max(rect.width, rect.height) / 2
      const tx = near ? dx * strength : 0
      const ty = near ? dy * strength : 0
      x += (tx - x) * 0.2
      y += (ty - y) * 0.2
      if (Math.abs(x - tx) < 0.1 && Math.abs(y - ty) < 0.1) {
        x = tx
        y = ty
        el.style.transform = x || y ? `translate3d(${x}px, ${y}px, 0)` : ''
        return
      }
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`
      raf = requestAnimationFrame(tick)
    }
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const off = onPointerMove(wake)
    return () => {
      off()
      cancelAnimationFrame(raf)
      el.style.transform = ''
    }
  }, [ref, strength, radius])
}
