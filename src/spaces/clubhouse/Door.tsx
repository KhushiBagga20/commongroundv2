import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import { HobbyArt } from '@/art/HobbyArt'
import { getHobby } from '@/data/repository'
import type { Hobby, Room } from '@/data/types'
import { alpha, patternCSS } from '@/lib/patterns'
import { pad } from '@/lib/format'

/** A room's front door. Swings ajar on hover/focus to show the light inside. */
export function Door({ room, index, joined, matches }: { room: Room; index: number; joined: boolean; matches: Hobby[] }) {
  const id = room.identity
  const emblem = getHobby(id.emblem)!
  const style = {
    '--door': id.bg,
    '--doorfg': id.fg,
    '--glow': id.accent,
  } as CSSProperties
  return (
    <Link
      to={`/clubhouse/${room.id}`}
      className="door"
      style={style}
      data-cursor="knock"
      aria-label={`${room.name}. ${room.tagline} ${joined ? 'You are a member.' : ''}`}
    >
      <span className="door__number pixel" aria-hidden="true">
        Rm.{pad(index + 1)}
      </span>
      <span className="door__frame">
        <span className="door__inside" aria-hidden="true">
          <span className="door__light" />
          <HobbyArt id={emblem.id} swatch={emblem.swatch} mood="happy" className="door__emblem" />
        </span>
        <span className="door__panel" style={patternCSS(id.pattern, alpha(id.fg, 0.14), 0.8)}>
          <span className="door__window" aria-hidden="true" />
          <span className="door__plaque">
            <span className="display">{room.name.replace(/^The /, '')}</span>
          </span>
          <span className="door__knob" aria-hidden="true" />
          {joined && (
            <span className="door__member pixel" aria-hidden="true">
              Member
            </span>
          )}
        </span>
      </span>
      <span className="door__mat" aria-hidden="true">
        <span className="pixel">{room.memberCount} inside</span>
      </span>
      <span className="door__caption">
        <span className="door__tag">{room.tagline}</span>
        {matches.length > 0 && <span className="door__match mono">✓ {matches.map((m) => m.name).join(', ')}</span>}
      </span>
    </Link>
  )
}
