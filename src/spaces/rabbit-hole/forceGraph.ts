/**
 * A tiny force simulation for ~40 nodes: pairwise repulsion, springy links,
 * a soft pull toward each category's neighbourhood, and damping. Small enough
 * to read in one sitting; no dependency needed at this scale.
 */
import { mulberry32 } from '@/lib/random'

export interface SimNode {
  id: string
  group: string
  x: number
  y: number
  vx: number
  vy: number
  /** pinned position while being dragged */
  fx: number | null
  fy: number | null
}

export interface SimLink {
  a: number
  b: number
}

export interface SimOptions {
  repulse: number
  linkLength: number
  linkStrength: number
  groupPull: number
  centerPull: number
  damping: number
  groupRadius: number
}

const DEFAULTS: SimOptions = {
  repulse: 105000,
  linkLength: 210,
  linkStrength: 0.017,
  groupPull: 0.028,
  centerPull: 0.0009,
  damping: 0.82,
  groupRadius: 730,
}

export class ForceGraph {
  nodes: SimNode[]
  links: SimLink[]
  alpha = 1
  alphaTarget = 0
  private anchors: Map<string, { x: number; y: number }>
  private opts: SimOptions

  constructor(nodes: { id: string; group: string }[], links: { a: string; b: string }[], groups: string[], opts: Partial<SimOptions> = {}) {
    this.opts = { ...DEFAULTS, ...opts }
    const rand = mulberry32(7)
    this.anchors = new Map(
      groups.map((g, i) => {
        const angle = (i / groups.length) * Math.PI * 2 - Math.PI / 2
        return [g, { x: Math.cos(angle) * this.opts.groupRadius, y: Math.sin(angle) * this.opts.groupRadius * 0.78 }]
      }),
    )
    this.nodes = nodes.map((n) => {
      const a = this.anchors.get(n.group) ?? { x: 0, y: 0 }
      return { id: n.id, group: n.group, x: a.x + (rand() - 0.5) * 220, y: a.y + (rand() - 0.5) * 220, vx: 0, vy: 0, fx: null, fy: null }
    })
    const index = new Map(this.nodes.map((n, i) => [n.id, i]))
    this.links = links.filter((l) => index.has(l.a) && index.has(l.b)).map((l) => ({ a: index.get(l.a)!, b: index.get(l.b)! }))
  }

  tick() {
    const { repulse, linkLength, linkStrength, groupPull, centerPull, damping } = this.opts
    const n = this.nodes
    this.alpha += (this.alphaTarget - this.alpha) * 0.025
    const a = this.alpha

    for (let i = 0; i < n.length; i++) {
      const p = n[i]
      for (let j = i + 1; j < n.length; j++) {
        const q = n[j]
        let dx = q.x - p.x
        let dy = q.y - p.y
        let d2 = dx * dx + dy * dy
        if (d2 < 1) {
          dx = Math.random() - 0.5
          dy = Math.random() - 0.5
          d2 = 1
        }
        if (d2 > 640000) continue
        const d = Math.sqrt(d2)
        const f = (repulse / Math.max(d2, 900)) * a
        const fx = (dx / d) * f
        const fy = (dy / d) * f
        p.vx -= fx
        p.vy -= fy
        q.vx += fx
        q.vy += fy
      }
    }

    for (const l of this.links) {
      const p = n[l.a]
      const q = n[l.b]
      const dx = q.x - p.x
      const dy = q.y - p.y
      const d = Math.sqrt(dx * dx + dy * dy) || 1
      const f = (d - linkLength) * linkStrength * a
      const fx = (dx / d) * f
      const fy = (dy / d) * f
      p.vx += fx
      p.vy += fy
      q.vx -= fx
      q.vy -= fy
    }

    for (const p of n) {
      const anchor = this.anchors.get(p.group)
      if (anchor) {
        p.vx += (anchor.x - p.x) * groupPull * a
        p.vy += (anchor.y - p.y) * groupPull * a
      }
      p.vx -= p.x * centerPull * a
      p.vy -= p.y * centerPull * a
      if (p.fx != null && p.fy != null) {
        p.x = p.fx
        p.y = p.fy
        p.vx = 0
        p.vy = 0
        continue
      }
      p.vx *= damping
      p.vy *= damping
      p.x += p.vx
      p.y += p.vy
    }
  }

  /** Run silently until calm, so the first frame is already composed. */
  settle(iterations = 420) {
    this.alpha = 1
    for (let i = 0; i < iterations; i++) this.tick()
    this.alpha = 0.001
  }

  reheat(to = 0.35) {
    this.alpha = Math.max(this.alpha, to)
  }

  get active() {
    return this.alpha > 0.004 || this.alphaTarget > 0
  }

  bounds() {
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const p of this.nodes) {
      minX = Math.min(minX, p.x)
      minY = Math.min(minY, p.y)
      maxX = Math.max(maxX, p.x)
      maxY = Math.max(maxY, p.y)
    }
    return { minX, minY, maxX, maxY }
  }
}
