import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { motion } from 'motion/react'
import { Bookmark, BookOpen, RotateCcw, X } from 'lucide-react'
import { HobbyPoster } from '@/components/hobby/HobbyPoster'
import { EmptyState } from '@/components/ui/bits'
import { C } from '@/data/palette'
import { getHobby } from '@/data/repository'
import { useDossier } from '@/hooks/useDossier'
import { longDate } from '@/lib/format'
import { seeded } from '@/lib/random'
import { spring } from '@/motion/springs'
import { useCollector } from '@/store/collector'

const TAPES = [C.butter, C.bubblegum, C.acid, C.lavender]

function IntoCard({ id }: { id: string }) {
  const h = getHobby(id)!
  const [flipped, setFlipped] = useState(false)
  const saved = useCollector((s) => s.notes[id] ?? '')
  const at = useCollector((s) => s.verdicts[id]?.at)
  const setNote = useCollector((s) => s.setNote)
  const setVerdict = useCollector((s) => s.setVerdict)
  const clearVerdict = useCollector((s) => s.clearVerdict)
  const { open } = useDossier()
  const [draft, setDraft] = useState(saved)
  const timer = useRef(0)
  const r = seeded(id)
  const tilt = r() * 7 - 3.5
  const tape = TAPES[Math.floor(r() * TAPES.length)]

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const write = (text: string) => {
    setDraft(text)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setNote(id, text), 500)
  }

  return (
    <li className="flip" style={{ '--tilt': `${tilt}deg` } as CSSProperties}>
      <span className="tape" style={{ '--tape': tape, left: '50%', top: -12, marginLeft: -43 } as CSSProperties} />
      <motion.div className="flip__inner" style={{ transformPerspective: 1100 }} animate={{ rotateY: flipped ? 180 : 0 }} transition={spring.snappy}>
        <div className="flip__face" inert={flipped}>
          <button type="button" className="flip__front" onClick={() => setFlipped(true)} aria-label={`${h.name}. Flip to write notes.`} data-cursor="flip">
            <HobbyPoster hobby={h} compact mood="happy" />
          </button>
          {saved && <span className="flip__has-note pixel">note ✎</span>}
        </div>
        <div className="flip__face flip__face--back" inert={!flipped}>
          <p className="pixel flip__date">Spotted {at ? longDate(at) : 'recently'}</p>
          <h3 className="display flip__name">{h.name}</h3>
          <label className="label" htmlFor={`note-${id}`}>
            Your notes
          </label>
          <textarea
            id={`note-${id}`}
            className="field flip__note"
            placeholder="Why does this spark something? What’s your first step?"
            value={draft}
            maxLength={600}
            onChange={(e) => write(e.target.value)}
            onBlur={() => setNote(id, draft)}
          />
          <div className="flip__actions">
            <button type="button" className="flip__act" onClick={() => open(id)} aria-label={`Open ${h.name} dossier`}>
              <BookOpen size={15} strokeWidth={2.6} />
            </button>
            <button type="button" className="flip__act" onClick={() => setVerdict(id, 'later')} aria-label={`Move ${h.name} to saved for later`}>
              <Bookmark size={15} strokeWidth={2.6} />
            </button>
            <button type="button" className="flip__act" onClick={() => clearVerdict(id)} aria-label={`Remove ${h.name} from your collection`}>
              <X size={15} strokeWidth={2.8} />
            </button>
            <button type="button" className="flip__act flip__act--back" onClick={() => setFlipped(false)}>
              <RotateCcw size={15} strokeWidth={2.6} aria-hidden="true" /> Flip back
            </button>
          </div>
        </div>
      </motion.div>
    </li>
  )
}

export function IntoShelf({ ids }: { ids: string[] }) {
  if (!ids.length) {
    return (
      <EmptyState
        mood="confused"
        title="Nothing here yet"
        actions={
          <Link to="/swipe" className="ink-btn">
            Open the Swipe Machine
          </Link>
        }
      >
        Swipe right on a hobby and it gets taped into this page.
      </EmptyState>
    )
  }
  return (
    <ul className="shelf">
      {ids.map((id) => (
        <IntoCard key={id} id={id} />
      ))}
    </ul>
  )
}
