import type { CSSProperties, ReactNode } from 'react'
import { Pip, type PipMood } from '@/art/Pip'
import { cn } from '@/lib/format'

/** Marks anything that is simulated in this prototype. */
export function DemoBadge({ children = 'Demo · local only', className }: { children?: ReactNode; className?: string }) {
  return (
    <span className={cn('demo-badge', className)} title="This is demo content. Anything you add is stored only in this browser.">
      <span aria-hidden="true">◌</span>
      {children}
    </span>
  )
}

const DIFFICULTY = ['', 'Easy start', 'Easy-ish', 'Some grit', 'Real commitment', 'Deep end']

/** Pixel-bar difficulty meter. */
export function DifficultyMeter({ level, tone = 'ink' }: { level: number; tone?: 'ink' | 'paper' }) {
  return (
    <span className={cn('meter', tone === 'paper' && 'meter--paper')} role="img" aria-label={`Difficulty ${level} of 5: ${DIFFICULTY[level]}`}>
      <span className="meter__bars" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={cn('meter__bar', i <= level && 'is-on')} />
        ))}
      </span>
      <span className="meter__label" aria-hidden="true">
        {DIFFICULTY[level]}
      </span>
    </span>
  )
}

export function CostTier({ tier }: { tier: 0 | 1 | 2 | 3 }) {
  return (
    <span className="cost" aria-label={tier === 0 ? 'Free to start' : `Cost tier ${tier} of 3`}>
      {tier === 0 ? 'FREE' : '$'.repeat(tier)}
      <span className="cost__ghost" aria-hidden="true">
        {tier === 0 ? '' : '$'.repeat(3 - tier)}
      </span>
    </span>
  )
}

export function Marquee({ children, duration = 38, className, style }: { children: ReactNode; duration?: number; className?: string; style?: CSSProperties }) {
  return (
    <div className={cn('marquee', className)} style={style} aria-hidden="true">
      <div className="marquee__track" style={{ ['--dur' as string]: `${duration}s` }}>
        <div className="marquee__group">{children}</div>
        <div className="marquee__group">{children}</div>
      </div>
    </div>
  )
}

/** Pip appears in empty states with something useful to do next. */
export function EmptyState({
  mood = 'confused',
  title,
  children,
  actions,
  tone = 'light',
}: {
  mood?: PipMood
  title: string
  children?: ReactNode
  actions?: ReactNode
  tone?: 'light' | 'dark'
}) {
  return (
    <div className={cn('empty', tone === 'dark' && 'empty--dark')}>
      <Pip mood={mood} size={110} />
      <h3 className="empty__title">{title}</h3>
      {children && <p className="empty__body">{children}</p>}
      {actions && <div className="empty__actions">{actions}</div>}
    </div>
  )
}

/** Route-level loading state: only seen while a space's code downloads. */
export function SpaceLoader() {
  return (
    <div className="space-loader" role="status" aria-live="polite">
      <div className="space-loader__pip">
        <Pip mood="excited" size={96} track={false} />
      </div>
      <p className="pixel">Warming up the machine…</p>
    </div>
  )
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('eyebrow label', className)}>{children}</p>
}
