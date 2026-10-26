import type { PatternId } from '@/data/types'

/** CSS background-image recipes for room / project identities. Cheap, static, resolution-independent. */

const svg = (body: string, w: number, h: number) =>
  `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>${body}</svg>`)}")`

export function patternCSS(pattern: PatternId, fg: string, scale = 1): { backgroundImage: string; backgroundSize: string } {
  const s = (n: number) => Math.round(n * scale)
  switch (pattern) {
    case 'dots':
      return { backgroundImage: `radial-gradient(${fg} 22%, transparent 24%)`, backgroundSize: `${s(18)}px ${s(18)}px` }
    case 'stripes':
      return { backgroundImage: `repeating-linear-gradient(90deg, ${fg} 0 ${s(10)}px, transparent ${s(10)}px ${s(26)}px)`, backgroundSize: 'auto' }
    case 'checks':
      return { backgroundImage: `conic-gradient(${fg} 25%, transparent 0 50%, ${fg} 0 75%, transparent 0)`, backgroundSize: `${s(28)}px ${s(28)}px` }
    case 'grid':
      return {
        backgroundImage: `linear-gradient(${fg} 1.5px, transparent 1.5px), linear-gradient(90deg, ${fg} 1.5px, transparent 1.5px)`,
        backgroundSize: `${s(22)}px ${s(22)}px`,
      }
    case 'rings':
      return { backgroundImage: `repeating-radial-gradient(circle at 70% 30%, ${fg} 0 ${s(3)}px, transparent ${s(3)}px ${s(16)}px)`, backgroundSize: 'auto' }
    case 'waves':
      return {
        backgroundImage: svg(`<path d='M0 12 q10 -10 20 0 t20 0' fill='none' stroke='${fg}' stroke-width='3' stroke-linecap='round'/>`, 40, 22),
        backgroundSize: `${s(40)}px ${s(22)}px`,
      }
    case 'zigzag':
      return {
        backgroundImage: svg(`<path d='M0 16 l10 -10 l10 10 l10 -10 l10 10' fill='none' stroke='${fg}' stroke-width='3' stroke-linejoin='round'/>`, 40, 22),
        backgroundSize: `${s(40)}px ${s(22)}px`,
      }
    case 'stars':
      return {
        backgroundImage: svg(
          `<path d='M14 4 q1.6 8.4 10 10 q-8.4 1.6 -10 10 q-1.6 -8.4 -10 -10 q8.4 -1.6 10 -10 z' fill='${fg}'/><circle cx='40' cy='34' r='2' fill='${fg}'/><circle cx='30' cy='8' r='1.2' fill='${fg}'/>`,
          50,
          46,
        ),
        backgroundSize: `${s(50)}px ${s(46)}px`,
      }
    case 'confetti':
      return {
        backgroundImage: svg(
          `<rect x='6' y='8' width='10' height='4' rx='2' transform='rotate(30 11 10)' fill='${fg}'/><circle cx='34' cy='14' r='3' fill='${fg}'/><path d='M22 34 l6 -8 l6 8 z' fill='${fg}'/><rect x='40' y='38' width='9' height='4' rx='2' transform='rotate(-25 44 40)' fill='${fg}'/>`,
          54,
          50,
        ),
        backgroundSize: `${s(54)}px ${s(50)}px`,
      }
  }
}

/** A colour with alpha, for pattern ink that sits quietly behind content. */
export function alpha(hex: string, a: number): string {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16)
  return `rgb(${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255} / ${a})`
}
