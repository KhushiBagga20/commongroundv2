import type { CSSProperties } from 'react'
import { Avatar } from '@/art/Avatar'
import { SIGNALS, VIBE_LABELS, type SignalId } from '@/data/palette'
import type { Vibe } from '@/data/types'
import { cn, longDate, pad } from '@/lib/format'
import { hash } from '@/lib/random'

export interface PassLook {
  name: string
  signal: SignalId
  vibes: Vibe[]
  createdAt?: number
}

/** The visitor pass: a ticket with a perforated stub. */
export function PassCard({ pass, stats, className }: { pass: PassLook; stats?: { label: string; value: number }[]; className?: string }) {
  const signal = SIGNALS.find((s) => s.id === pass.signal) ?? SIGNALS[0]
  const name = pass.name.trim() || 'Curious Human'
  const serial = pad(hash(name) % 10000, 4)
  return (
    <div className={cn('pass', className)} style={{ '--signal': signal.color } as CSSProperties}>
      <div className="pass__stub" aria-hidden="true">
        <span className="pixel pass__admit">Admit one</span>
        <span className="pixel pass__serial">№{serial}</span>
      </div>
      <div className="pass__main">
        <div className="pass__row">
          <span className="pixel pass__kicker">CommonGround · Visitor pass</span>
          <Avatar seed={name} size={46} />
        </div>
        <p className="display pass__name">{name}</p>
        <ul className="pass__vibes" aria-label="Vibes">
          {pass.vibes.length ? (
            pass.vibes.map((v) => (
              <li key={v} className="chip">
                {VIBE_LABELS[v]}
              </li>
            ))
          ) : (
            <li className="chip pass__novibe">Vibe: undecided</li>
          )}
        </ul>
        {stats && (
          <dl className="pass__stats">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="label">{s.label}</dt>
                <dd className="pixel">{pad(s.value)}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="pass__foot">
          <span className="pass__barcode" aria-hidden="true" />
          <span className="label">{pass.createdAt ? `Curious since ${longDate(pass.createdAt)}` : 'Curious since today'}</span>
        </div>
      </div>
    </div>
  )
}
