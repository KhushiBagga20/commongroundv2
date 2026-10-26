import { useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { Pencil, RotateCcw, Sparkles, Trash } from 'lucide-react'
import { Badge } from '@/art/Badge'
import { Pip } from '@/art/Pip'
import { PassCard } from '@/components/pass/PassCard'
import { DemoBadge } from '@/components/ui/bits'
import { InkButton } from '@/components/ui/InkButton'
import { Keycap } from '@/components/ui/Keycap'
import { Dialog } from '@/components/ui/Overlay'
import { ProjectCover } from '@/spaces/clubhouse/room/Projects'
import { ACHIEVEMENTS } from '@/data/achievements'
import { C } from '@/data/palette'
import { getRoom } from '@/data/repository'
import { longDate, pad } from '@/lib/format'
import { idsWith, useCollector } from '@/store/collector'
import { toast, useUI } from '@/store/ui'
import { IntoShelf } from './IntoShelf'
import { Clothesline, DiscoveryMap, Receipt, StampAlbum } from './Sections'
import { StickerLayer } from './StickerLayer'

/** Space 05 — a scrapbook of everything you've been curious about. */
export default function CollectionPage() {
  const page = useRef<HTMLDivElement>(null)
  const pass = useCollector((s) => s.pass)
  const verdicts = useCollector((s) => s.verdicts)
  const joined = useCollector((s) => s.joined)
  const quests = useCollector((s) => s.quests)
  const unlocked = useCollector((s) => s.unlocked)
  const localProjects = useCollector((s) => s.localProjects)
  const localThreads = useCollector((s) => s.localThreads)
  const resetStickers = useCollector((s) => s.resetStickers)
  const resetAll = useCollector((s) => s.resetAll)
  const openPass = useUI((s) => s.openPass)
  const [decorating, setDecorating] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const into = idsWith(verdicts, 'into')
  const later = idsWith(verdicts, 'later')
  const badges = Object.keys(unlocked).length
  const name = pass?.name ?? 'a curious human'

  return (
    <div ref={page} className="space coll paper-ground tone-light">
      <StickerLayer editing={decorating} container={page} />

      <header className="wrap coll__head">
        <div className="coll__titles">
          <p className="label coll__kicker">Channel 05 · Your scrapbook</p>
          <h1 className="display coll__title">
            The collection
            <span className="coll__of">of {name}</span>
          </h1>
          <p className="lede">Everything you’ve been curious about, taped in as you go. Flip cards to write notes; it all saves in this browser.</p>
          <div className="coll__tools">
            <Keycap
              aria-pressed={decorating}
              on={C.bubblegum}
              led={C.acid}
              depth={6}
              radius={12}
              className="coll__tool"
              onClick={() => setDecorating((d) => !d)}
            >
              <Sparkles size={16} strokeWidth={2.6} aria-hidden="true" /> <span>{decorating ? 'Done decorating' : 'Decorate'}</span>
            </Keycap>
            {decorating && (
              <button type="button" className="text-btn" onClick={resetStickers}>
                <RotateCcw size={14} strokeWidth={2.6} aria-hidden="true" /> Reset stickers
              </button>
            )}
          </div>
          {decorating && <p className="coll__hint mono">Decorating: drag the stickers anywhere on the page. They stay put when you’re done.</p>}
        </div>
        <div className="coll__pass">
          {pass ? (
            <PassCard
              pass={pass}
              stats={[
                { label: 'Into', value: into.length },
                { label: 'Rooms', value: Object.keys(joined).length },
                { label: 'Quests', value: Object.keys(quests).length },
                { label: 'Badges', value: badges },
              ]}
            />
          ) : (
            <div className="coll__nopass">
              <Pip mood="wink" size={96} />
              <p>No pass yet. Make one so this scrapbook has your name on it.</p>
            </div>
          )}
          <InkButton size="sm" face={C.paper} onClick={() => openPass()}>
            <Pencil size={14} strokeWidth={2.6} aria-hidden="true" /> {pass ? 'Edit pass' : 'Get your pass'}
          </InkButton>
        </div>
      </header>

      <section className="coll__page coll__page--into" aria-labelledby="into-title">
        <div className="wrap">
          <h2 id="into-title" className="coll__h display">
            Into it <span className="pixel coll__count">{pad(into.length)}</span>
          </h2>
          <IntoShelf ids={into} />
        </div>
      </section>

      <section className="coll__page coll__page--later" aria-labelledby="later-title">
        <div className="wrap">
          <h2 id="later-title" className="coll__h display">
            Saved for later <span className="pixel coll__count">{pad(later.length)}</span>
          </h2>
        </div>
        <Clothesline ids={later} />
      </section>

      <section className="coll__page coll__page--stamps" aria-labelledby="stamps-title">
        <div className="wrap">
          <h2 id="stamps-title" className="coll__h display">
            Passport stamps <span className="pixel coll__count">{pad(Object.keys(joined).length)}</span>
          </h2>
          <StampAlbum joined={joined} />
        </div>
      </section>

      <section className="coll__page coll__page--made" aria-label="Activity and things you made">
        <div className="wrap coll__two">
          <div>
            <h2 className="coll__h display">Receipts</h2>
            <Receipt />
          </div>
          <div>
            <h2 className="coll__h display">Things you made</h2>
            {localProjects.length || localThreads.length ? (
              <ul className="made">
                {localProjects.map((p) => (
                  <li key={p.id} className="made__item">
                    <ProjectCover cover={p.cover} className="made__cover" />
                    <div>
                      <strong>{p.title}</strong>
                      <span className="mono">
                        Pinned in <Link to={`/clubhouse/${p.roomId}`}>{getRoom(p.roomId)?.name}</Link> · {longDate(p.createdAt)}
                      </span>
                    </div>
                  </li>
                ))}
                {localThreads.map((t) => (
                  <li key={t.id} className="made__item made__item--thread">
                    <span className="made__icon pixel">✎</span>
                    <div>
                      <strong>{t.title}</strong>
                      <span className="mono">
                        Thread in <Link to={`/clubhouse/${t.roomId}`}>{getRoom(t.roomId)?.name}</Link>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="made__empty">Pin a project or start a thread in a room and it shows up here.</p>
            )}
            <DemoBadge>Your posts are only visible to you</DemoBadge>
          </div>
        </div>
      </section>

      <section className="coll__page coll__page--badges tone-dark" aria-labelledby="badges-title">
        <div className="wrap">
          <h2 id="badges-title" className="coll__h display">
            Badge cabinet{' '}
            <span className="pixel coll__count">
              {pad(badges)}/{ACHIEVEMENTS.length}
            </span>
          </h2>
          <ul className="badges">
            {ACHIEVEMENTS.map((a) => {
              const at = unlocked[a.id]
              return (
                <li key={a.id} className={at ? 'badge is-earned' : 'badge'} style={{ '--bc': a.color } as CSSProperties}>
                  <Badge shape={a.shape} color={a.color} glyph={a.glyph} earned={!!at} size={92} />
                  <p className="badge__name">{at || !a.secret ? a.name : 'A secret'}</p>
                  <p className="badge__hint">{at ? `Earned ${longDate(at)}` : a.hint}</p>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className="coll__page coll__page--end" aria-label="Discovery and data">
        <div className="wrap coll__two">
          <DiscoveryMap />
          <div className="coll__data">
            <h2 className="label">Your data</h2>
            <p>Everything here lives in this browser’s local storage. Nothing is uploaded. Clearing it starts you fresh.</p>
            <button type="button" className="ink-btn ink-btn--sm" style={{ '--face': C.tangerine } as CSSProperties} onClick={() => setConfirm(true)}>
              <Trash size={14} strokeWidth={2.6} aria-hidden="true" /> Clear everything
            </button>
          </div>
        </div>
      </section>

      <Dialog open={confirm} onClose={() => setConfirm(false)} label="Clear everything?" className="confirm">
        <Pip mood="confused" size={90} />
        <h2 className="display confirm__title">Clear everything?</h2>
        <p>Your pass, swipes, notes, rooms, quests, posts, stickers and badges will be wiped from this browser. This can’t be undone.</p>
        <div className="confirm__actions">
          <button type="button" className="ink-btn" onClick={() => setConfirm(false)} data-autofocus>
            Keep it all
          </button>
          <button
            type="button"
            className="ink-btn"
            style={{ '--face': C.tangerine } as CSSProperties}
            onClick={() => {
              resetAll()
              setConfirm(false)
              toast({ title: 'Fresh start', body: 'Your collection is empty again.', tone: 'ink' })
            }}
          >
            <Trash size={15} strokeWidth={2.6} aria-hidden="true" /> Yes, clear it
          </button>
        </div>
      </Dialog>
    </div>
  )
}
