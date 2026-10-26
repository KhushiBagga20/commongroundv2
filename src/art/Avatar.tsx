import { memo, useId } from 'react'
import { C } from '@/data/palette'
import { pick, seeded } from '@/lib/random'

const GROUNDS = [C.butter, C.bubblegum, C.acid, C.lavender, C.tangerine, C.electric, C.paper, C.teal]
const HEADS = [C.paper, C.butter, C.lavender, C.bubblegum, C.acid, C.tangerine, '#FFB38A', '#9FD4FF']

/**
 * A deterministic little face for a person, generated from a seed. Stylised on
 * purpose (neon heads, no realistic features) so it reads as illustration.
 */
export const Avatar = memo(function Avatar({ seed, size = 44, ring }: { seed: string; size?: number; ring?: string }) {
  const uid = useId().replace(/:/g, '')
  const r = seeded(seed)
  const bg = pick(GROUNDS, r)
  const head = pick(
    HEADS.filter((h) => h !== bg),
    r,
  )
  const shape = Math.floor(r() * 4)
  const eyes = Math.floor(r() * 5)
  const mouth = Math.floor(r() * 5)
  const hair = Math.floor(r() * 6)
  const cheeks = r() > 0.4
  const tilt = (r() - 0.5) * 10
  const ink = C.ink
  const s = { stroke: ink, strokeWidth: 2.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" className="avatar">
      <defs>
        <clipPath id={`a${uid}`}>
          <circle cx="24" cy="24" r="22.5" />
        </clipPath>
      </defs>
      <g clipPath={`url(#a${uid})`}>
        <rect width="48" height="48" fill={bg} />
        <g transform={`rotate(${tilt} 24 30)`}>
          {/* hair behind */}
          {hair === 1 && <circle cx="24" cy="12" r="6" fill={ink} />}
          {/* head */}
          {shape === 0 && <circle cx="24" cy="28" r="14" fill={head} {...s} />}
          {shape === 1 && <rect x="10" y="14" width="28" height="30" rx="11" fill={head} {...s} />}
          {shape === 2 && <path d="M10 30 c0 -12 6 -18 14 -18 s14 6 14 18 s-6 16 -14 16 s-14 -4 -14 -16 z" fill={head} {...s} />}
          {shape === 3 && <ellipse cx="24" cy="30" rx="12" ry="16" fill={head} {...s} />}
          {/* hair / hats */}
          {hair === 2 && <path d="M10 26 c0 -12 6 -16 14 -16 s14 4 14 16 c-6 -4 -10 -6 -14 -6 s-8 2 -14 6 z" fill={ink} />}
          {hair === 3 && (
            <>
              <path d="M11 22 h26 v-4 a13 13 0 0 0 -26 0 z" fill={C.tangerine} {...s} />
              <circle cx="24" cy="5" r="3.5" fill={C.paper} {...s} />
            </>
          )}
          {hair === 4 && <path d="M15 17 l3 -7 l3 6 l3 -8 l3 8 l3 -6 l3 7" fill="none" {...s} />}
          {hair === 5 && <path d="M18 15 q6 -8 12 0" fill="none" {...s} strokeWidth={3.2} />}
          {/* eyes */}
          {eyes === 0 && (
            <g fill={ink}>
              <circle cx="19" cy="27" r="2" />
              <circle cx="29" cy="27" r="2" />
            </g>
          )}
          {eyes === 1 && (
            <g>
              <circle cx="19" cy="27" r="3.6" fill={C.paper} {...s} strokeWidth={1.8} />
              <circle cx="29" cy="27" r="3.6" fill={C.paper} {...s} strokeWidth={1.8} />
              <circle cx="19.6" cy="27.6" r="1.6" fill={ink} />
              <circle cx="29.6" cy="27.6" r="1.6" fill={ink} />
            </g>
          )}
          {eyes === 2 && (
            <g fill="none" {...s}>
              <path d="M16.5 28 q2.5 -3 5 0" />
              <path d="M26.5 28 q2.5 -3 5 0" />
            </g>
          )}
          {eyes === 3 && (
            <g fill="none" {...s} strokeWidth={2}>
              <circle cx="19" cy="27" r="4.4" />
              <circle cx="29" cy="27" r="4.4" />
              <path d="M23.4 27 h1.2" />
              <circle cx="19" cy="27" r="1.4" fill={ink} />
              <circle cx="29" cy="27" r="1.4" fill={ink} />
            </g>
          )}
          {eyes === 4 && (
            <g {...s}>
              <path d="M16.5 27 h5 M26.5 27 h5" />
            </g>
          )}
          {cheeks && (
            <g fill={C.bubblegum} opacity={0.8}>
              <ellipse cx="15" cy="33" rx="2.6" ry="1.8" />
              <ellipse cx="33" cy="33" rx="2.6" ry="1.8" />
            </g>
          )}
          {/* mouth */}
          {mouth === 0 && <path d="M20 34 q4 4 8 0" fill="none" {...s} />}
          {mouth === 1 && <path d="M19 33 q5 7 10 0 z" fill={ink} {...s} strokeWidth={1.6} />}
          {mouth === 2 && <ellipse cx="24" cy="35" rx="2" ry="2.6" fill={ink} />}
          {mouth === 3 && <path d="M20.5 35 h7" fill="none" {...s} />}
          {mouth === 4 && (
            <g>
              <path d="M20 34 q4 4 8 0" fill="none" {...s} />
              <path d="M25 35.5 q1.5 3 3 0" fill={C.bubblegum} {...s} strokeWidth={1.4} />
            </g>
          )}
        </g>
      </g>
      <circle cx="24" cy="24" r="22.5" fill="none" stroke={ring ?? ink} strokeWidth="2.5" />
    </svg>
  )
})
