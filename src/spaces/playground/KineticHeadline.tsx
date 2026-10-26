import { useEffect, useRef, type ReactNode } from 'react'
import { hasFinePointer, onPointerMove, pointer } from '@/hooks/pointer'
import { cn } from '@/lib/format'
import { isCalm } from '@/motion/calm'
import { WEIRD_EVENT } from '@/components/layout/Watchers'

interface Line {
  text: string
  className?: string
  after?: ReactNode
}

/**
 * A headline whose letters stretch and thicken as the cursor passes — the
 * variable `wdth`/`wght` axes of Archivo, driven by CSS variables from one
 * rAF loop. Screen readers get the plain sentence.
 */
export function KineticHeadline({ lines, label, className }: { lines: Line[]; label: string; className?: string }) {
  const root = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el || !hasFinePointer()) return
    const letters = [...el.querySelectorAll<HTMLSpanElement>('[data-letter]')]
    let centers: { x: number; y: number }[] = []
    const measure = () => {
      letters.forEach((l) => l.style.setProperty('--k', '0'))
      centers = letters.map((l) => {
        const r = l.getBoundingClientRect()
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
      })
    }
    let measuredAt = 0
    const current = new Float32Array(letters.length)
    let raf = 0
    const R = 190

    const tick = () => {
      raf = 0
      const calm = isCalm()
      let moving = false
      // the headline doesn't move while hovering, so re-measure only on scroll or resize
      for (let i = 0; i < letters.length; i++) {
        const c = centers[i]
        let target = 0
        if (pointer.active && !calm && c) {
          const d = Math.hypot(pointer.x - c.x, pointer.y - c.y)
          target = d < R ? 1 - d / R : 0
          target = target * target * (3 - 2 * target)
        }
        const next = current[i] + (target - current[i]) * 0.2
        if (Math.abs(next - current[i]) > 0.002) moving = true
        current[i] = Math.abs(next - target) < 0.002 ? target : next
        letters[i].style.setProperty('--k', current[i].toFixed(3))
      }
      if (moving) raf = requestAnimationFrame(tick)
    }

    const wake = () => {
      if (performance.now() - measuredAt > 250 && !raf) {
        // centres are stale after scroll/resize; cheap to refresh when idle
        const k = [...current]
        measure()
        k.forEach((v, i) => letters[i].style.setProperty('--k', v.toFixed(3)))
        measuredAt = performance.now()
      }
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const stale = () => {
      measuredAt = 0
    }
    measure()
    const off = onPointerMove(wake)
    window.addEventListener('scroll', stale, { passive: true })
    window.addEventListener('resize', stale)
    return () => {
      off()
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', stale)
      window.removeEventListener('resize', stale)
    }
  }, [])

  // The magic word makes every letter jump once.
  useEffect(() => {
    const el = root.current
    if (!el) return
    const go = () => {
      el.classList.remove('is-weird')
      void el.offsetWidth
      el.classList.add('is-weird')
    }
    window.addEventListener(WEIRD_EVENT, go)
    return () => window.removeEventListener(WEIRD_EVENT, go)
  }, [])

  let n = 0
  return (
    <h1 ref={root} className={cn('kinetic', className)} aria-label={label}>
      {lines.map((line, li) => (
        <span key={li} className={cn('kinetic__line', line.className)} aria-hidden="true">
          {[...line.text].map((ch, i) =>
            ch === ' ' ? (
              <span key={i} className="kinetic__space">
                {' '}
              </span>
            ) : (
              <span key={i} data-letter className="kinetic__letter" style={{ ['--i' as string]: n++ }}>
                {ch}
              </span>
            ),
          )}
          {line.after}
        </span>
      ))}
    </h1>
  )
}
