import { useState, type CSSProperties } from 'react'
import { Hand } from 'lucide-react'
import { Avatar } from '@/art/Avatar'
import { DemoBadge } from '@/components/ui/bits'
import { VIBE_LABELS } from '@/data/palette'
import { getHobby } from '@/data/repository'
import type { Person, Room } from '@/data/types'
import { cn } from '@/lib/format'
import { idsWith, useCollector } from '@/store/collector'
import { toast } from '@/store/ui'

/** Who's here, who's open to collaborating, and a (pretend) way to say hi. */
export function People({ room, members, joined }: { room: Room; members: Person[]; joined: boolean }) {
  const waves = useCollector((s) => s.waves)
  const toggleWave = useCollector((s) => s.toggleWave)
  const pass = useCollector((s) => s.pass)
  const verdicts = useCollector((s) => s.verdicts)
  const [onlyCollab, setOnlyCollab] = useState(false)
  const mine = new Set(idsWith(verdicts, 'into'))
  const shown = onlyCollab ? members.filter((m) => m.openToCollab) : members

  return (
    <div className="people">
      <div className="people__bar">
        <label className="check">
          <input type="checkbox" checked={onlyCollab} onChange={(e) => setOnlyCollab(e.target.checked)} /> Open to collaborating
        </label>
        <DemoBadge>Fictional members · waving sends nothing</DemoBadge>
      </div>
      <ul className="people__grid">
        {joined && !onlyCollab && (
          <li className="person person--you">
            <Avatar seed={pass?.name ?? 'you'} size={64} />
            <div className="person__body">
              <p className="person__name">
                {pass?.name ?? 'You'} <span className="chip">you</span>
              </p>
              <p className="person__bio">{pass?.vibes.length ? pass.vibes.map((v) => VIBE_LABELS[v]).join(' · ') : 'New here. Lurking with intent.'}</p>
            </div>
          </li>
        )}
        {shown.map((m) => {
          const waved = !!waves[m.id]
          const shared = m.into.filter((h) => mine.has(h))
          return (
            <li key={m.id} className="person">
              <Avatar seed={m.id} size={64} ring={m.id === room.hostId ? room.identity.accent : undefined} />
              <div className="person__body">
                <p className="person__name">
                  {m.name} {m.id === room.hostId && <span className="chip">host</span>}
                </p>
                <p className="person__handle mono">@{m.handle}</p>
                <p className="person__bio">{m.bio}</p>
                <ul className="person__into" aria-label="Into">
                  {m.into.map((h) => (
                    <li key={h} className={cn('chip', mine.has(h) && 'is-shared')}>
                      {getHobby(h)?.name}
                    </li>
                  ))}
                </ul>
                {m.openToCollab && m.lookingFor && <p className="person__looking">Looking for {m.lookingFor}.</p>}
                {shared.length > 0 && <p className="person__shared mono">You’re both into {shared.map((h) => getHobby(h)?.name).join(' & ')}</p>}
              </div>
              <button
                type="button"
                className="ink-btn ink-btn--sm person__wave"
                aria-pressed={waved}
                style={{ '--face': waved ? 'var(--acid-green)' : 'var(--paper)' } as CSSProperties}
                onClick={() => {
                  toggleWave(m.id)
                  if (!waved) toast({ title: `You waved at ${m.name.split(' ')[0]}`, body: 'Demo only — nothing was sent.', tone: 'lav' })
                }}
              >
                <Hand size={15} strokeWidth={2.6} aria-hidden="true" /> {waved ? 'Waved' : 'Wave'}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
