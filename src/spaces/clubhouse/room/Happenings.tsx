import type { CSSProperties } from 'react'
import { Check, Flag, Globe, MapPin } from 'lucide-react'
import { DemoBadge } from '@/components/ui/bits'
import type { Happening, Quest, Room } from '@/data/types'
import { cn, ticketDate } from '@/lib/format'
import { useCollector } from '@/store/collector'
import { toast } from '@/store/ui'

export function QuestCard({ quest, room, compact = false }: { quest: Quest; room: Room; compact?: boolean }) {
  const done = useCollector((s) => !!s.quests[quest.id])
  const toggleQuest = useCollector((s) => s.toggleQuest)
  return (
    <article className={cn('quest', done && 'is-done', compact && 'quest--compact')} style={{ '--qa': room.identity.accent } as CSSProperties}>
      <p className="pixel quest__code">
        <Flag size={13} strokeWidth={2.6} aria-hidden="true" /> Quest {quest.code} · this week
      </p>
      <h3 className="display quest__title">{quest.title}</h3>
      <p className="quest__brief">{quest.brief}</p>
      <button
        type="button"
        className="ink-btn ink-btn--sm"
        aria-pressed={done}
        style={{ '--face': done ? 'var(--acid-green)' : 'var(--paper)' } as CSSProperties}
        onClick={() => {
          toggleQuest(quest.id)
          if (!done) toast({ title: `Quest ${quest.code} complete`, body: 'Logged in your Collection.', tone: 'acid' })
        }}
      >
        {done ? <Check size={15} strokeWidth={3} aria-hidden="true" /> : null}
        {done ? 'Done — nice' : 'Mark as done'}
      </button>
    </article>
  )
}

/** Upcoming events, as tear-off tickets. */
export function Happenings({ room, happenings, quest }: { room: Room; happenings: Happening[]; quest?: Quest }) {
  const rsvps = useCollector((s) => s.rsvps)
  const toggleRsvp = useCollector((s) => s.toggleRsvp)
  return (
    <div className="happenings">
      {quest && <QuestCard quest={quest} room={room} />}
      <div className="happenings__head">
        <h3 className="label">Coming up</h3>
        <DemoBadge>Demo events · RSVPs stay in this browser</DemoBadge>
      </div>
      <ul className="tickets">
        {happenings.map((h) => {
          const d = ticketDate(h.when)
          const going = !!rsvps[h.id]
          const count = h.going + (going ? 1 : 0)
          const full = count >= h.capacity && !going
          return (
            <li key={h.id} className={cn('ticket', going && 'is-going')}>
              <div className="ticket__date" style={{ background: room.identity.bg, color: room.identity.fg }}>
                <span className="pixel">{d.day}</span>
                <span className="display ticket__day">{d.date}</span>
                <span className="pixel">{d.month}</span>
              </div>
              <div className="ticket__body">
                <h4 className="ticket__title">{h.title}</h4>
                <p className="ticket__where mono">
                  {h.kind === 'online' ? <Globe size={13} strokeWidth={2.6} aria-hidden="true" /> : <MapPin size={13} strokeWidth={2.6} aria-hidden="true" />}{' '}
                  {d.time} · {h.where}
                </p>
                <p className="ticket__blurb">{h.blurb}</p>
                <div className="ticket__cap" role="img" aria-label={`${count} of ${h.capacity} spots taken`}>
                  <span style={{ width: `${Math.min(100, (count / h.capacity) * 100)}%` }} />
                </div>
                <p className="ticket__count mono">
                  {count}/{h.capacity} going
                </p>
              </div>
              <div className="ticket__stub">
                <button
                  type="button"
                  className="ink-btn ink-btn--sm"
                  aria-pressed={going}
                  disabled={full}
                  style={{ '--face': going ? 'var(--acid-green)' : 'var(--butter)' } as CSSProperties}
                  onClick={() => {
                    toggleRsvp(h.id)
                    if (!going) toast({ title: 'You’re going!', body: `${h.title} · ${d.day} ${d.date} ${d.month}`, tone: 'butter' })
                  }}
                >
                  {going ? 'Going ✓' : full ? 'Full' : 'I’m going'}
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
