import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { List, Map as MapIcon, Maximize2, Minus, Plus, Search } from 'lucide-react'
import { Pip } from '@/art/Pip'
import { Keycap } from '@/components/ui/Keycap'
import { C, CATEGORY_BY_ID, VIBE_LABELS } from '@/data/palette'
import { getHobby, hobbyCount, listConnections, listHobbies } from '@/data/repository'
import { useHotkeys } from '@/hooks/useHotkeys'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { useCollector } from '@/store/collector'
import { FieldNotes } from './FieldNotes'
import { HoleList } from './HoleList'
import { HoleMap, type HoleMapHandle, type NodeStatus } from './HoleMap'

function matches(q: string) {
  const s = q.trim().toLowerCase()
  if (!s) return listHobbies()
  return listHobbies().filter(
    (h) =>
      h.name.toLowerCase().includes(s) ||
      CATEGORY_BY_ID[h.category].label.toLowerCase().includes(s) ||
      h.vibes.some((v) => VIBE_LABELS[v].toLowerCase().includes(s)) ||
      h.tagline.toLowerCase().includes(s),
  )
}

/** Space 03 — a living map of how hobbies connect, with a list for everyone else. */
export default function RabbitHolePage() {
  const [params, setParams] = useSearchParams()
  const [focus, setFocus] = useState<string | null>(() => {
    const f = params.get('focus')
    return f && getHobby(f) ? f : null
  })
  const [view, setView] = useState<'map' | 'list'>('map')
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [fresh, setFresh] = useState(false)
  const map = useRef<HoleMapHandle>(null)
  const search = useRef<HTMLInputElement>(null)
  const mobile = useIsMobile()

  const verdicts = useCollector((s) => s.verdicts)
  const discovered = useCollector((s) => s.discovered)
  const trail = useCollector((s) => s.trail)
  const discover = useCollector((s) => s.discover)
  const pushTrail = useCollector((s) => s.pushTrail)
  const backTrail = useCollector((s) => s.backTrail)

  const statusOf = useCallback(
    (id: string): NodeStatus => {
      const v = verdicts[id]?.v
      if (v === 'into' || v === 'later') return v
      if (discovered[id] || v === 'nah') return 'seen'
      return 'new'
    },
    [verdicts, discovered],
  )

  // focusing a sticker discovers it, extends the trail and updates the URL
  const choose = useCallback(
    (id: string | null) => {
      setFocus(id)
      if (!id) return
      setView('map')
      setFresh(discover(id))
      pushTrail(id)
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('focus', id)
          return next
        },
        { replace: true },
      )
    },
    [discover, pushTrail, setParams],
  )

  // arriving with ?focus=… (e.g. from a dossier) counts as choosing it
  const arrived = useRef(false)
  useEffect(() => {
    if (arrived.current || !focus) return
    arrived.current = true
    discover(focus)
    pushTrail(focus)
  }, [focus, discover, pushTrail])

  const back = () => {
    const prev = backTrail()
    if (prev) setFocus(prev)
  }

  const results = useMemo(() => matches(query), [query])

  useHotkeys({
    '/': (e) => {
      e.preventDefault()
      setSearchOpen(true)
      requestAnimationFrame(() => search.current?.focus())
    },
    '+': () => map.current?.zoomBy(1.25),
    '=': () => map.current?.zoomBy(1.25),
    '-': () => map.current?.zoomBy(0.8),
    '0': () => map.current?.fit(),
    Escape: () => setFocus(null),
  })

  const count = Object.keys(discovered).length
  const inset =
    focus && view === 'map' ? (mobile ? { right: 0, bottom: Math.round(window.innerHeight * 0.48) } : { right: 420, bottom: 0 }) : { right: 0, bottom: 0 }

  return (
    <div className="space hole tone-dark">
      <div className="hole__bg" aria-hidden="true" />

      <header className="hole__head">
        <p className="label hole__kicker">Channel 03</p>
        <h1 className="display hole__title">The Rabbit Hole</h1>
        <p className="hole__stats mono">
          {hobbyCount} hobbies · {listConnections().length} strings
        </p>
        <div className="hole__progress" role="img" aria-label={`You've discovered ${count} of ${hobbyCount} hobbies`}>
          <span className="hole__track">
            <span className="hole__fill" style={{ width: `${(count / hobbyCount) * 100}%` }} />
          </span>
          <span className="pixel hole__progress-label">
            {count}/{hobbyCount} found
          </span>
        </div>
      </header>

      <div className="hole__tools">
        <div className={`hole__search ${searchOpen || query ? 'is-open' : ''}`}>
          <label htmlFor="hole-search" className="sr-only">
            Search hobbies
          </label>
          <Search size={17} strokeWidth={2.6} aria-hidden="true" className="hole__search-icon" />
          <input
            ref={search}
            id="hole-search"
            className="hole__search-input"
            placeholder="Search a hobby, vibe or category…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => window.setTimeout(() => setSearchOpen(false), 150)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && results[0]) {
                choose(results[0].id)
                setQuery('')
                search.current?.blur()
              }
              if (e.key === 'Escape') {
                setQuery('')
                search.current?.blur()
              }
            }}
            role="combobox"
            aria-expanded={searchOpen && !!query && view === 'map'}
            aria-controls="hole-results"
            autoComplete="off"
          />
          {searchOpen && query && view === 'map' && (
            <ul id="hole-results" className="hole__results" role="listbox">
              {results.slice(0, 6).map((h) => (
                <li key={h.id} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      choose(h.id)
                      setQuery('')
                    }}
                  >
                    <strong>{h.name}</strong> <span>{CATEGORY_BY_ID[h.category].label}</span>
                  </button>
                </li>
              ))}
              {!results.length && <li className="hole__noresult">Nothing by that name.</li>}
            </ul>
          )}
        </div>

        <div className="hole__view" role="radiogroup" aria-label="View">
          <Keycap
            role="radio"
            aria-checked={view === 'map'}
            on={C.butter}
            led={false}
            depth={5}
            radius={11}
            onClick={() => setView('map')}
            className="hole__viewkey"
          >
            <MapIcon size={16} strokeWidth={2.6} aria-hidden="true" /> <span>Map</span>
          </Keycap>
          <Keycap
            role="radio"
            aria-checked={view === 'list'}
            on={C.butter}
            led={false}
            depth={5}
            radius={11}
            onClick={() => setView('list')}
            className="hole__viewkey"
          >
            <List size={16} strokeWidth={2.6} aria-hidden="true" /> <span>List</span>
          </Keycap>
        </div>
      </div>

      {view === 'map' ? (
        <>
          <HoleMap ref={map} focus={focus} onFocus={choose} statusOf={statusOf} inset={inset} />
          <div className="hole__zoom" role="group" aria-label="Zoom">
            <Keycap led={false} depth={5} radius={11} onClick={() => map.current?.zoomBy(1.25)} aria-label="Zoom in (+)">
              <Plus size={18} strokeWidth={2.8} />
            </Keycap>
            <Keycap led={false} depth={5} radius={11} onClick={() => map.current?.zoomBy(0.8)} aria-label="Zoom out (−)">
              <Minus size={18} strokeWidth={2.8} />
            </Keycap>
            <Keycap led={false} depth={5} radius={11} onClick={() => map.current?.fit()} aria-label="Fit everything (0)">
              <Maximize2 size={16} strokeWidth={2.8} />
            </Keycap>
          </div>
          {!focus && (
            <div className="hole__pip" aria-hidden={trail.length > 0}>
              <Pip mood={count ? 'happy' : 'wow'} size={92} />
              <p className="hole__tip">
                <strong>Pick a sticker.</strong> Follow the strings. Drag things around — it’s fine, they bounce back.
              </p>
            </div>
          )}
          <div className="hole__legend mono" aria-hidden="true">
            <span>
              <i className="hole__key hole__key--into" /> into it
            </span>
            <span>
              <i className="hole__key hole__key--later" /> later
            </span>
            <span>
              <i className="hole__key hole__key--new" /> undiscovered
            </span>
          </div>
          {focus && <FieldNotes id={focus} fresh={fresh} trail={trail} onFollow={choose} onBack={back} onClose={() => setFocus(null)} />}
        </>
      ) : (
        <div className="hole__listwrap">
          <HoleList hobbies={results} statusOf={statusOf} onShowOnMap={choose} />
        </div>
      )}
    </div>
  )
}
