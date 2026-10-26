import { useLayoutEffect, type DependencyList, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Runs GSAP setup inside a context scoped to `scope`, and reverts every tween
 * and ScrollTrigger it created on cleanup.
 */
export function useGsap(scope: RefObject<HTMLElement | null>, setup: (self: gsap.Context) => void, deps: DependencyList = []) {
  useLayoutEffect(() => {
    if (!scope.current) return
    const ctx = gsap.context(setup, scope.current)
    return () => ctx.revert()
  }, deps)
}

export { gsap, ScrollTrigger }
