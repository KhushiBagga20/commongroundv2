import { useEffect } from 'react'
import { Link } from 'react-router'
import { ArrowRight, DoorOpen, Waypoints } from 'lucide-react'
import { HalftoneDisc } from '@/art/HalftoneDisc'
import { HobbyArt } from '@/art/HobbyArt'
import { C, VIBE_LABELS } from '@/data/palette'
import { categoryOf, getHobby, neighbours, roomsForHobby, swatchOf } from '@/data/repository'
import { useDossier } from '@/hooks/useDossier'
import { pad } from '@/lib/format'
import { alpha } from '@/lib/patterns'
import { useCollector } from '@/store/collector'
import { CostTier, DifficultyMeter } from '../ui/bits'
import { Sheet } from '../ui/Overlay'
import { posterVars } from './HobbyPoster'
import { VerdictKeys } from './VerdictKeys'

/** Full detail for a hobby, available from every space via ?h=<id>. */
export function HobbyDossier() {
  const { current, open, close } = useDossier()
  const hobby = current ? getHobby(current) : undefined
  const discover = useCollector((s) => s.discover)

  useEffect(() => {
    if (hobby) discover(hobby.id)
  }, [hobby, discover])

  return (
    <Sheet open={!!hobby} onClose={close} label={hobby ? `${hobby.name} dossier` : 'Hobby dossier'} width={540}>
      {hobby && <DossierBody id={hobby.id} onOpen={open} />}
    </Sheet>
  )
}

function DossierBody({ id, onOpen }: { id: string; onOpen: (id: string) => void }) {
  const h = getHobby(id)!
  const sw = swatchOf(h)
  const cat = categoryOf(h)
  const links = neighbours(h.id)
  const rooms = roomsForHobby(h.id)

  return (
    <div className="dossier" style={posterVars(h)}>
      <header className={sw.tone === 'dark' ? 'dossier__head tone-dark' : 'dossier__head'}>
        <HalftoneDisc color={sw.tone === 'dark' ? alpha(C.paper, 0.2) : alpha(C.ink, 0.18)} className="dossier__sun" />
        <HobbyArt id={h.id} swatch={h.swatch} mood="happy" className="dossier__art" />
        <div className="dossier__titles">
          <p className="pixel dossier__no">
            No.{pad(h.no)} · {cat.label}
          </p>
          <h2 className="display dossier__name">{h.name}</h2>
          <p className="dossier__tagline">{h.tagline}</p>
        </div>
      </header>

      <div className="dossier__content">
        <VerdictKeys hobbyId={h.id} />

        <p className="dossier__desc">{h.description}</p>

        <dl className="dossier__facts">
          <div>
            <dt className="label">Difficulty</dt>
            <dd>
              <DifficultyMeter level={h.difficulty} />
            </dd>
          </div>
          <div>
            <dt className="label">To start</dt>
            <dd>
              <CostTier tier={h.cost.tier} /> {h.cost.label}
            </dd>
          </div>
          <div>
            <dt className="label">Time</dt>
            <dd>{h.time}</dd>
          </div>
          <div>
            <dt className="label">Vibe</dt>
            <dd className="dossier__vibes">
              {h.vibes.map((v) => (
                <span key={v} className="chip">
                  {VIBE_LABELS[v]}
                </span>
              ))}
            </dd>
          </div>
        </dl>

        <section className="dossier__first">
          <h3 className="label">Your first step</h3>
          <p>{h.firstStep}</p>
        </section>

        <section>
          <h3 className="dossier__h">Starter kit</h3>
          <ul className="dossier__kit">
            {h.starterKit.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
        </section>

        <section>
          <div className="dossier__row-head">
            <h3 className="dossier__h">Leads to…</h3>
            <Link to={`/rabbit-hole?focus=${h.id}`} className="dossier__more">
              <Waypoints size={15} strokeWidth={2.6} aria-hidden="true" /> See it on the map
            </Link>
          </div>
          <ul className="dossier__links">
            {links.map((l) => (
              <li key={l.hobby.id}>
                <button type="button" className="dossier__link" onClick={() => onOpen(l.hobby.id)}>
                  <HobbyArt id={l.hobby.id} swatch={l.hobby.swatch} className="dossier__linkart" />
                  <span>
                    <strong>{l.hobby.name}</strong>
                    <em>{l.because}</em>
                  </span>
                  <ArrowRight size={16} strokeWidth={2.6} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>

        {rooms.length > 0 && (
          <section>
            <h3 className="dossier__h">Rooms for this</h3>
            <ul className="dossier__rooms">
              {rooms.map((r) => (
                <li key={r.id}>
                  <Link to={`/clubhouse/${r.id}`} className="dossier__room" style={{ background: r.identity.bg, color: r.identity.fg }}>
                    <DoorOpen size={16} strokeWidth={2.6} aria-hidden="true" />
                    <span>{r.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
