import { useEffect, type RefObject } from 'react'
import { isCalm } from '@/motion/calm'

/**
 * Mouse drag-to-scroll with momentum for horizontal galleries. Touch keeps
 * native scrolling; a drag longer than a few pixels swallows the click.
 */
export function useDragScroll(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let down = false
    let moved = false
    let startX = 0
    let lastX = 0
    let lastT = 0
    let v = 0
    let raf = 0

    const glide = () => {
      el.scrollLeft -= v
      v *= 0.93
      if (Math.abs(v) > 0.3) raf = requestAnimationFrame(glide)
      else el.style.scrollSnapType = ''
    }

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      down = true
      moved = false
      startX = lastX = e.clientX
      lastT = performance.now()
      v = 0
      cancelAnimationFrame(raf)
    }
    const onMove = (e: PointerEvent) => {
      if (!down) return
      const dx = e.clientX - lastX
      if (!moved && Math.abs(e.clientX - startX) > 5) {
        moved = true
        el.style.scrollSnapType = 'none'
        el.classList.add('is-dragging')
      }
      if (!moved) return
      el.scrollLeft -= dx
      const now = performance.now()
      v = (dx / Math.max(1, now - lastT)) * 16
      lastX = e.clientX
      lastT = now
    }
    const onUp = () => {
      if (!down) return
      down = false
      el.classList.remove('is-dragging')
      if (moved && !isCalm()) raf = requestAnimationFrame(glide)
      else el.style.scrollSnapType = ''
    }
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault()
        e.stopPropagation()
        moved = false
      }
    }
    el.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', onUp)
    el.addEventListener('click', onClick, true)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      el.removeEventListener('click', onClick, true)
    }
  }, [ref])
}
