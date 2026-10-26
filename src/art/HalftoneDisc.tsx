import { memo, useMemo } from 'react'

/**
 * A true halftone disc: dots grow with distance from a light source, like a
 * printed shadow. Static geometry, so it's cheap to render and rotate.
 */
export const HalftoneDisc = memo(function HalftoneDisc({
  color,
  gap = 9,
  light = [0.28, 0.25],
  className,
  invert = false,
}: {
  color: string
  gap?: number
  light?: [number, number]
  className?: string
  invert?: boolean
}) {
  const dots = useMemo(() => {
    const out: { x: number; y: number; r: number }[] = []
    const R = 100
    const lx = light[0] * 200
    const ly = light[1] * 200
    for (let y = gap / 2; y < 200; y += gap) {
      const offset = (Math.round(y / gap) % 2) * (gap / 2)
      for (let x = gap / 2 + offset; x < 200; x += gap) {
        const dc = Math.hypot(x - R, y - R)
        if (dc > R - 1) continue
        let t = Math.hypot(x - lx, y - ly) / 200
        if (invert) t = 1 - t
        const r = Math.max(0.5, Math.min(gap * 0.56, gap * 0.62 * t * 1.25))
        out.push({ x, y, r })
      }
    }
    return out
  }, [gap, light, invert])

  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <g fill={color}>
        {dots.map((d, i) => (
          <circle key={i} cx={d.x.toFixed(1)} cy={d.y.toFixed(1)} r={d.r.toFixed(2)} />
        ))}
      </g>
    </svg>
  )
})
