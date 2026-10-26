import { useEffect, useSyncExternalStore } from 'react'
import { useCollector } from '@/store/collector'

/**
 * Calm mode = reduced motion. Follows the OS setting unless the visitor
 * overrides it from the top-right toggle. Mirrors the pre-paint script in
 * index.html, which reads the same persisted preference.
 */
const query = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null

function subscribe(cb: () => void) {
  query?.addEventListener('change', cb)
  return () => query?.removeEventListener('change', cb)
}

const systemPrefersCalm = () => !!query?.matches

export function useCalm(): boolean {
  const pref = useCollector((s) => s.motion)
  const system = useSyncExternalStore(subscribe, systemPrefersCalm, () => false)
  return pref === 'calm' || (pref === 'system' && system)
}

/** Imperative read for animation code that runs outside React render. */
export function isCalm(): boolean {
  return document.documentElement.dataset.motion === 'calm'
}

/** Keeps <html data-motion> in sync; mounted once in the shell. */
export function useCalmAttribute() {
  const calm = useCalm()
  useEffect(() => {
    document.documentElement.dataset.motion = calm ? 'calm' : 'full'
  }, [calm])
  return calm
}
