import { useEffect, useLayoutEffect, useRef } from 'react'

export function isTypingTarget(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false
  if (t.isContentEditable) return true
  const tag = t.tagName
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (tag === 'INPUT') {
    const type = (t as HTMLInputElement).type
    return !['checkbox', 'radio', 'button', 'submit', 'range'].includes(type)
  }
  return false
}

type Handler = (e: KeyboardEvent) => void

/**
 * Global single-key shortcuts. Ignored while typing, with modifiers held,
 * or while a modal dialog is open (unless `allowInDialog`).
 */
export function useHotkeys(map: Record<string, Handler>, { enabled = true, allowInDialog = false } = {}) {
  const mapRef = useRef(map)
  useLayoutEffect(() => {
    mapRef.current = map
  })

  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
      if (isTypingTarget(e.target)) return
      if (!allowInDialog && document.querySelector('[data-modal-open="true"]')) return
      const handler = mapRef.current[e.key] ?? mapRef.current[e.key.toLowerCase()]
      if (handler) handler(e)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled, allowInDialog])
}
