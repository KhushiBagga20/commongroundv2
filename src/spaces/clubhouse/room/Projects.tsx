import { useState, type CSSProperties, type FormEvent } from 'react'
import { motion } from 'motion/react'
import { HandHeart, Pin, Trash } from 'lucide-react'
import { Avatar } from '@/art/Avatar'
import { HobbyArt } from '@/art/HobbyArt'
import { DemoBadge } from '@/components/ui/bits'
import { Keycap } from '@/components/ui/Keycap'
import { C } from '@/data/palette'
import { getHobby } from '@/data/repository'
import type { PatternId, Project, Room } from '@/data/types'
import { cn, timeAgo } from '@/lib/format'
import { alpha, patternCSS } from '@/lib/patterns'
import { spring } from '@/motion/springs'
import { useCollector, YOU } from '@/store/collector'
import { toast } from '@/store/ui'
import { nameOf } from '../useRoom'
import { JoinPrompt } from './JoinPrompt'

const PATTERNS: PatternId[] = ['dots', 'stripes', 'checks', 'waves', 'zigzag', 'confetti']
const COVERS = [C.butter, C.bubblegum, C.acid, C.lavender, C.tangerine, C.electric]

export function ProjectCover({ cover, className }: { cover: Project['cover']; className?: string }) {
  const art = getHobby(cover.art)
  return (
    <div className={cn('cover', className)} style={{ background: cover.bg, color: cover.fg, ...patternCSS(cover.pattern, alpha(cover.fg, 0.16)) }}>
      {art && <HobbyArt id={art.id} swatch={art.swatch} className="cover__art" />}
    </div>
  )
}

/** A pinboard of things people made, and a way to find collaborators. */
export function Projects({ room, projects, joined }: { room: Room; projects: Project[]; joined: boolean }) {
  const addProject = useCollector((s) => s.addProject)
  const removeProject = useCollector((s) => s.removeProject)
  const waves = useCollector((s) => s.waves)
  const toggleWave = useCollector((s) => s.toggleWave)
  const passName = useCollector((s) => s.pass?.name)
  const [title, setTitle] = useState('')
  const [blurb, setBlurb] = useState('')
  const [pattern, setPattern] = useState<PatternId>('dots')
  const [bg, setBg] = useState<string>(room.identity.accent)
  const [collab, setCollab] = useState(true)
  const [onlyCollab, setOnlyCollab] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    addProject(room.id, { title, blurb, lookingForCollab: collab, cover: { pattern, bg, fg: C.ink, art: room.identity.emblem } })
    setTitle('')
    setBlurb('')
    toast({ title: 'Project pinned', body: 'It’s on the board (and in your Collection).', tone: 'acid' })
  }

  const shown = onlyCollab ? projects.filter((p) => p.lookingForCollab) : projects

  return (
    <div className="projects">
      {joined ? (
        <form className="composer composer--project" onSubmit={submit}>
          <div className="composer__head">
            <Pin size={20} strokeWidth={2.6} aria-hidden="true" />
            <p className="composer__title">Pin a project</p>
            <DemoBadge />
          </div>
          <div className="composer__project">
            <ProjectCover cover={{ pattern, bg, fg: C.ink, art: room.identity.emblem }} className="composer__cover" />
            <div className="composer__fields">
              <label className="sr-only" htmlFor="proj-title">
                Project title
              </label>
              <input
                id="proj-title"
                className="field"
                placeholder="What are you making?"
                value={title}
                maxLength={80}
                onChange={(e) => setTitle(e.target.value)}
              />
              <label className="sr-only" htmlFor="proj-blurb">
                Short description
              </label>
              <textarea
                id="proj-blurb"
                className="field"
                placeholder="One or two lines about it."
                value={blurb}
                maxLength={280}
                onChange={(e) => setBlurb(e.target.value)}
              />
              <div className="composer__swatches" role="radiogroup" aria-label="Cover colour">
                {COVERS.map((c) => (
                  <Keycap
                    key={c}
                    role="radio"
                    aria-checked={bg === c}
                    cap={c}
                    on={c}
                    led={false}
                    depth={4}
                    radius={9}
                    className="swatch-key"
                    onClick={() => setBg(c)}
                    aria-label={`Cover colour ${c}`}
                  />
                ))}
              </div>
              <div className="composer__swatches" role="radiogroup" aria-label="Cover pattern">
                {PATTERNS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    role="radio"
                    aria-checked={pattern === p}
                    className={cn('chip vibe-chip', pattern === p && 'is-on')}
                    onClick={() => setPattern(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <label className="check">
                <input type="checkbox" checked={collab} onChange={(e) => setCollab(e.target.checked)} /> Looking for collaborators
              </label>
            </div>
          </div>
          <div className="composer__foot">
            <span />
            <button type="submit" className="ink-btn" disabled={!title.trim()} style={{ '--face': 'var(--acid-green)' } as CSSProperties}>
              <Pin size={16} strokeWidth={2.6} aria-hidden="true" /> Pin it
            </button>
          </div>
        </form>
      ) : (
        <JoinPrompt room={room} action="pin your own projects" />
      )}

      <div className="projects__bar">
        <label className="check">
          <input type="checkbox" checked={onlyCollab} onChange={(e) => setOnlyCollab(e.target.checked)} /> Only projects looking for collaborators
        </label>
      </div>

      <ul className="pinboard">
        {shown.map((p, i) => {
          const mine = p.makerId === YOU
          const waved = !!waves[`project:${p.id}`]
          return (
            <motion.li
              key={p.id}
              className="pin-card"
              style={{ rotate: `${((i * 37) % 7) - 3}deg` } as CSSProperties}
              whileHover={{ rotate: 0, y: -6 }}
              transition={spring.snappy}
            >
              <span className="pin-card__pin" aria-hidden="true" />
              <ProjectCover cover={p.cover} />
              <div className="pin-card__body">
                <h3 className="pin-card__title">{p.title}</h3>
                <p className="pin-card__blurb">{p.blurb}</p>
                <p className="pin-card__maker">
                  <Avatar seed={mine ? (passName ?? 'you') : p.makerId} size={26} /> {nameOf(p.makerId, passName)} ·{' '}
                  <span className="mono">{timeAgo(p.createdAt)}</span>
                </p>
                {p.lookingForCollab && <span className="chip pin-card__collab">Looking for collaborators</span>}
                {p.lookingForCollab && !mine && (
                  <button
                    type="button"
                    className={cn('ink-btn ink-btn--sm', waved && 'is-on')}
                    aria-pressed={waved}
                    style={{ '--face': waved ? 'var(--acid-green)' : 'var(--paper)' } as CSSProperties}
                    onClick={() => {
                      toggleWave(`project:${p.id}`)
                      if (!waved) toast({ title: 'Offer noted', body: 'Demo only: nothing was sent to anyone.', tone: 'lav' })
                    }}
                  >
                    <HandHeart size={15} strokeWidth={2.6} aria-hidden="true" /> {waved ? 'You offered to help' : 'I could help'}
                  </button>
                )}
                {mine && (
                  <button type="button" className="text-btn pin-card__delete" onClick={() => removeProject(p.id)}>
                    <Trash size={14} strokeWidth={2.6} aria-hidden="true" /> Unpin
                  </button>
                )}
              </div>
            </motion.li>
          )
        })}
      </ul>
    </div>
  )
}
