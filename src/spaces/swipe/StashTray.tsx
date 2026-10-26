import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, Bookmark, Heart, X } from 'lucide-react'
import { MiniPoster } from '@/components/hobby/HobbyPoster'
import { EmptyState } from '@/components/ui/bits'
import { Sheet } from '@/components/ui/Overlay'
import { getHobby } from '@/data/repository'
import type { Verdict } from '@/data/types'
import { useDossier } from '@/hooks/useDossier'
import { cn } from '@/lib/format'
import { idsWith, useCollector } from '@/store/collector'

/** Everything you've swiped right or up on, without leaving the machine. */
export function StashTray({ open, onClose, initial = 'into' }: { open: boolean; onClose: () => void; initial?: 'into' | 'later' }) {
  return (
    <Sheet open={open} onClose={onClose} label="Your stash" width={560}>
      {open && <StashBody initial={initial} />}
    </Sheet>
  )
}

function StashBody({ initial }: { initial: 'into' | 'later' }) {
  const [tab, setTab] = useState<'into' | 'later'>(initial)
  const verdicts = useCollector((s) => s.verdicts)
  const setVerdict = useCollector((s) => s.setVerdict)
  const clearVerdict = useCollector((s) => s.clearVerdict)
  const { open: openDossier } = useDossier()
  const ids = idsWith(verdicts, tab)
  const counts = { into: idsWith(verdicts, 'into').length, later: idsWith(verdicts, 'later').length }

  const move = (id: string, v: Verdict) => setVerdict(id, v)

  return (
    <div className="stash">
      <p className="pixel stash__kicker">Your stash</p>
      <h2 className="display stash__title">Things you’re into</h2>
      <div className="stash__tabs" role="tablist" aria-label="Stash">
        {(['into', 'later'] as const).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} className={cn('stash__tab', tab === t && 'is-on')} onClick={() => setTab(t)}>
            {t === 'into' ? <Heart size={15} strokeWidth={2.6} /> : <Bookmark size={15} strokeWidth={2.6} />}
            {t === 'into' ? 'Into it' : 'Saved for later'} <span className="pixel">{counts[t]}</span>
          </button>
        ))}
      </div>

      {ids.length === 0 ? (
        <EmptyState mood={tab === 'into' ? 'confused' : 'sleepy'} title={tab === 'into' ? 'Nothing yet' : 'No maybes'}>
          {tab === 'into' ? 'Swipe right (or press →) on a card that sparks something.' : 'Swipe up (or press ↑) to keep a hobby for later without committing.'}
        </EmptyState>
      ) : (
        <ul className="stash__grid" role="tabpanel">
          {ids.map((id) => {
            const h = getHobby(id)
            if (!h) return null
            return (
              <li key={id} className="stash__item">
                <button type="button" className="stash__open" onClick={() => openDossier(id)} aria-label={`Open ${h.name}`}>
                  <MiniPoster hobby={h} />
                </button>
                <div className="stash__actions">
                  <button
                    type="button"
                    className="stash__act"
                    onClick={() => move(id, tab === 'into' ? 'later' : 'into')}
                    aria-label={tab === 'into' ? `Move ${h.name} to later` : `Move ${h.name} to into it`}
                  >
                    {tab === 'into' ? <Bookmark size={14} strokeWidth={2.6} /> : <Heart size={14} strokeWidth={2.6} />}
                  </button>
                  <button type="button" className="stash__act" onClick={() => clearVerdict(id)} aria-label={`Remove ${h.name} and put it back in the deck`}>
                    <X size={14} strokeWidth={2.8} />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Link to="/collection" className="ink-btn stash__link">
        See it all in your Collection <ArrowRight size={18} strokeWidth={2.8} aria-hidden="true" />
      </Link>
    </div>
  )
}
