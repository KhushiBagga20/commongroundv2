import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import { HobbyArt } from '@/art/HobbyArt'
import { Stamp } from '@/art/Stamp'
import { MiniPoster } from '@/components/hobby/HobbyPoster'
import { C } from '@/data/palette'
import { EmptyState } from '@/components/ui/bits'
import { getHappening, getHobby, getQuest, getRoom, hobbyCount, listHobbies, swatchOf } from '@/data/repository'
import { useDossier } from '@/hooks/useDossier'
import { longDate, pad, ticketDate } from '@/lib/format'
import { seeded } from '@/lib/random'
import { useCollector } from '@/store/collector'

/** Saved-for-later hobbies hanging on a line; they swing when you pass. */
export function Clothesline({ ids }: { ids: string[] }) {
  const { open } = useDossier()
  if (!ids.length) {
    return (
      <EmptyState mood="sleepy" title="The line is empty">
        Swipe <strong>up</strong> on a card to hang it here for later. No commitment, just a maybe.
      </EmptyState>
    )
  }
  return (
    <div className="line scroll-x">
      <ul className="line__items">
        {ids.map((id, i) => {
          const h = getHobby(id)!
          return (
            <li key={id} className="line__item" style={{ '--swing-delay': `${-i * 0.6}s`, '--swing': `${seeded(id)() * 3 + 1.5}deg` } as CSSProperties}>
              <span className="line__peg" aria-hidden="true" />
              <button type="button" className="line__card" onClick={() => open(id)} aria-label={`${h.name}, saved for later. Open dossier.`}>
                <MiniPoster hobby={h} />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** One passport stamp per room you've joined. */
export function StampAlbum({ joined }: { joined: Record<string, number> }) {
  const ids = Object.entries(joined)
    .sort((a, b) => a[1] - b[1])
    .map(([id]) => id)
  if (!ids.length) {
    return (
      <div className="album album--empty">
        {[0, 1, 2].map((i) => (
          <Stamp key={i} text="Your room here" center={null} color="var(--ink)" size={130} rotate={i * 14 - 14} faded />
        ))}
        <p className="album__hint">
          Join a room in the <Link to="/clubhouse">Clubhouse</Link> and its stamp lands here.
        </p>
      </div>
    )
  }
  return (
    <ul className="album">
      {ids.map((id) => {
        const r = getRoom(id)
        if (!r) return null
        const emblem = getHobby(r.identity.emblem)!
        // paper-coloured rooms stamp in ink so they show up on the page
        const color = r.identity.bg === C.paper ? C.ink : r.identity.bg
        return (
          <li key={id} className="album__item">
            <Link to={`/clubhouse/${id}`} className="album__link" aria-label={`${r.name}, joined ${longDate(joined[id])}. Visit room.`}>
              <Stamp
                text={r.name.replace(/^The /, '')}
                color={color}
                size={150}
                rotate={seeded(id)() * 24 - 12}
                center={<HobbyArt id={emblem.id} swatch={emblem.swatch} />}
              />
              <span className="mono album__date">Joined {longDate(joined[id])}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

/** Quests done and happenings RSVP'd, printed like a receipt. */
export function Receipt() {
  const quests = useCollector((s) => s.quests)
  const rsvps = useCollector((s) => s.rsvps)
  const into = useCollector((s) => Object.values(s.verdicts).filter((v) => v.v === 'into').length)
  const qs = Object.keys(quests)
    .map((id) => getQuest(id))
    .filter(Boolean)
  const hs = Object.keys(rsvps)
    .map((id) => getHappening(id))
    .filter(Boolean)
  return (
    <div className="receipt" role="group" aria-label="Quests and happenings">
      <p className="receipt__head pixel">CommonGround · Activity receipt</p>
      <p className="receipt__rule" aria-hidden="true" />
      {qs.length === 0 && hs.length === 0 && <p className="receipt__empty mono">No quests or plans yet. Rooms post a new quest every week.</p>}
      <ul className="receipt__lines">
        {qs.map((q) => (
          <li key={q!.id}>
            <span className="receipt__k">
              QUEST {q!.code} {q!.title}
            </span>
            <span className="receipt__dots" aria-hidden="true" />
            <span>DONE</span>
          </li>
        ))}
        {hs.map((h) => {
          const d = ticketDate(h!.when)
          return (
            <li key={h!.id}>
              <span className="receipt__k">RSVP {h!.title}</span>
              <span className="receipt__dots" aria-hidden="true" />
              <span>
                {d.day} {d.date} {d.month}
              </span>
            </li>
          )
        })}
      </ul>
      <p className="receipt__rule" aria-hidden="true" />
      <p className="receipt__total">
        <span>TOTAL CURIOSITY</span>
        <span className="receipt__dots" aria-hidden="true" />
        <span>{pad(into + qs.length + hs.length)}</span>
      </p>
      <p className="receipt__thanks pixel">Thank you. Come back weird.</p>
    </div>
  )
}

/** A dot for every hobby in the universe; the ones you've found light up. */
export function DiscoveryMap() {
  const discovered = useCollector((s) => s.discovered)
  const count = Object.keys(discovered).length
  return (
    <div className="dmap">
      <p className="dmap__count">
        <span className="display">{pad(count)}</span>
        <span className="mono">/ {hobbyCount} hobbies discovered</span>
      </p>
      <ul className="dmap__dots" aria-hidden="true">
        {listHobbies().map((h) => (
          <li
            key={h.id}
            className={discovered[h.id] ? 'is-on' : ''}
            style={{ '--c': swatchOf(h).bg } as CSSProperties}
            title={discovered[h.id] ? h.name : 'Not yet'}
          />
        ))}
      </ul>
      <Link to="/rabbit-hole" className="text-btn">
        Find more in the Rabbit Hole →
      </Link>
    </div>
  )
}
