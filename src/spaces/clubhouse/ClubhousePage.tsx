import { useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, ArrowRight, Check, DoorOpen } from 'lucide-react'
import { Pip } from '@/art/Pip'
import { DemoBadge } from '@/components/ui/bits'
import { Keycap } from '@/components/ui/Keycap'
import { C } from '@/data/palette'
import { getHobby, listRooms, recommendRooms } from '@/data/repository'
import type { Hobby, Room } from '@/data/types'
import { useDragScroll } from '@/hooks/useDragScroll'
import { idsWith, useCollector } from '@/store/collector'
import { Door } from './Door'

type Filter = 'for-you' | 'all' | 'joined'

/** Space 04 — a hallway of rooms. Knock on any door. */
export default function ClubhousePage() {
  const verdicts = useCollector((s) => s.verdicts)
  const joined = useCollector((s) => s.joined)
  const intoKey = idsWith(verdicts, 'into').join(',')
  const recs = useMemo(() => recommendRooms(intoKey ? intoKey.split(',') : []), [intoKey])
  const [filter, setFilter] = useState<Filter>(recs.length ? 'for-you' : 'all')
  const hall = useRef<HTMLDivElement>(null)
  useDragScroll(hall)

  const matchesFor = (room: Room): Hobby[] => recs.find((r) => r.room.id === room.id)?.matches ?? []
  const rooms: Room[] =
    filter === 'for-you'
      ? [...recs.map((r) => r.room), ...listRooms().filter((r) => !recs.some((x) => x.room.id === r.id))]
      : filter === 'joined'
        ? listRooms().filter((r) => joined[r.id])
        : listRooms()
  const joinedCount = Object.keys(joined).length

  const scrollBy = (dir: number) => hall.current?.scrollBy({ left: dir * Math.min(window.innerWidth * 0.7, 720), behavior: 'smooth' })

  return (
    <div className="space club tone-light">
      <div className="club__wall" aria-hidden="true" />
      <div className="wrap club__head">
        <div>
          <p className="label club__kicker">Channel 04</p>
          <h1 className="display club__title">The Clubhouse</h1>
          <p className="lede club__lede">
            Eleven rooms, each with its own weather. Every door opens — look around, then join the ones that feel like your people.
          </p>
        </div>
        <div className="club__filters" role="radiogroup" aria-label="Which rooms">
          <Keycap
            role="radio"
            aria-checked={filter === 'for-you'}
            on={C.acid}
            led={C.acid}
            depth={6}
            onClick={() => setFilter('for-you')}
            disabled={!recs.length}
            className="club__filter"
            title={recs.length ? undefined : 'Swipe right on a few hobbies first'}
          >
            <span>For you</span> <span className="pixel">{recs.length}</span>
          </Keycap>
          <Keycap
            role="radio"
            aria-checked={filter === 'all'}
            on={C.butter}
            led={C.tangerine}
            depth={6}
            onClick={() => setFilter('all')}
            className="club__filter"
          >
            <span>All rooms</span> <span className="pixel">{listRooms().length}</span>
          </Keycap>
          <Keycap
            role="radio"
            aria-checked={filter === 'joined'}
            on={C.lavender}
            led={C.acid}
            depth={6}
            onClick={() => setFilter('joined')}
            className="club__filter"
          >
            <span>Joined</span> <span className="pixel">{joinedCount}</span>
          </Keycap>
        </div>
      </div>

      <section className="hall" aria-label="Hallway of rooms">
        <div className="hall__peek" aria-hidden="true">
          <Pip mood={rooms.length ? 'wow' : 'confused'} size={110} />
        </div>
        {rooms.length ? (
          <div ref={hall} className="hall__track scroll-x" tabIndex={-1}>
            {rooms.map((r) => (
              <Door key={r.id} room={r} index={listRooms().indexOf(r)} joined={!!joined[r.id]} matches={matchesFor(r)} />
            ))}
            <div className="hall__end" aria-hidden="true">
              <span className="pixel">End of the hall.</span>
              <span className="pixel">More rooms soon.</span>
            </div>
          </div>
        ) : (
          <div className="hall__empty">
            <p className="display">No rooms yet</p>
            <p>Join one and it hangs here. Try the full hallway.</p>
            <button type="button" className="ink-btn" onClick={() => setFilter('all')}>
              Show all rooms
            </button>
          </div>
        )}
        <div className="hall__floor" aria-hidden="true" />
        {rooms.length > 0 && (
          <div className="hall__nav">
            <button type="button" className="ink-btn ink-btn--icon" onClick={() => scrollBy(-1)} aria-label="Scroll hallway left">
              <ArrowLeft size={20} strokeWidth={2.8} />
            </button>
            <button type="button" className="ink-btn ink-btn--icon" onClick={() => scrollBy(1)} aria-label="Scroll hallway right">
              <ArrowRight size={20} strokeWidth={2.8} />
            </button>
          </div>
        )}
      </section>

      <section className="wrap directory" aria-labelledby="dir-title">
        <div className="directory__head">
          <h2 id="dir-title" className="display directory__title">
            Room directory
          </h2>
          <DemoBadge>Demo rooms · member counts are illustrative</DemoBadge>
        </div>
        <ul className="directory__list">
          {listRooms().map((r) => (
            <li key={r.id}>
              <Link to={`/clubhouse/${r.id}`} className="directory__row" style={{ '--rb': r.identity.bg, '--rf': r.identity.fg } as CSSProperties}>
                <span className="directory__swatch" aria-hidden="true">
                  <DoorOpen size={18} strokeWidth={2.6} />
                </span>
                <span className="directory__name">
                  <strong>{r.name}</strong>
                  <span>{r.tagline}</span>
                </span>
                <span className="directory__hobbies mono">{r.hobbyIds.map((h) => getHobby(h)?.name).join(' · ')}</span>
                <span className="directory__count mono">{r.memberCount} members</span>
                <span className="directory__status">
                  {joined[r.id] && (
                    <span className="chip chip--solid" style={{ '--chip-bg': C.acid, '--chip-fg': C.ink } as CSSProperties}>
                      <Check size={12} strokeWidth={3} /> joined
                    </span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
