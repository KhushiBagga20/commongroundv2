import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import { motion } from 'motion/react'
import { ArrowLeft, ArrowRight, BookOpen, DoorOpen, X } from 'lucide-react'
import { HobbyArt } from '@/art/HobbyArt'
import { Sticker } from '@/art/Stickers'
import { posterVars } from '@/components/hobby/HobbyPoster'
import { VerdictKeys } from '@/components/hobby/VerdictKeys'
import { categoryOf, getHobby, neighbours, roomsForHobby, swatchOf } from '@/data/repository'
import { useDossier } from '@/hooks/useDossier'
import { pad } from '@/lib/format'
import { spring } from '@/motion/springs'

interface Props {
  id: string
  fresh: boolean
  trail: string[]
  onFollow: (id: string) => void
  onBack: () => void
  onClose: () => void
}

/** What you know about the selected hobby, and where its strings go. */
export function FieldNotes({ id, fresh, trail, onFollow, onBack, onClose }: Props) {
  const h = getHobby(id)!
  const sw = swatchOf(h)
  const links = neighbours(id)
  const rooms = roomsForHobby(id)
  const { open } = useDossier()

  return (
    <motion.aside
      key={id}
      className="notes"
      aria-label={`Field notes: ${h.name}`}
      initial={{ y: 30, rotate: 1.5, opacity: 0 }}
      animate={{ y: 0, rotate: 0, opacity: 1 }}
      transition={spring.snappy}
    >
      <header className={sw.tone === 'dark' ? 'notes__head tone-dark' : 'notes__head'} style={posterVars(h)}>
        <button type="button" className="ink-btn ink-btn--sm ink-btn--icon notes__close" onClick={onClose} aria-label="Close field notes">
          <X size={16} strokeWidth={2.8} />
        </button>
        <HobbyArt id={h.id} swatch={h.swatch} mood="happy" className="notes__art" />
        <div>
          <p className="pixel notes__no">
            No.{pad(h.no)} · {categoryOf(h).label}
          </p>
          <h2 className="display notes__name">{h.name}</h2>
        </div>
        {fresh && (
          <motion.span
            className="notes__fresh"
            initial={{ scale: 2, rotate: -40, opacity: 0 }}
            animate={{ scale: 1, rotate: -12, opacity: 1 }}
            transition={spring.bouncy}
          >
            <Sticker id="new" size={84} />
          </motion.span>
        )}
      </header>

      <div className="notes__body">
        <p className="notes__tagline">{h.tagline}</p>
        <VerdictKeys hobbyId={h.id} size="sm" />

        <section>
          <h3 className="label notes__h">
            {links.length} strings from here <span className="notes__hint">— follow one</span>
          </h3>
          <ul className="notes__links">
            {links.map((l) => (
              <li key={l.hobby.id}>
                <button type="button" className="notes__link" onClick={() => onFollow(l.hobby.id)} style={{ '--c': swatchOf(l.hobby).bg } as CSSProperties}>
                  <span className="notes__link-art">
                    <HobbyArt id={l.hobby.id} swatch={l.hobby.swatch} />
                  </span>
                  <span className="notes__link-text">
                    <strong>{l.hobby.name}</strong>
                    <em>{l.because}</em>
                  </span>
                  <ArrowRight size={16} strokeWidth={2.6} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <div className="notes__actions">
          <button type="button" className="ink-btn ink-btn--sm" onClick={() => open(h.id)}>
            <BookOpen size={16} strokeWidth={2.6} aria-hidden="true" /> Full dossier
          </button>
          {rooms[0] && (
            <Link
              to={`/clubhouse/${rooms[0].id}`}
              className="ink-btn ink-btn--sm"
              style={{ '--face': rooms[0].identity.bg, '--fg': rooms[0].identity.fg } as CSSProperties}
            >
              <DoorOpen size={16} strokeWidth={2.6} aria-hidden="true" /> {rooms[0].name.replace(/^The /, '')}
            </Link>
          )}
        </div>

        {trail.length > 1 && (
          <section className="notes__trail">
            <h3 className="label notes__h">Your trail</h3>
            <ol>
              {trail.slice(-6).map((t, i, arr) => (
                <li key={`${t}-${i}`} aria-current={i === arr.length - 1 ? 'step' : undefined}>
                  {getHobby(t)?.name}
                </li>
              ))}
            </ol>
            <button type="button" className="text-btn notes__back" onClick={onBack}>
              <ArrowLeft size={15} strokeWidth={2.6} aria-hidden="true" /> Back to {getHobby(trail[trail.length - 2])?.name}
            </button>
          </section>
        )}
      </div>
    </motion.aside>
  )
}
