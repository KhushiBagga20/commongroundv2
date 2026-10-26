import { useEffect, useState, type RefObject } from 'react'

/**
 * Marks an element with [data-offscreen] while it's out of view so CSS can
 * pause its ambient animations. Optionally reports visibility to callers that
 * run their own loops.
 */
export function useOffscreen<T extends Element>(ref: RefObject<T | null>, margin = '120px'): boolean {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        const on = entry.isIntersecting
        if (on) el.removeAttribute('data-offscreen')
        else el.setAttribute('data-offscreen', '')
        setVisible(on)
      },
      { rootMargin: margin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, margin])
  return visible
}
