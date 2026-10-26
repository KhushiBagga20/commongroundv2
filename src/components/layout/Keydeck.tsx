import { useRef, type CSSProperties } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router'
import { useHotkeys } from '@/hooks/useHotkeys'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { setOriginFromElement } from '@/motion/origin'
import { SPACES, spaceFor } from './spaces'

/**
 * The Keydeck: five glossy keys on an ink chassis. The active space's key is
 * locked down with its LED lit. Keys 1–5 work from anywhere.
 */
export function Keydeck() {
  const location = useLocation()
  const navigate = useNavigate()
  const mobile = useIsMobile()
  const active = spaceFor(location.pathname)
  const refs = useRef<Record<string, HTMLAnchorElement | null>>({})

  const press = (i: number) => {
    const s = SPACES[i]
    const el = refs.current[s.id]
    if (!el) return
    el.classList.add('is-pressed')
    window.setTimeout(() => el.classList.remove('is-pressed'), 160)
    if (location.pathname === s.path) return
    setOriginFromElement(el)
    navigate(s.path)
  }

  useHotkeys({ '1': () => press(0), '2': () => press(1), '3': () => press(2), '4': () => press(3), '5': () => press(4) })

  return (
    <nav className="keydeck" aria-label="Spaces">
      <div className="keydeck__chassis">
        {!mobile && (
          <div className="keydeck__lcd lcd" aria-hidden="true">
            <span className="keydeck__lcd-ch">CH {active.no}</span>
            <span className="keydeck__lcd-name">{active.short}</span>
          </div>
        )}
        <ul className="keydeck__keys">
          {SPACES.map((s, i) => (
            <li key={s.id}>
              <NavLink
                ref={(el) => {
                  refs.current[s.id] = el
                }}
                to={s.path}
                end={s.path === '/'}
                className="keycap keydeck__key"
                style={{ '--cap-on': s.color, '--led': s.led } as CSSProperties}
                aria-label={`${s.name}: ${s.hint} Shortcut ${i + 1}.`}
                title={`${s.name} — ${s.hint} (${i + 1})`}
              >
                <span className="keycap__base" aria-hidden="true" />
                <span className="keycap__top">
                  <span className="keycap__meta" aria-hidden="true">
                    <span className="keycap__legend pixel">{i + 1}</span>
                    <span className="keycap__led" />
                  </span>
                  <s.Icon className="keydeck__icon" size={mobile ? 20 : 22} strokeWidth={2.4} aria-hidden="true" />
                  <span className="keydeck__label" aria-hidden="true">
                    {mobile ? s.short : s.name}
                  </span>
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
