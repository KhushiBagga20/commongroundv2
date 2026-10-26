import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, type CSSProperties } from 'react'
import { HobbyArt } from '@/art/HobbyArt'
import { CATEGORIES } from '@/data/palette'
import { getHobby, listConnections, listHobbies, swatchOf } from '@/data/repository'
import { cn } from '@/lib/format'
import { isCalm } from '@/motion/calm'
import { ForceGraph } from './forceGraph'

export interface HoleMapHandle {
  zoomBy: (factor: number) => void
  fit: () => void
  flyTo: (id: string) => void
}

export type NodeStatus = 'into' | 'later' | 'nah' | 'seen' | 'new'

interface Props {
  focus: string | null
  onFocus: (id: string | null) => void
  statusOf: (id: string) => NodeStatus
  /** space taken by the field-notes panel, so the camera centres in what's left */
  inset: { right: number; bottom: number }
}

const MIN_K = 0.3
const MAX_K = 2.2
const clampK = (k: number) => Math.min(MAX_K, Math.max(MIN_K, k))

/**
 * The constellation. Nodes are real buttons (so Tab/Enter work); positions,
 * camera and strings are written straight to the DOM from one rAF loop.
 */
export const HoleMap = forwardRef<HoleMapHandle, Props>(function HoleMap({ focus, onFocus, statusOf, inset }, ref) {
  const viewport = useRef<HTMLDivElement>(null)
  const world = useRef<HTMLDivElement>(null)
  const nodeEls = useRef(new Map<string, HTMLButtonElement>())
  const lineEls = useRef<(SVGLineElement | null)[]>([])
  const labelEls = useRef(new Map<number, HTMLSpanElement>())
  const raf = useRef(0)
  const cam = useRef({ x: 0, y: 0, k: 0.7, target: null as null | { x: number; y: number; k: number }, vx: 0, vy: 0 })
  const insetRef = useRef(inset)
  const focusRef = useRef(focus)
  useLayoutEffect(() => {
    insetRef.current = inset
    focusRef.current = focus
  })

  const hobbies = listHobbies()
  const connections = listConnections()
  const sim = useMemo(() => {
    const g = new ForceGraph(
      hobbies.map((h) => ({ id: h.id, group: h.category })),
      connections,
      CATEGORIES.map((c) => c.id),
    )
    g.settle()
    return g
    // the catalogue is static
  }, [hobbies, connections])
  const indexOf = useMemo(() => new Map(sim.nodes.map((n, i) => [n.id, i])), [sim])

  const focusEdges = useMemo(() => {
    if (!focus) return new Set<number>()
    return new Set(sim.links.map((l, i) => (sim.nodes[l.a].id === focus || sim.nodes[l.b].id === focus ? i : -1)).filter((i) => i >= 0))
  }, [focus, sim])
  const near = useMemo(() => {
    const s = new Set<string>()
    focusEdges.forEach((i) => {
      s.add(sim.nodes[sim.links[i].a].id)
      s.add(sim.nodes[sim.links[i].b].id)
    })
    return s
  }, [focusEdges, sim])

  const applyCamera = useCallback(() => {
    const c = cam.current
    if (world.current) world.current.style.transform = `translate3d(${c.x.toFixed(2)}px, ${c.y.toFixed(2)}px, 0) scale(${c.k.toFixed(4)})`
    viewport.current?.style.setProperty('--k', c.k.toFixed(3))
  }, [])

  const draw = useCallback(() => {
    for (const p of sim.nodes) {
      const el = nodeEls.current.get(p.id)
      if (el) el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`
    }
    sim.links.forEach((l, i) => {
      const line = lineEls.current[i]
      if (!line) return
      const p = sim.nodes[l.a]
      const q = sim.nodes[l.b]
      line.setAttribute('x1', p.x.toFixed(1))
      line.setAttribute('y1', p.y.toFixed(1))
      line.setAttribute('x2', q.x.toFixed(1))
      line.setAttribute('y2', q.y.toFixed(1))
      const label = labelEls.current.get(i)
      if (label) {
        // sit the label nearer the far end so labels fan out instead of piling up at the focus
        const from = p.id === focusRef.current ? p : q
        const to = from === p ? q : p
        const t = 0.62
        label.style.transform = `translate3d(${(from.x + (to.x - from.x) * t).toFixed(1)}px, ${(from.y + (to.y - from.y) * t).toFixed(1)}px, 0)`
      }
    })
  }, [sim])

  const loop = useCallback(
    function step() {
      raf.current = 0
      let again = false
      if (sim.active) {
        sim.tick()
        draw()
        again = true
      }
      const c = cam.current
      if (c.target) {
        const t = c.target
        const e = isCalm() ? 1 : 0.14
        c.x += (t.x - c.x) * e
        c.y += (t.y - c.y) * e
        c.k += (t.k - c.k) * e
        if (Math.abs(t.x - c.x) < 0.5 && Math.abs(t.y - c.y) < 0.5 && Math.abs(t.k - c.k) < 0.002) {
          c.x = t.x
          c.y = t.y
          c.k = t.k
          c.target = null
        } else again = true
        applyCamera()
      } else if (Math.abs(c.vx) > 0.1 || Math.abs(c.vy) > 0.1) {
        c.x += c.vx
        c.y += c.vy
        c.vx *= 0.92
        c.vy *= 0.92
        applyCamera()
        again = true
      }
      if (again) raf.current = requestAnimationFrame(step)
    },
    [sim, draw, applyCamera],
  )

  const kick = useCallback(() => {
    if (!raf.current) raf.current = requestAnimationFrame(loop)
  }, [loop])

  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current)
      raf.current = 0
    },
    [],
  )

  // camera helpers ----------------------------------------------------------
  const area = () => {
    const v = viewport.current!.getBoundingClientRect()
    const i = insetRef.current
    return { w: v.width - i.right, h: v.height - i.bottom, rect: v }
  }

  const fitTarget = useCallback(() => {
    const b = sim.bounds()
    const { w, h } = area()
    const pad = 140
    const k = clampK(Math.min(w / (b.maxX - b.minX + pad * 2), (h - 120) / (b.maxY - b.minY + pad * 2)))
    return { k, x: w / 2 - ((b.minX + b.maxX) / 2) * k, y: (h + 60) / 2 - ((b.minY + b.maxY) / 2) * k }
  }, [sim])

  const zoomAt = useCallback(
    (px: number, py: number, factor: number) => {
      const c = cam.current
      const base = c.target ?? c
      const k = clampK(base.k * factor)
      const r = k / base.k
      c.target = { k, x: px - (px - base.x) * r, y: py - (py - base.y) * r }
      c.vx = c.vy = 0
      kick()
    },
    [kick],
  )

  const flyTo = useCallback(
    (id: string) => {
      const p = sim.nodes[indexOf.get(id) ?? -1]
      if (!p) return
      const { w, h } = area()
      const k = Math.max(cam.current.k, 1)
      cam.current.target = { k, x: w / 2 - p.x * k, y: h / 2 + 20 - p.y * k }
      cam.current.vx = cam.current.vy = 0
      kick()
    },
    [sim, indexOf, kick],
  )

  useImperativeHandle(
    ref,
    () => ({
      zoomBy: (f) => {
        const { w, h } = area()
        zoomAt(w / 2, h / 2, f)
      },
      fit: () => {
        cam.current.target = fitTarget()
        kick()
      },
      flyTo,
    }),
    [zoomAt, fitTarget, flyTo, kick],
  )

  // first frame: composed, fitted, no animation
  useLayoutEffect(() => {
    draw()
    // start readable rather than tiny: never below 0.6 even if the edges crop
    const t = fitTarget()
    const k = Math.max(t.k, 0.6)
    const { w, h } = area()
    const b = sim.bounds()
    Object.assign(cam.current, { k, x: w / 2 - ((b.minX + b.maxX) / 2) * k, y: (h + 60) / 2 - ((b.minY + b.maxY) / 2) * k })
    applyCamera()
  }, [draw, fitTarget, applyCamera, sim])

  // refocus when the panel changes the usable area
  useEffect(() => {
    if (focus) flyTo(focus)
  }, [focus, inset.right, inset.bottom, flyTo])

  // pointer: pan, pinch, node drag --------------------------------------------
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const gesture = useRef<{ mode: 'pan' | 'node' | 'pinch' | null; id?: string; moved: boolean; last: { x: number; y: number; t: number }; dist?: number }>({
    mode: null,
    moved: false,
    last: { x: 0, y: 0, t: 0 },
  })
  const suppressClick = useRef(false)

  const tryCapture = (id: number) => {
    try {
      viewport.current?.setPointerCapture(id)
    } catch {
      // pointer already released
    }
  }

  const toWorld = (clientX: number, clientY: number) => {
    const r = viewport.current!.getBoundingClientRect()
    const c = cam.current
    return { x: (clientX - r.left - c.x) / c.k, y: (clientY - r.top - c.y) / c.k }
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const g = gesture.current
    cam.current.target = null
    cam.current.vx = cam.current.vy = 0
    if (pointers.current.size === 2) {
      // a second finger: capture both so the pinch survives leaving the map
      pointers.current.forEach((_, id) => viewport.current?.hasPointerCapture(id) || tryCapture(id))
      const [a, b] = [...pointers.current.values()]
      g.mode = 'pinch'
      g.dist = Math.hypot(a.x - b.x, a.y - b.y)
      g.last = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, t: performance.now() }
      return
    }
    const nodeEl = (e.target as HTMLElement).closest<HTMLElement>('[data-node]')
    g.moved = false
    g.last = { x: e.clientX, y: e.clientY, t: performance.now() }
    if (nodeEl) {
      g.mode = 'node'
      g.id = nodeEl.dataset.node
    } else {
      g.mode = 'pan'
      viewport.current?.classList.add('is-panning')
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const g = gesture.current
    const c = cam.current
    const now = performance.now()
    if (g.mode === 'pinch' && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()]
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      const r = viewport.current!.getBoundingClientRect()
      const k = clampK(c.k * (dist / (g.dist || dist)))
      const ratio = k / c.k
      const px = mid.x - r.left
      const py = mid.y - r.top
      c.x = px - (px - c.x) * ratio + (mid.x - g.last.x)
      c.y = py - (py - c.y) * ratio + (mid.y - g.last.y)
      c.k = k
      g.dist = dist
      g.last = { ...mid, t: now }
      applyCamera()
      return
    }
    const dx = e.clientX - g.last.x
    const dy = e.clientY - g.last.y
    if (!g.moved && Math.hypot(dx, dy) < 4) return
    // capture only once it's really a drag, so a plain click still reaches the sticker
    if (!g.moved) tryCapture(e.pointerId)
    if (g.mode === 'pan') {
      g.moved = true
      c.x += dx
      c.y += dy
      const dt = Math.max(1, now - g.last.t)
      c.vx = (dx / dt) * 16
      c.vy = (dy / dt) * 16
      applyCamera()
    } else if (g.mode === 'node' && g.id) {
      g.moved = true
      const p = sim.nodes[indexOf.get(g.id)!]
      const w = toWorld(e.clientX, e.clientY)
      p.fx = w.x
      p.fy = w.y
      sim.alphaTarget = 0.22
      sim.reheat(0.3)
      viewport.current?.classList.add('is-dragging-node')
      kick()
    }
    g.last = { x: e.clientX, y: e.clientY, t: now }
  }

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId)
    const g = gesture.current
    if (g.mode === 'node' && g.id) {
      const p = sim.nodes[indexOf.get(g.id)!]
      p.fx = p.fy = null
      sim.alphaTarget = 0
      if (g.moved) suppressClick.current = true
      kick()
    }
    if (g.mode === 'pan') {
      if (g.moved) suppressClick.current = true
      if (isCalm() || performance.now() - g.last.t > 80) cam.current.vx = cam.current.vy = 0
      kick()
    }
    if (pointers.current.size === 0) {
      g.mode = null
      viewport.current?.classList.remove('is-panning', 'is-dragging-node')
    } else if (g.mode === 'pinch') {
      const [rest] = [...pointers.current.values()]
      g.mode = 'pan'
      g.last = { ...rest, t: performance.now() }
    }
  }

  // wheel / trackpad zoom (non-passive so the page doesn't scroll)
  useEffect(() => {
    const el = viewport.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const r = el.getBoundingClientRect()
      const factor = Math.exp(-e.deltaY * (e.ctrlKey ? 0.012 : 0.0016))
      const c = cam.current
      const k = clampK(c.k * factor)
      const ratio = k / c.k
      const px = e.clientX - r.left
      const py = e.clientY - r.top
      c.target = null
      c.x = px - (px - c.x) * ratio
      c.y = py - (py - c.y) * ratio
      c.k = k
      applyCamera()
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [applyCamera])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.target !== viewport.current) return
    const step = 70
    const c = cam.current
    const base = c.target ?? { x: c.x, y: c.y, k: c.k }
    const pan = (dx: number, dy: number) => {
      e.preventDefault()
      c.target = { ...base, x: base.x + dx, y: base.y + dy }
      kick()
    }
    if (e.key === 'ArrowLeft') pan(step, 0)
    if (e.key === 'ArrowRight') pan(-step, 0)
    if (e.key === 'ArrowUp') pan(0, step)
    if (e.key === 'ArrowDown') pan(0, -step)
  }

  return (
    <div
      ref={viewport}
      className="hole__viewport"
      tabIndex={0}
      role="region"
      aria-label="Map of hobbies. Drag to pan, scroll or pinch to zoom, arrow keys to move. Each sticker is a button."
      data-cursor="pan · drag stickers"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      onClickCapture={(e) => {
        if (suppressClick.current) {
          suppressClick.current = false
          e.stopPropagation()
          e.preventDefault()
        }
      }}
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest('[data-node]')) onFocus(null)
      }}
    >
      <div ref={world} className="hole__world" data-focus={focus ?? undefined}>
        <svg className="hole__edges" aria-hidden="true">
          {sim.links.map((_, i) => (
            <line
              key={i}
              ref={(el) => {
                lineEls.current[i] = el
              }}
              className={cn('hole__edge', focusEdges.has(i) && 'is-lit')}
            />
          ))}
        </svg>
        {[...focusEdges].map((i) => {
          const a = sim.nodes[sim.links[i].a].id
          const b = sim.nodes[sim.links[i].b].id
          const because = connections.find((c) => (c.a === a && c.b === b) || (c.a === b && c.b === a))?.because
          return (
            <span
              key={`l${i}`}
              ref={(el) => {
                if (el) labelEls.current.set(i, el)
                else labelEls.current.delete(i)
                if (el) requestAnimationFrame(draw)
              }}
              className="hole__because"
              aria-hidden="true"
            >
              <span>{because}</span>
            </span>
          )
        })}
        {sim.nodes.map((p) => {
          const h = getHobby(p.id)!
          const status = statusOf(p.id)
          return (
            <button
              key={p.id}
              type="button"
              data-node={p.id}
              ref={(el) => {
                if (el) nodeEls.current.set(p.id, el)
                else nodeEls.current.delete(p.id)
              }}
              className={cn('node', `node--${status}`, focus === p.id && 'is-focus', near.has(p.id) && focus !== p.id && 'is-near')}
              style={{ '--c': swatchOf(h).bg } as CSSProperties}
              onClick={() => onFocus(p.id)}
              aria-pressed={focus === p.id}
              aria-label={`${h.name}${status === 'into' ? ', you’re into it' : status === 'later' ? ', saved for later' : status === 'new' ? ', not discovered yet' : ''}`}
            >
              <span className="node__inner">
                <span className="node__disc">
                  <HobbyArt id={h.id} swatch={h.swatch} mood={focus === p.id ? 'happy' : 'idle'} className="node__art" />
                </span>
                <span className="node__label">{h.name}</span>
                {status === 'new' && (
                  <span className="node__new pixel" aria-hidden="true">
                    ?
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
})
