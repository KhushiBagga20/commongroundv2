import { useRef, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { ArrowRight, Users } from 'lucide-react'
import { HobbyArt } from '@/art/HobbyArt'
import { getHobby, listRooms } from '@/data/repository'
import { gsap, useGsap } from '@/hooks/useGsap'
import { isCalm } from '@/motion/calm'
import { alpha, patternCSS } from '@/lib/patterns'

/**
 * A horizontal gallery of room postcards. On wide screens vertical scroll
 * drives it sideways (no hijacking — the scroll distance is the same); on
 * narrow screens it's a native swipeable row.
 */
export function RoomsReel() {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const rooms = listRooms()

  useGsap(root, () => {
    const mm = gsap.matchMedia()
    mm.add('(min-width: 900px)', () => {
      const t = track.current
      const section = root.current
      if (!t || !section || isCalm()) return
      const distance = () => Math.max(0, t.scrollWidth - window.innerWidth + 48)
      const setHeight = () => {
        section.style.height = `${window.innerHeight + distance()}px`
      }
      setHeight()
      const tween = gsap.to(t, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.5, invalidateOnRefresh: true, onRefreshInit: setHeight },
      })
      gsap.utils.toArray<HTMLElement>('.reel__card').forEach((card, i) => {
        gsap.fromTo(
          card,
          { rotate: i % 2 ? 4 : -4 },
          { rotate: i % 2 ? -3 : 3, ease: 'none', scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 1 } },
        )
      })
      return () => {
        tween.kill()
        section.style.height = ''
      }
    })
    return () => mm.revert()
  })

  return (
    <section ref={root} className="reel tone-dark" aria-labelledby="reel-title">
      <div className="reel__sticky">
        <header className="reel__head wrap">
          <h2 id="reel-title" className="section-title reel__title">
            Every hobby
            <br />
            has a room.
          </h2>
          <p className="lede reel__lede">Eleven rooms, each with its own weather. Walk the hallway, peek inside, and stay where it feels like your people.</p>
        </header>
        <div className="reel__viewport scroll-x">
          <div ref={track} className="reel__track">
            {rooms.map((r) => {
              const emblem = getHobby(r.identity.emblem)!
              return (
                <Link
                  key={r.id}
                  to={`/clubhouse/${r.id}`}
                  className="reel__card"
                  data-cursor="enter"
                  style={
                    {
                      '--rb': r.identity.bg,
                      '--rf': r.identity.fg,
                      '--ra': r.identity.accent,
                      ...patternCSS(r.identity.pattern, alpha(r.identity.fg, 0.12)),
                    } as CSSProperties
                  }
                >
                  <span className="pixel reel__no">Room {String(rooms.indexOf(r) + 1).padStart(2, '0')}</span>
                  <HobbyArt id={emblem.id} swatch={emblem.swatch} className="reel__art" mood="happy" />
                  <span className="display reel__name">{r.name.replace(/^The /, '')}</span>
                  <span className="reel__tag">{r.tagline}</span>
                  <span className="reel__foot">
                    <span className="reel__count">
                      <Users size={14} strokeWidth={2.6} aria-hidden="true" /> {r.memberCount} members <span className="reel__demo">(demo)</span>
                    </span>
                    <ArrowRight size={18} strokeWidth={2.8} aria-hidden="true" />
                  </span>
                </Link>
              )
            })}
            <Link to="/clubhouse" className="reel__card reel__card--all" data-cursor="enter">
              <span className="display reel__name">See the whole hallway</span>
              <ArrowRight size={40} strokeWidth={2.6} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
