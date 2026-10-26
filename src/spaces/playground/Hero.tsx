import { useEffect, useMemo, useRef } from 'react'
import { ArrowRight, Layers } from 'lucide-react'
import { HalftoneDisc } from '@/art/HalftoneDisc'
import { Pip } from '@/art/Pip'
import { Spark } from '@/art/primitives'
import { InkButton, InkLink } from '@/components/ui/InkButton'
import { Marquee } from '@/components/ui/bits'
import { C } from '@/data/palette'
import { listHobbies } from '@/data/repository'
import { hasFinePointer, onPointerMove, pointer } from '@/hooks/pointer'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { useOffscreen } from '@/hooks/useOffscreen'
import { isCalm } from '@/motion/calm'
import { useCollector } from '@/store/collector'
import { useUI } from '@/store/ui'
import { FloatingObjects, type FloatSpec } from './FloatingObjects'
import { KineticHeadline } from './KineticHeadline'

const DESKTOP: FloatSpec[] = [
  { id: 'photography', x: 62, y: 13, size: 183, rot: -8, depth: 1 },
  { id: 'djing', x: 87, y: 9, size: 127, rot: 6, depth: 0.6 },
  { id: 'pottery', x: 81, y: 29, size: 168, rot: 10, depth: 0.7 },
  { id: 'knitting', x: 61, y: 43, size: 132, rot: -14, depth: 1.2 },
  { id: 'sourdough', x: 75, y: 52, size: 183, rot: -6, depth: 1.1 },
  { id: 'tabletop-rpg', x: 90, y: 62, size: 127, rot: 14, depth: 0.8 },
  { id: 'skateboarding', x: 57, y: 69, size: 195, rot: -12, depth: 0.9 },
  { id: 'astronomy', x: 41, y: 5, size: 144, rot: 8, depth: 1 },
  { id: 'robotics', x: 79, y: 75, size: 132, rot: 10, depth: 1.1 },
]

// On phones the objects live in a "toy box" under the buttons, never on top of them.
const MOBILE: FloatSpec[] = [
  { id: 'pottery', x: 4, y: 77, size: 86, rot: 10, depth: 1, mobile: true },
  { id: 'photography', x: 28, y: 83, size: 92, rot: -8, depth: 1, mobile: true },
  { id: 'knitting', x: 54, y: 76, size: 78, rot: -12, depth: 1, mobile: true },
  { id: 'tabletop-rpg', x: 76, y: 82, size: 74, rot: 14, depth: 1, mobile: true },
]

/** Geometric decor that drifts with the cursor at different depths. */
function useParallax(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current
    if (!el || !hasFinePointer()) return
    const layers = [...el.querySelectorAll<HTMLElement>('[data-depth]')]
    let raf = 0
    let x = 0
    let y = 0
    const tick = () => {
      raf = 0
      const tx = pointer.active && !isCalm() ? pointer.x / window.innerWidth - 0.5 : 0
      const ty = pointer.active && !isCalm() ? pointer.y / window.innerHeight - 0.5 : 0
      x += (tx - x) * 0.08
      y += (ty - y) * 0.08
      layers.forEach((l) => {
        const d = Number(l.dataset.depth)
        l.style.transform = `translate3d(${(x * d).toFixed(2)}px, ${(y * d).toFixed(2)}px, 0)`
      })
      if (Math.abs(tx - x) + Math.abs(ty - y) > 0.001) raf = requestAnimationFrame(tick)
    }
    const off = onPointerMove(() => {
      if (!raf) raf = requestAnimationFrame(tick)
    })
    return () => {
      off()
      cancelAnimationFrame(raf)
    }
  }, [root])
}

export function Hero() {
  const root = useRef<HTMLElement>(null)
  const mobile = useIsMobile()
  const pass = useCollector((s) => s.pass)
  const openPass = useUI((s) => s.openPass)
  useOffscreen(root)
  useParallax(root)
  const specs = mobile ? MOBILE : DESKTOP
  const ribbon = useMemo(() => listHobbies().map((h) => h.name), [])

  return (
    <section ref={root} className="hero butter-ground tone-light" aria-labelledby="hero-title">
      {/* decor */}
      <div className="hero__decor" aria-hidden="true">
        <div className="hero__sun" data-depth="-30">
          <div className="amb-spin" style={{ ['--dur' as string]: '120s' }}>
            <HalftoneDisc color={C.tangerine} gap={10} light={[0.2, 0.2]} />
          </div>
        </div>
        <div className="hero__quarter" data-depth="40" />
        <div className="hero__tri" data-depth="-50" />
        <svg className="hero__squiggle" data-depth="60" viewBox="0 0 220 60">
          <path d="M6 30 q18 -26 36 0 t36 0 t36 0 t36 0 t36 0" fill="none" stroke={C.ink} strokeWidth="6" strokeLinecap="round" />
        </svg>
        <svg className="hero__spark" data-depth="-70" viewBox="0 0 40 40">
          <Spark x={20} y={20} r={18} fill={C.acid} />
        </svg>
        <div className="hero__ring" data-depth="25" />
      </div>

      <div className="hero__inner wrap">
        <p className="hero__eyebrow label">
          <span className="pixel hero__vol">Vol.02</span> A digital playground for the chronically curious
        </p>
        <KineticHeadline
          label="Find your kind of weird."
          className="hero__title display"
          lines={[
            { text: 'Find your' },
            {
              text: 'kind of',
              after: (
                <span className="hero__pip">
                  <Pip mood="happy" size={mobile ? 74 : 128} pokeable />
                </span>
              ),
            },
            { text: 'weird.', className: 'hero__weird' },
          ]}
        />
        <p className="hero__lede lede">
          Swipe through hobbies like trading cards, follow the strings between them, and walk into rooms full of people who are into the same strange things.{' '}
          <strong>Find your people. Find your weird.</strong>
        </p>
        <div className="hero__ctas">
          {pass ? (
            <InkLink to="/swipe" size="lg" face={C.tangerine} magnetic>
              Keep swiping, {pass.name.split(' ')[0]} <ArrowRight size={20} strokeWidth={2.8} aria-hidden="true" />
            </InkLink>
          ) : (
            <InkButton size="lg" face={C.tangerine} magnetic onClick={() => openPass()}>
              Get your pass <ArrowRight size={20} strokeWidth={2.8} aria-hidden="true" />
            </InkButton>
          )}
          <InkLink to="/swipe" face={C.paper} magnetic>
            <Layers size={18} strokeWidth={2.6} aria-hidden="true" /> Just start swiping
          </InkLink>
        </div>
        <p className="hero__hint mono" aria-hidden="true">
          <svg viewBox="0 0 60 40" width="46" height="30">
            <path d="M4 34 C 14 8, 34 4, 54 10" fill="none" stroke={C.ink} strokeWidth="3" strokeLinecap="round" />
            <path d="M44 3 L55 10 L45 19" fill="none" stroke={C.ink} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          psst — the objects are draggable. Pip is pokeable.
        </p>
      </div>

      <div className="hero__objects">
        <FloatingObjects specs={specs} bounds={root} />
      </div>

      <Marquee className="hero__ribbon" duration={60}>
        {ribbon.map((n) => (
          <span key={n} className="hero__ribbon-item">
            {n} <span aria-hidden="true">✶</span>
          </span>
        ))}
      </Marquee>
    </section>
  )
}
