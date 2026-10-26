import { memo, type CSSProperties } from 'react'
import { HalftoneDisc } from '@/art/HalftoneDisc'
import { HobbyArt } from '@/art/HobbyArt'
import type { Mood } from '@/art/primitives'
import { C, VIBE_LABELS } from '@/data/palette'
import { categoryOf, neighbours, swatchOf } from '@/data/repository'
import type { Hobby } from '@/data/types'
import { cn, pad } from '@/lib/format'
import { alpha } from '@/lib/patterns'
import { seeded } from '@/lib/random'
import { CostTier, DifficultyMeter } from '../ui/bits'

export function posterVars(h: Hobby): CSSProperties {
  const sw = swatchOf(h)
  const longest = Math.max(6, ...h.name.split(' ').map((w) => w.length))
  return { '--bg': sw.bg, '--fg': sw.fg, '--main': sw.main, '--alt': sw.alt, '--len': longest } as CSSProperties
}

/** Seeded geometric confetti behind the illustration, so every poster composes differently. */
const PosterShapes = memo(function PosterShapes({ h }: { h: Hobby }) {
  const sw = swatchOf(h)
  const r = seeded(h.id)
  const ink = sw.tone === 'dark' ? alpha(C.paper, 0.9) : C.ink
  const corner = Math.floor(r() * 4)
  const cx = [30, 170, 170, 30][corner]
  const cy = [30, 30, 170, 170][corner]
  const tri = r() > 0.5
  return (
    <svg viewBox="0 0 200 200" className="poster__shapes" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <circle cx={cx} cy={cy} r={22 + r() * 16} fill={sw.alt} stroke={ink} strokeWidth="3" />
      {tri ? (
        <path d={`M${200 - cx} ${cy - 20} l18 34 h-36 z`} fill="none" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
      ) : (
        <rect
          x={200 - cx - 14}
          y={cy - 14}
          width="28"
          height="28"
          fill="none"
          stroke={ink}
          strokeWidth="3"
          transform={`rotate(${r() * 40} ${200 - cx} ${cy})`}
        />
      )}
      <path d={`M${cx > 100 ? 20 : 120} ${cy > 100 ? 40 : 170} q10 -10 20 0 t20 0 t20 0`} fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
})

/** The front of a hobby card: a miniature editorial poster. */
export const HobbyPoster = memo(function HobbyPoster({
  hobby: h,
  mood = 'idle',
  className,
  compact = false,
}: {
  hobby: Hobby
  mood?: Mood
  className?: string
  compact?: boolean
}) {
  const sw = swatchOf(h)
  const cat = categoryOf(h)
  return (
    <article
      className={cn('poster', sw.tone === 'dark' && 'poster--dark', compact && 'poster--compact', className)}
      style={posterVars(h)}
      aria-label={`${h.name}: ${h.tagline}`}
    >
      <header className="poster__top">
        <span className="pixel">No.{pad(h.no)}</span>
        <span className="poster__cat label">
          <span className="poster__catdot" style={{ background: cat.color }} />
          {cat.label}
        </span>
      </header>
      <div className="poster__art">
        <HalftoneDisc color={sw.tone === 'dark' ? alpha(C.paper, 0.22) : alpha(C.ink, 0.2)} className="poster__sun" gap={8} />
        <PosterShapes h={h} />
        <HobbyArt id={h.id} swatch={h.swatch} mood={mood} className="poster__illo" />
      </div>
      <h3 className="poster__title display">{h.name}</h3>
      {!compact && (
        <div className="poster__label">
          <p className="poster__tagline">{h.tagline}</p>
          <dl className="poster__meta">
            <div>
              <dt className="label">Difficulty</dt>
              <dd>
                <DifficultyMeter level={h.difficulty} />
              </dd>
            </div>
            <div>
              <dt className="label">To start</dt>
              <dd>
                <CostTier tier={h.cost.tier} /> <span className="poster__costlabel">{h.cost.label}</span>
              </dd>
            </div>
          </dl>
          <ul className="poster__tags" aria-label="Personality">
            {h.vibes.slice(0, 3).map((v) => (
              <li key={v} className="chip">
                {VIBE_LABELS[v]}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
})

/** The back of a card: the lowdown. */
export function HobbyPosterBack({ hobby: h, onOpen }: { hobby: Hobby; onOpen?: () => void }) {
  const links = neighbours(h.id).slice(0, 4)
  return (
    <article className="poster poster--back" style={posterVars(h)} aria-label={`${h.name} details`}>
      <header className="poster__top">
        <span className="pixel">The lowdown</span>
        <span className="pixel">No.{pad(h.no)}</span>
      </header>
      <h3 className="poster__backtitle display">{h.name}</h3>
      <p className="poster__desc">{h.description}</p>
      <div className="poster__first">
        <span className="label">First step</span>
        <p>{h.firstStep}</p>
      </div>
      <div className="poster__row">
        <span className="label">Time</span>
        <span>{h.time}</span>
      </div>
      <div className="poster__links">
        <span className="label">Leads to</span>
        <ul>
          {links.map((l) => (
            <li key={l.hobby.id} className="chip">
              {l.hobby.name}
            </li>
          ))}
        </ul>
      </div>
      {onOpen && (
        <button
          type="button"
          className="ink-btn ink-btn--sm poster__open"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onOpen()
          }}
        >
          Open the full dossier
        </button>
      )}
    </article>
  )
}

/** Small card for shelves, trays and results. */
export function MiniPoster({ hobby: h, className }: { hobby: Hobby; className?: string }) {
  const sw = swatchOf(h)
  return (
    <div className={cn('mini', sw.tone === 'dark' && 'mini--dark', className)} style={posterVars(h)}>
      <HobbyArt id={h.id} swatch={h.swatch} className="mini__art" />
      <span className="mini__name display">{h.name}</span>
      <span className="mini__cat label">{categoryOf(h).label}</span>
    </div>
  )
}
