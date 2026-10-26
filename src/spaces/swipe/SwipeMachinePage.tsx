import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { Bookmark, Heart, Info, Layers, RotateCcw, Shuffle, Undo2, Waypoints, X } from 'lucide-react'
import { Pip, type PipMood } from '@/art/Pip'
import { MiniPoster } from '@/components/hobby/HobbyPoster'
import { EmptyState } from '@/components/ui/bits'
import { InkButton } from '@/components/ui/InkButton'
import { Keycap } from '@/components/ui/Keycap'
import { C, CATEGORIES, CATEGORY_BY_ID, VIBE_LABELS } from '@/data/palette'
import { getHobby, hobbyCount, listHobbies } from '@/data/repository'
import type { CategoryId, Verdict } from '@/data/types'
import { useDossier } from '@/hooks/useDossier'
import { useHotkeys } from '@/hooks/useHotkeys'
import { buildDeck } from '@/lib/deck'
import { pad } from '@/lib/format'
import { pick } from '@/lib/random'
import { idsWith, useCollector } from '@/store/collector'
import { toast, useUI } from '@/store/ui'
import { Celebrations, CHEERS, type Cheer } from './Celebrations'
import { DeckCard, FlyingCard, type Lean, type Release } from './DeckCard'
import { StashTray } from './StashTray'

interface Flyer {
  key: string
  hobbyId: string
  verdict: Verdict
  from: Release
}

const LABEL: Record<Verdict, string> = { into: 'into it', nah: 'not for you', later: 'saved for later' }

function isControl(t: EventTarget | null) {
  return t instanceof HTMLElement && !!t.closest('button, a, [role="tab"], [role="radio"]')
}

