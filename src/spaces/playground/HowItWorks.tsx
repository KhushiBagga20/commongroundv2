import { useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { HobbyArt } from '@/art/HobbyArt'
import { Sticker } from '@/art/Stickers'
import { HobbyPoster } from '@/components/hobby/HobbyPoster'
import { C } from '@/data/palette'
import { getHobby, getRoom } from '@/data/repository'
import { gsap, ScrollTrigger, useGsap } from '@/hooks/useGsap'
import { isCalm } from '@/motion/calm'
import { spring } from '@/motion/springs'

const STEPS = [
  {
    no: '01',
    title: 'Swipe',
    color: C.tangerine,
    body: 'Hobbies arrive as cards. Right if it sparks something, left if it doesn’t, up to save it for later. No quizzes, no essays, no “tell us about yourself”.',
    to: '/swipe',
    cta: 'Open the Swipe Machine',
  },
  {
    no: '02',
    title: 'Dig',
    color: C.lavender,
    body: 'Every hobby is tied to five more. Photography leads to astronomy, coding leads to music, sourdough leads (obviously) to pickles. Follow the strings.',
    to: '/rabbit-hole',
    cta: 'Fall down the Rabbit Hole',
  },
  {
    no: '03',
    title: 'Walk in',
    color: C.acid,
    body: 'Each hobby has a room full of people a few weeks ahead of you. Walk in, lurk, take on a weekly quest, and say hi when you’re ready.',
    to: '/clubhouse',
    cta: 'Visit the Clubhouse',
  },
]

const NODES: { id: string; x: number; y: number; s: number }[] = [
  { id: 'photography', x: 50, y: 48, s: 108 },
  { id: 'astronomy', x: 18, y: 18, s: 84 },
  { id: 'filmmaking', x: 82, y: 16, s: 84 },
  { id: 'travel', x: 86, y: 74, s: 80 },
  { id: 'writing', x: 18, y: 80, s: 84 },
  { id: 'coding', x: 52, y: 6, s: 64 },
  { id: 'tabletop-rpg', x: 50, y: 92, s: 66 },
]
const STRINGS: [string, string][] = [
  ['photography', 'astronomy'],
  ['photography', 'filmmaking'],
  ['photography', 'travel'],
  ['photography', 'writing'],
  ['astronomy', 'coding'],
  ['writing', 'tabletop-rpg'],
  ['filmmaking', 'coding'],
]

const DOORS = ['midnight-photographers', 'sourdough-underground', 'noise-floor']

export function HowItWorks() {
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)

  useGsap(root, () => {
    const panels = gsap.utils.toArray<HTMLElement>('.how__panel')
    panels.forEach((p, i) => {
      ScrollTrigger.create({ trigger: p, start: 'top 60%', end: 'bottom 60%', onToggle: (self) => self.isActive && setActive(i) })
    })
    if (isCalm()) {
      gsap.set('.how__card', { rotate: (i: number) => [-12, 0, 12][i], x: (i: number) => [-70, 0, 70][i] })
      gsap.set('.how__string', { strokeDashoffset: 0 })
      gsap.set('.how__door-panel', { rotateY: (i: number) => -48 - i * 10 })
      return
    }
    gsap.fromTo(
      '.how__card',
      { rotate: (i: number) => [-3, 0, 3][i], x: 0 },
      {
        rotate: (i: number) => [-12, 0, 12][i],
        x: (i: number) => [-70, 0, 70][i],
        ease: 'none',
        scrollTrigger: { trigger: panels[0], start: 'top 85%', end: 'center 50%', scrub: 0.6 },
      },
    )
    gsap.fromTo(
      '.how__string',
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, stagger: 0.12, ease: 'none', scrollTrigger: { trigger: panels[1], start: 'top 80%', end: 'center 45%', scrub: 0.6 } },
    )
    gsap.fromTo(
      '.how__node',
      { scale: 0.4, opacity: 0 },
      { scale: 1, opacity: 1, stagger: 0.08, ease: 'back.out(2)', scrollTrigger: { trigger: panels[1], start: 'top 80%', end: 'center 50%', scrub: 0.6 } },
    )
    gsap.fromTo(
      '.how__door-panel',
      { rotateY: 0 },
      {
        rotateY: (i: number) => -48 - i * 10,
        stagger: 0.1,
        ease: 'none',
        scrollTrigger: { trigger: panels[2], start: 'top 80%', end: 'center 45%', scrub: 0.6 },
      },
    )
  })

  const step = STEPS[active]
  const pos = Object.fromEntries(NODES.map((n) => [n.id, n]))

  return (
    <section ref={root} className="how paper-ground tone-light" aria-labelledby="how-title">
      <h2 id="how-title" className="sr-only">
        How CommonGround works
      </h2>
      <div className="how__grid wrap">
        <div className="how__sticky" aria-hidden="true">
          <p className="label how__kicker">How it works</p>
          <div className="how__numeral-wrap">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={step.no}
                className="display how__numeral"
                style={{ '--c': step.color } as CSSProperties}
                initial={{ y: '60%', rotate: 8, opacity: 0 }}
                animate={{ y: 0, rotate: 0, opacity: 1 }}
                exit={{ y: '-60%', rotate: -8, opacity: 0 }}
                transition={spring.snappy}
              >
                {step.no}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="how__dots">
            {STEPS.map((s, i) => (
              <span key={s.no} className={i === active ? 'is-on' : ''} />
            ))}
          </div>
        </div>

        <div className="how__panels">
          {STEPS.map((s, i) => (
            <article key={s.no} className="how__panel">
              <div className="how__visual">
                {i === 0 && (
                  <div className="how__cards">
                    {['pottery', 'coding', 'bouldering'].map((id) => (
                      <div key={id} className="how__card">
                        <HobbyPoster hobby={getHobby(id)!} compact />
                      </div>
                    ))}
                    <Sticker id="yes" size={96} className="how__sticker how__sticker--yes" />
                  </div>
                )}
                {i === 1 && (
                  <div className="how__map">
                    <svg className="how__strings" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                      {STRINGS.map(([a, b]) => (
                        <line key={a + b} className="how__string" pathLength={1} x1={pos[a].x} y1={pos[a].y} x2={pos[b].x} y2={pos[b].y} />
                      ))}
                    </svg>
                    {NODES.map((n) => {
                      const h = getHobby(n.id)!
                      return (
                        <span key={n.id} className="how__node" style={{ left: `${n.x}%`, top: `${n.y}%`, width: n.s }}>
                          <HobbyArt id={h.id} swatch={h.swatch} />
                          <span className="label">{h.name}</span>
                        </span>
                      )
                    })}
                  </div>
                )}
                {i === 2 && (
                  <div className="how__doors">
                    {DOORS.map((id) => {
                      const r = getRoom(id)!
                      return (
                        <div
                          key={id}
                          className="how__door"
                          style={{ '--door': r.identity.bg, '--doorfg': r.identity.fg, '--glow': r.identity.accent } as CSSProperties}
                        >
                          <div className="how__door-light" />
                          <div className="how__door-panel">
                            <span className="how__door-sign display">{r.name.replace('The ', '')}</span>
                            <span className="how__door-knob" />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              <div className="how__text">
                <p className="pixel how__step-no">Step {s.no}</p>
                <h3 className="display how__step-title">{s.title}</h3>
                <p className="lede">{s.body}</p>
                <Link to={s.to} className="ink-btn" style={{ '--face': s.color } as CSSProperties}>
                  {s.cta} <ArrowRight size={18} strokeWidth={2.8} aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
