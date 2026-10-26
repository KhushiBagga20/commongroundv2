import type { CSSProperties } from 'react'
import { Bookmark, Heart, Waypoints } from 'lucide-react'
import { HobbyArt } from '@/art/HobbyArt'
import { EmptyState } from '@/components/ui/bits'
import { CATEGORIES } from '@/data/palette'
import { neighbours, swatchOf } from '@/data/repository'
import type { Hobby } from '@/data/types'
import { useDossier } from '@/hooks/useDossier'
import type { NodeStatus } from './HoleMap'

/** The same universe as a plain, searchable list — no spatial skills required. */
export function HoleList({ hobbies, statusOf, onShowOnMap }: { hobbies: Hobby[]; statusOf: (id: string) => NodeStatus; onShowOnMap: (id: string) => void }) {
  const { open } = useDossier()
  if (!hobbies.length) {
    return (
      <div className="hole-list">
        <EmptyState mood="confused" tone="dark" title="No hobby by that name">
          Try a category (“make”), a vibe (“night owl”) or something shorter.
        </EmptyState>
      </div>
    )
  }
  return (
    <div className="hole-list">
      {CATEGORIES.map((cat) => {
        const items = hobbies.filter((h) => h.category === cat.id)
        if (!items.length) return null
        return (
          <section key={cat.id} className="hole-list__group" aria-labelledby={`cat-${cat.id}`}>
            <h2 id={`cat-${cat.id}`} className="hole-list__cat">
              <span className="hole-list__dot" style={{ background: cat.color }} />
              <span className="display">{cat.label}</span>
              <span className="mono hole-list__blurb">{cat.blurb}</span>
            </h2>
            <ul className="hole-list__items">
              {items.map((h) => {
                const status = statusOf(h.id)
                return (
                  <li key={h.id} className="hole-list__item">
                    <button type="button" className="hole-list__main" onClick={() => open(h.id)}>
                      <span className="hole-list__art" style={{ '--c': swatchOf(h).bg } as CSSProperties}>
                        <HobbyArt id={h.id} swatch={h.swatch} />
                      </span>
                      <span className="hole-list__text">
                        <strong>
                          {h.name}
                          {status === 'into' && <Heart size={14} strokeWidth={2.8} aria-label="into it" className="hole-list__badge" />}
                          {status === 'later' && <Bookmark size={14} strokeWidth={2.8} aria-label="saved for later" className="hole-list__badge" />}
                        </strong>
                        <span>{h.tagline}</span>
                        <span className="hole-list__leads mono">
                          →{' '}
                          {neighbours(h.id)
                            .map((n) => n.hobby.name)
                            .join(' · ')}
                        </span>
                      </span>
                    </button>
                    <button type="button" className="hole-list__map" onClick={() => onShowOnMap(h.id)} aria-label={`Show ${h.name} on the map`}>
                      <Waypoints size={16} strokeWidth={2.6} />
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
