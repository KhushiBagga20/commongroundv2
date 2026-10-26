import { useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, type PanInfo } from 'motion/react'
import { Info } from 'lucide-react'
import { Pip, type PipMood } from '@/art/Pip'
import { MiniPoster } from '@/components/hobby/HobbyPoster'
import { VerdictKeys } from '@/components/hobby/VerdictKeys'
import { listHobbies } from '@/data/repository'
import type { Hobby } from '@/data/types'
import { gsap } from '@/hooks/useGsap'
import { useDossier } from '@/hooks/useDossier'
import { useOffscreen } from '@/hooks/useOffscreen'
import { pick, shuffle } from '@/lib/random'
import { isCalm } from '@/motion/calm'
import { spring } from '@/motion/springs'

const ITEM = 64
const FILLER = 14

/**
 * Three reels — a verb, a thing, a when — that land on one hobby's pitch.
 * Pull the lever (drag it down) or press the button.
 */
export function CuriositySlot() {
  const root = useRef<HTMLElement>(null)
  const reels = useRef<(HTMLUListElement | null)[]>([])
  const [strips, setStrips] = useState<string[][]>(() => {
    const first = listHobbies()[0]
    return first.pitch.map((p) => [p])
  })
  const [result, setResult] = useState<Hobby | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [mood, setMood] = useState<PipMood>('idle')
  const { open } = useDossier()
  useOffscreen(root)

  const lever = useMotionValue(0)
  const knobScale = useTransform(lever, [0, 110], [1, 1.12])
  const armScale = useTransform(lever, [0, 110], [1, 0.3])

  const spin = () => {
    if (spinning) return
    const all = listHobbies()
    const target = pick(all.filter((h) => h.id !== result?.id))
    setResult(null)
    setSpinning(true)
    setMood('wow')
    const next = target.pitch.map((part, i) => {
      const fillers = shuffle(
        all.map((h) => h.pitch[i]),
        Math.random() * 1e9,
      ).slice(0, FILLER)
      const current = strips[i][strips[i].length - 1]
      return [current, ...fillers.filter((f) => f !== part), part]
    })
    setStrips(next)

    const land = () => {
      setSpinning(false)
      setResult(target)
      setMood('excited')
      window.setTimeout(() => setMood('happy'), 1200)
    }

    requestAnimationFrame(() => {
      if (isCalm()) {
        reels.current.forEach((r, i) => r && gsap.set(r, { y: -(next[i].length - 1) * ITEM }))
        land()
        return
      }
      const tl = gsap.timeline({ onComplete: land })
      reels.current.forEach((r, i) => {
        if (!r) return
        gsap.set(r, { y: 0 })
        tl.to(r, { y: -(next[i].length - 1) * ITEM, duration: 1.1 + i * 0.35, ease: 'back.out(1.1)' }, 0)
      })
    })
  }

  const onLeverEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 70) spin()
  }

  return (
    <section ref={root} className="slot tone-dark dots" aria-labelledby="slot-title">
      <div className="slot__inner wrap">
        <div className="slot__copy">
          <p className="label slot__kicker">The curiosity slot</p>
          <h2 id="slot-title" className="section-title slot__title">
            Can’t
            <br />
            decide?
            <br />
            <span className="slot__pull">Pull it.</span>
          </h2>
          <p className="lede">Three reels, one hobby, zero commitment. Every combination is a real thing people do on weekends.</p>
        </div>

        <div className="slot__machine">
          <div className="slot__marquee">
            <span className="slot__bulbs" aria-hidden="true">
              {Array.from({ length: 14 }, (_, i) => (
                <i key={i} style={{ animationDelay: `${(i % 7) * 0.12}s` }} />
              ))}
            </span>
            <span className="display slot__brand">Curiosity-o-matic</span>
          </div>

          <div className="slot__body">
            <div className="slot__window" aria-hidden="true">
              {strips.map((strip, i) => (
                <div key={i} className="slot__reel">
                  <ul
                    ref={(el) => {
                      reels.current[i] = el
                    }}
                    className="slot__strip"
                  >
                    {strip.map((word, j) => (
                      <li key={`${j}-${word}`} className="display">
                        {word}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="slot__lever" aria-hidden="true">
              <div className="slot__lever-track" />
              <motion.div className="slot__lever-arm" style={{ scaleY: armScale }} />
              <motion.div
                className="slot__lever-knob"
                data-cursor="pull"
                drag={spinning ? false : 'y'}
                dragConstraints={{ top: 0, bottom: 110 }}
                dragElastic={0.05}
                dragSnapToOrigin
                dragTransition={{ bounceStiffness: 600, bounceDamping: 14 }}
                style={{ y: lever, scale: knobScale }}
                onDragEnd={onLeverEnd}
              />
            </div>
          </div>

          <div className="slot__controls">
            <button type="button" className="slot__button" onClick={spin} disabled={spinning} aria-describedby="slot-result">
              <span className="slot__button-cap">{spinning ? '…' : 'Pull'}</span>
            </button>
            <div className="slot__pip">
              <Pip mood={mood} size={84} />
            </div>
          </div>

          <div id="slot-result" className="slot__result" aria-live="polite">
            {result ? (
              <motion.div
                className="slot__ticket"
                initial={{ y: -30, opacity: 0, rotate: -3 }}
                animate={{ y: 0, opacity: 1, rotate: -1.5 }}
                transition={spring.bouncy}
              >
                <MiniPoster hobby={result} className="slot__mini" />
                <div className="slot__ticket-body">
                  <p className="sr-only">The reels say: {result.pitch.join(' ')}.</p>
                  <p className="pixel slot__ticket-kicker">You should try</p>
                  <p className="display slot__ticket-name">{result.name}</p>
                  <p className="slot__ticket-line">{result.tagline}</p>
                  <VerdictKeys hobbyId={result.id} size="sm" />
                  <button type="button" className="text-btn slot__ticket-more" onClick={() => open(result.id)}>
                    <Info size={15} strokeWidth={2.6} aria-hidden="true" /> Open the dossier
                  </button>
                </div>
              </motion.div>
            ) : (
              <p className="slot__waiting mono">{spinning ? 'Spinning…' : 'Press pull, or drag the lever down.'}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
