import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { Pip } from '@/art/Pip'
import { Sticker, STICKERS, type StickerId } from '@/art/Stickers'
import { Keycap } from '@/components/ui/Keycap'
import { SPACES } from '@/components/layout/spaces'
import { C } from '@/data/palette'
import { useCollector } from '@/store/collector'
import { useUI } from '@/store/ui'

const BOARD: { id: StickerId; x: number; y: number; r: number; s: number }[] = [
  { id: 'weird', x: 6, y: 10, r: -10, s: 150 },
  { id: 'smiley', x: 30, y: 52, r: 8, s: 120 },
  { id: 'bolt', x: 70, y: 8, r: 14, s: 110 },
  { id: 'new', x: 78, y: 50, r: -6, s: 150 },
  { id: 'eye', x: 48, y: 14, r: -4, s: 120 },
  { id: 'heart', x: 12, y: 58, r: 12, s: 100 },
  { id: 'planet', x: 56, y: 56, r: -12, s: 120 },
  { id: 'curious', x: 34, y: 4, r: 6, s: 150 },
]

/** Peel-and-stick finale: throw the stickers around, then step inside. */
export function StickerBoard() {
  const board = useRef<HTMLDivElement>(null)
  const [order, setOrder] = useState(BOARD.map((b) => b.id))
  const pass = useCollector((s) => s.pass)
  const openPass = useUI((s) => s.openPass)
  const navigate = useNavigate()

  const raise = (id: StickerId) => setOrder((o) => [...o.filter((x) => x !== id), id])

  return (
    <section className="finale tone-light" aria-labelledby="finale-title">
      <div className="finale__inner wrap">
        <div className="finale__copy">
          <h2 id="finale-title" className="section-title finale__title">
            Make it weird.
            <br />
            Make it yours.
          </h2>
          <p className="lede">
            Your collection is a scrapbook, not a profile. Every hobby you swipe, room you join and quest you finish ends up in it — with stickers.
          </p>
          <Keycap
            className="finale__key"
            cap={C.acid}
            on={C.acid}
            led={C.bubblegum}
            legend="↵"
            depth={10}
            radius={20}
            onClick={() => (pass ? navigate('/swipe') : openPass())}
          >
            <span className="finale__key-label display">
              Enter the grounds <ArrowRight size={26} strokeWidth={3} aria-hidden="true" />
            </span>
          </Keycap>
        </div>

        <div ref={board} className="finale__board" aria-label="A board of decorative stickers you can drag around" role="group">
          {BOARD.map((b) => (
            <motion.div
              key={b.id}
              className="finale__sticker"
              style={{ left: `${b.x}%`, top: `${b.y}%`, zIndex: order.indexOf(b.id) + 1 }}
              initial={{ rotate: b.r }}
              drag
              dragConstraints={board}
              dragElastic={0.25}
              dragTransition={{ power: 0.4, timeConstant: 280, bounceStiffness: 260, bounceDamping: 14 }}
              whileDrag={{ scale: 1.12, rotate: b.r + (b.r > 0 ? -14 : 14) }}
              whileHover={{ scale: 1.04, rotate: b.r * 1.4 }}
              onDragStart={() => raise(b.id)}
              data-cursor="drag"
              tabIndex={-1}
              aria-label={STICKERS[b.id].label}
            >
              <Sticker id={b.id} size={b.s} />
            </motion.div>
          ))}
          <div className="finale__pip">
            <Pip mood="wink" size={120} pokeable />
          </div>
        </div>
      </div>

      <footer className="foot wrap">
        <nav aria-label="Footer" className="foot__nav">
          {SPACES.map((s) => (
            <Link key={s.id} to={s.path} className="foot__link">
              <span className="pixel">{s.no}</span> {s.name}
            </Link>
          ))}
        </nav>
        <p className="foot__note mono">
          A prototype. People, rooms and threads are demo content; everything you do is saved only in this browser. Built with curiosity — and a suspicious
          amount of halftone.
        </p>
      </footer>
    </section>
  )
}
