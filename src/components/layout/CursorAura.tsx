import { useEffect, useRef } from 'react'
import { onPointerMove, pointer, useFinePointer } from '@/hooks/pointer'
import { useCalm } from '@/motion/calm'

/**
 * A soft ink ring that trails the native cursor (which always stays visible)
 * and names what an object does: drag, swipe, open, pull, pan. Hidden over
 * text inputs; never rendered on touch devices or in calm mode.
 */
export function CursorAura() {
  const fine = useFinePointer()
  const calm = useCalm()
  const ref = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!fine || calm || !el) return
    let x = pointer.x
    let y = pointer.y
    let raf = 0
    const tick = () => {
      raf = 0
      x += (pointer.x - x) * 0.24
      y += (pointer.y - y) * 0.24
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
      if (Math.abs(pointer.x - x) > 0.2 || Math.abs(pointer.y - y) > 0.2) raf = requestAnimationFrame(tick)
    }
    const off = onPointerMove(() => {
      if (!pointer.active) el.dataset.state = 'hidden'
      else if (el.dataset.state === 'hidden') el.dataset.state = 'idle'
      if (!raf) raf = requestAnimationFrame(tick)
    })
    const over = (e: PointerEvent) => {
      const t = e.target instanceof Element ? e.target : null
      if (!t) return
      const typing = t.closest('input:not([type="checkbox"]):not([type="radio"]), textarea, select, [contenteditable="true"]')
      const target = t.closest<HTMLElement>('[data-cursor]')
      const interactive = t.closest('a, button, [role="button"], label, summary')
      el.dataset.state = typing ? 'hidden' : target ? 'label' : interactive ? 'hover' : 'idle'
      if (labelRef.current) labelRef.current.textContent = target?.dataset.cursor ?? ''
    }
    const down = () => el.classList.add('is-down')
    const up = () => el.classList.remove('is-down')
    document.addEventListener('pointerover', over, { passive: true })
    window.addEventListener('pointerdown', down, { passive: true })
    window.addEventListener('pointerup', up, { passive: true })
    return () => {
      off()
      cancelAnimationFrame(raf)
      document.removeEventListener('pointerover', over)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
    }
  }, [fine, calm])

  if (!fine || calm) return null
  return (
    <div ref={ref} className="aura" data-state="hidden" aria-hidden="true">
      <span className="aura__ring" />
      <span ref={labelRef} className="aura__label pixel" />
    </div>
  )
}