/** Space 02 — Hobby Tinder, rebuilt as an arcade cabinet. */
export default function SwipeMachinePage() {
  const verdicts = useCollector((s) => s.verdicts)
  const deckSeed = useCollector((s) => s.deckSeed)
  const pass = useCollector((s) => s.pass)
  const historyLen = useCollector((s) => s.history.length)
  const setVerdict = useCollector((s) => s.setVerdict)
  const undo = useCollector((s) => s.undo)
  const resetSkipped = useCollector((s) => s.resetSkipped)
  const reshuffle = useCollector((s) => s.reshuffle)
  const openPass = useUI((s) => s.openPass)
  const { open: openDossier } = useDossier()

  const [category, setCategory] = useState<CategoryId | 'all'>('all')
  const [pinned, setPinned] = useState<{ id: string; from: { x: number; y: number } } | null>(null)
  const [flyers, setFlyers] = useState<Flyer[]>([])
  const [flippedId, setFlippedId] = useState<string | null>(null)
  const [cheers, setCheers] = useState<Cheer[]>([])
  const [pip, setPip] = useState<PipMood>('idle')
  const [tray, setTray] = useState<null | 'into' | 'later'>(null)
  const [announce, setAnnounce] = useState('')
  const screen = useRef<HTMLDivElement>(null)
  const pipTimer = useRef(0)
  const lastCheer = useRef(0)
  const leanMood = useRef<PipMood>('idle')

  const vibes = useMemo(() => pass?.vibes ?? [], [pass])
  const deck = useMemo(
    () => buildDeck({ hobbies: listHobbies(), category, seed: deckSeed, verdicts, vibes, pinned: pinned?.id }),
    [category, deckSeed, verdicts, vibes, pinned],
  )
  const top = deck[0]
  const visible = deck.slice(0, 3)
  // a flip belongs to one card; a new top card always arrives face up
  const flipped = !!top && flippedId === top.id
  const toggleFlip = useCallback(() => {
    if (top) setFlippedId((f) => (f === top.id ? null : top.id))
  }, [top])
  const into = idsWith(verdicts, 'into')
  const later = idsWith(verdicts, 'later')
  const seen = Object.keys(verdicts).length
  const remaining = useMemo(() => {
    const counts: Record<string, number> = { all: 0 }
    for (const h of listHobbies()) {
      if (verdicts[h.id]) continue
      counts.all++
      counts[h.category] = (counts[h.category] ?? 0) + 1
    }
    return counts
  }, [verdicts])
  const skippedHere = listHobbies().some((h) => verdicts[h.id]?.v === 'nah' && (category === 'all' || h.category === category))

  useEffect(() => () => window.clearTimeout(pipTimer.current), [])

  const flashPip = useCallback((mood: PipMood, ms = 1100) => {
    window.clearTimeout(pipTimer.current)
    setPip(mood)
    pipTimer.current = window.setTimeout(() => setPip('idle'), ms)
  }, [])

  const onLean = useCallback((lean: Lean, amount: number) => {
    const el = screen.current
    if (el) {
      el.style.setProperty('--lean-into', String(lean === 'into' ? amount : 0))
      el.style.setProperty('--lean-nah', String(lean === 'nah' ? amount : 0))
      el.style.setProperty('--lean-later', String(lean === 'later' ? amount : 0))
    }
    const mood: PipMood = amount < 0.3 ? 'idle' : lean === 'into' ? 'happy' : lean === 'nah' ? 'meh' : lean === 'later' ? 'wow' : 'idle'
    if (mood !== leanMood.current) {
      leanMood.current = mood
      window.clearTimeout(pipTimer.current)
      setPip(mood)
    }
  }, [])

  const celebrate = useCallback((intoCount: number) => {
    const now = Date.now()
    const big = intoCount > 0 && intoCount % 5 === 0
    if (!big && now - lastCheer.current < 650) return
    lastCheer.current = now
    const cheer: Cheer = { id: now, sticker: pick(CHEERS), x: 58 + Math.random() * 22, y: 6 + Math.random() * 46, r: Math.random() * 34 - 17, big }
    setCheers((c) => [...c.slice(-2), cheer])
    window.setTimeout(() => setCheers((c) => c.filter((x) => x.id !== cheer.id)), big ? 1600 : 1000)
    const el = screen.current?.parentElement
    if (el) {
      el.classList.remove('is-cheer')
      void el.offsetWidth
      el.classList.add('is-cheer')
    }
  }, [])

  const decide = useCallback(
    (v: Verdict, from: Release) => {
      if (!top) return
      const key = `${top.id}-${Date.now()}`
      setFlyers((f) => [...f, { key, hobbyId: top.id, verdict: v, from }])
      // belt and braces: a flyer never outlives its flight
      window.setTimeout(() => setFlyers((all) => all.filter((x) => x.key !== key)), 1000)
      setVerdict(top.id, v, { fromSwipe: true })
      setPinned(null)
      onLean(null, 0)
      leanMood.current = 'idle'
      if (v === 'into') {
        celebrate(into.length + 1)
        flashPip('excited', 900)
      } else flashPip(v === 'nah' ? 'meh' : 'wink', 800)
      setAnnounce(`${top.name}: ${LABEL[v]}. ${Math.max(0, deck.length - 1)} left in this deck.`)
    },
    [top, deck.length, into.length, setVerdict, onLean, celebrate, flashPip],
  )

  const decideByKey = useCallback(
    (v: Verdict) => {
      if (!top) return
      decide(v, { x: 0, y: 0, vx: v === 'into' ? 1500 : v === 'nah' ? -1500 : 0, vy: v === 'later' ? -1700 : 0, rotate: 0 })
    },
    [top, decide],
  )

  const doUndo = useCallback(() => {
    const ev = undo()
    if (!ev) {
      toast({ title: 'Nothing to undo', tone: 'ink' })
      return
    }
    const h = getHobby(ev.id)
    if (h && category !== 'all' && h.category !== category) setCategory('all')
    setPinned({ id: ev.id, from: { x: ev.verdict === 'into' ? 640 : ev.verdict === 'nah' ? -640 : 0, y: ev.verdict === 'later' ? -640 : 0 } })
    flashPip('confused', 1000)
    setAnnounce(`Undid ${h?.name ?? 'last card'}. It's back on top.`)
  }, [undo, category, flashPip])

  useHotkeys({
    ArrowRight: (e) => {
      e.preventDefault()
      decideByKey('into')
    },
    ArrowLeft: (e) => {
      e.preventDefault()
      decideByKey('nah')
    },
    ArrowUp: (e) => {
      e.preventDefault()
      decideByKey('later')
    },
    z: doUndo,
    u: doUndo,
    ' ': (e) => {
      if (isControl(e.target)) return
      e.preventDefault()
      toggleFlip()
    },
    i: () => top && openDossier(top.id),
  })

  return (
    <div className="space swipe tone-dark">
      <div className="swipe__bg" aria-hidden="true">
        <div className="swipe__rings" />
      </div>

      <div className="wrap swipe__wrap">
        <div className="swipe__layout">
          <header className="swipe__head">
            <div>
              <p className="label swipe__kicker">Channel 02 · Hobby Tinder</p>
              <h1 className="display swipe__title">The Swipe Machine</h1>
            </div>
            <div className="swipe__head-side">
              <p className="swipe__legend mono">
                <span>→ into it</span>
                <span>← nah</span>
                <span>↑ later</span>
                <span>tap to flip</span>
              </p>
              <button type="button" className="swipe__stash-btn" onClick={() => setTray('into')}>
                <Heart size={16} strokeWidth={2.6} aria-hidden="true" /> <span className="pixel">{pad(into.length)}</span>
                <span className="sr-only">hobbies you're into. Open stash.</span>
              </button>
            </div>
          </header>

          <div className="swipe__cats scroll-x" role="group" aria-label="Filter the deck by category">
            {[{ id: 'all' as const, label: 'All', color: C.paper }, ...CATEGORIES].map((c) => (
              <Keycap
                key={c.id}
                className="cat-key"
                aria-pressed={category === c.id}
                on={c.color}
                led={c.id === 'all' ? C.acid : c.color}
                depth={5}
                radius={11}
                onClick={() => {
                  setCategory(c.id)
                  setPinned(null)
                }}
              >
                <span className="cat-key__label">{c.label}</span>
                <span className="cat-key__count pixel">{remaining[c.id] ?? 0}</span>
              </Keycap>
            ))}
          </div>

          <aside className="swipe__side swipe__side--stash" aria-label="Your stash">
            <p className="label">Your stash</p>
            <div className="swipe__counters">
              <button type="button" className="swipe__counter" onClick={() => setTray('into')}>
                <span className="lcd swipe__counter-num">{pad(into.length)}</span>
                <span className="swipe__counter-label">
                  <Heart size={14} strokeWidth={2.6} aria-hidden="true" /> into it
                </span>
              </button>
              <button type="button" className="swipe__counter" onClick={() => setTray('later')}>
                <span className="lcd swipe__counter-num" style={{ color: C.lavender }}>
                  {pad(later.length)}
                </span>
                <span className="swipe__counter-label">
                  <Bookmark size={14} strokeWidth={2.6} aria-hidden="true" /> later
                </span>
              </button>
            </div>
            {into.length > 0 ? (
              <ul className="swipe__recent">
                {into.slice(0, 4).map((id) => (
                  <li key={id}>
                    <button type="button" className="swipe__recent-btn" onClick={() => openDossier(id)} aria-label={`Open ${getHobby(id)?.name}`}>
                      <MiniPoster hobby={getHobby(id)!} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="swipe__hint">Your first right-swipe lands here.</p>
            )}
          </aside>

          <div className="cabinet">
            <div className="cabinet__peek" aria-hidden="true">
              <Pip mood={top ? pip : 'sleepy'} size={64} />
            </div>
            <div className="cabinet__marquee">
              <span className="cabinet__bulbs" aria-hidden="true">
                {Array.from({ length: 12 }, (_, i) => (
                  <i key={i} style={{ animationDelay: `${(i % 6) * 0.14}s` }} />
                ))}
              </span>
              <span className="pixel cabinet__brand">Insert curiosity</span>
              <span className="pixel cabinet__cat">{category === 'all' ? 'All hobbies' : CATEGORY_BY_ID[category].label}</span>
            </div>

            <div ref={screen} className="cabinet__screen" style={{ '--lean-into': 0, '--lean-nah': 0, '--lean-later': 0 } as CSSProperties}>
              <div className="cabinet__glow cabinet__glow--into" />
              <div className="cabinet__glow cabinet__glow--nah" />
              <div className="cabinet__glow cabinet__glow--later" />
              <div className="cabinet__scan" />

              <div className="deck" role="region" aria-label={top ? `Card: ${top.name}. ${top.tagline}` : 'Deck empty'} aria-roledescription="card deck">
                {visible.map((h, i) => (
                  <DeckCard
                    key={h.id}
                    hobby={h}
                    depth={i}
                    flipped={i === 0 && flipped}
                    enterFrom={pinned?.id === h.id ? pinned.from : null}
                    onDecide={decide}
                    onFlip={toggleFlip}
                    onOpen={() => openDossier(h.id)}
                    onLean={onLean}
                  />
                ))}
                {flyers.map((f) => (
                  <FlyingCard
                    key={f.key}
                    hobby={getHobby(f.hobbyId)!}
                    verdict={f.verdict}
                    from={f.from}
                    onDone={() => setFlyers((all) => all.filter((x) => x.key !== f.key))}
                  />
                ))}
              </div>

              {!top && (
                <div className="cabinet__empty">
                  <EmptyState
                    mood="sleepy"
                    tone="dark"
                    title={category === 'all' ? 'You’ve seen every card' : `That’s every ${CATEGORY_BY_ID[category].label} card`}
                  >
                    {category === 'all'
                      ? `All ${hobbyCount} hobbies sorted. Go see where they lead, or give the skipped ones a second chance.`
                      : 'Try another category, or bring back the ones you skipped.'}
                  </EmptyState>
                  <div className="cabinet__empty-actions">
                    {skippedHere && (
                      <InkButton size="sm" face={C.acid} onClick={resetSkipped}>
                        <Shuffle size={16} strokeWidth={2.6} aria-hidden="true" /> Reshuffle skipped
                      </InkButton>
                    )}
                    {category !== 'all' && (
                      <InkButton size="sm" face={C.paper} onClick={() => setCategory('all')}>
                        <Layers size={16} strokeWidth={2.6} aria-hidden="true" /> All categories
                      </InkButton>
                    )}
                    <Link to="/rabbit-hole" className="ink-btn ink-btn--sm" style={{ '--face': C.lavender } as CSSProperties}>
                      <Waypoints size={16} strokeWidth={2.6} aria-hidden="true" /> Rabbit Hole
                    </Link>
                  </div>
                </div>
              )}

              <Celebrations cheers={cheers} />
            </div>

            <div className="cabinet__controls" role="group" aria-label="Swipe controls">
              <Keycap
                className="ctl-key"
                cap={C.tangerine}
                on={C.tangerine}
                led={false}
                legend="←"
                onClick={() => decideByKey('nah')}
                disabled={!top}
                aria-label="Not for me (left arrow)"
              >
                <X size={22} strokeWidth={3} aria-hidden="true" />
                <span className="ctl-key__label">Nah</span>
              </Keycap>
              <Keycap className="ctl-key ctl-key--small" led={false} legend="Z" onClick={doUndo} disabled={historyLen === 0} aria-label="Undo last swipe (Z)">
                <Undo2 size={19} strokeWidth={2.8} aria-hidden="true" />
                <span className="ctl-key__label">Undo</span>
              </Keycap>
              <Keycap
                className="ctl-key ctl-key--small"
                led={false}
                legend="␣"
                onClick={toggleFlip}
                disabled={!top}
                aria-pressed={flipped}
                on={C.paper}
                aria-label="Flip card (space)"
              >
                <RotateCcw size={19} strokeWidth={2.8} aria-hidden="true" />
                <span className="ctl-key__label">Flip</span>
              </Keycap>
              <Keycap
                className="ctl-key ctl-key--small"
                led={false}
                legend="I"
                onClick={() => top && openDossier(top.id)}
                disabled={!top}
                aria-label="Open the full dossier (I)"
              >
                <Info size={19} strokeWidth={2.8} aria-hidden="true" />
                <span className="ctl-key__label">Dossier</span>
              </Keycap>
              <Keycap
                className="ctl-key"
                cap={C.lavender}
                on={C.lavender}
                led={false}
                legend="↑"
                onClick={() => decideByKey('later')}
                disabled={!top}
                aria-label="Save for later (up arrow)"
              >
                <Bookmark size={21} strokeWidth={2.8} aria-hidden="true" />
                <span className="ctl-key__label">Later</span>
              </Keycap>
              <Keycap
                className="ctl-key ctl-key--into"
                cap={C.acid}
                on={C.acid}
                led={false}
                legend="→"
                onClick={() => decideByKey('into')}
                disabled={!top}
                aria-label="Into it (right arrow)"
              >
                <Heart size={22} strokeWidth={3} aria-hidden="true" />
                <span className="ctl-key__label">Into it</span>
              </Keycap>
            </div>
          </div>

          <aside className="swipe__side swipe__side--pip" aria-label="Machine status">
            <div className="swipe__pip">
              <Pip mood={top ? pip : 'sleepy'} size={150} pokeable />
            </div>
            <dl className="swipe__lcd lcd">
              <div>
                <dt>Deck</dt>
                <dd>{pad(deck.length)}</dd>
              </div>
              <div>
                <dt>Seen</dt>
                <dd>
                  {pad(seen)}/{hobbyCount}
                </dd>
              </div>
            </dl>
            {vibes.length ? (
              <p className="swipe__tuned">
                <span className="label">Tuned to</span> {vibes.map((v) => VIBE_LABELS[v]).join(' · ')}
              </p>
            ) : (
              <p className="swipe__tuned">
                <span className="label">Untuned deck</span>
                <button type="button" className="text-btn" onClick={() => openPass()}>
                  Pick your vibes
                </button>{' '}
                and matching hobbies rise to the top.
              </p>
            )}
            <button type="button" className="text-btn swipe__reshuffle" onClick={reshuffle}>
              <Shuffle size={14} strokeWidth={2.6} aria-hidden="true" /> Reshuffle order
            </button>
          </aside>
        </div>
      </div>

      <StashTray open={!!tray} initial={tray ?? 'into'} onClose={() => setTray(null)} />
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
      <p className="sr-only">
        Use the controls below the card, or the arrow keys: right for into it, left for not for me, up for later. Space flips the card, Z undoes.
      </p>
    </div>
  )
}
