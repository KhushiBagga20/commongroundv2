/**
 * Where the next channel-change curtain should grow from. Updated by every
 * pointerdown (capture phase) and explicitly by keyboard navigation.
 */
let origin = { x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 }

export function setTransitionOrigin(x: number, y: number) {
  origin = { x, y }
}

export function setOriginFromElement(el: Element | null) {
  if (!el) return
  const r = el.getBoundingClientRect()
  origin = { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

export function getTransitionOrigin() {
  return origin
}

if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointerdown',
    (e) => {
      origin = { x: e.clientX, y: e.clientY }
    },
    { capture: true, passive: true },
  )
}
