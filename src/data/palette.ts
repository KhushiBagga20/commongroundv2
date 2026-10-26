import type { Category, CategoryId, Swatch, SwatchId } from './types'

/** The brand palette, mirrored from styles/tokens.css for SVG and inline use. */
export const C = {
  ink: '#17172B',
  inkDeep: '#0E0E1C',
  inkSoft: '#2B2B45',
  butter: '#FFDE70',
  electric: '#1677E8',
  electricDeep: '#0B57B8',
  acid: '#B5FF5C',
  bubblegum: '#FF70BB',
  tangerine: '#FF7148',
  lavender: '#B6A0FF',
  teal: '#154D50',
  paper: '#FFF6DC',
  paperShade: '#F3E6C0',
  white: '#FFFDF6',
} as const

export const SWATCHES: Record<SwatchId, Swatch> = {
  butter: { id: 'butter', bg: C.butter, fg: C.ink, main: C.electric, alt: C.bubblegum, tone: 'light' },
  cobalt: { id: 'cobalt', bg: C.electric, fg: C.paper, main: C.butter, alt: C.tangerine, tone: 'dark' },
  gum: { id: 'gum', bg: C.bubblegum, fg: C.ink, main: C.butter, alt: C.electric, tone: 'light' },
  tang: { id: 'tang', bg: C.tangerine, fg: C.ink, main: C.lavender, alt: C.butter, tone: 'light' },
  lav: { id: 'lav', bg: C.lavender, fg: C.ink, main: C.acid, alt: C.tangerine, tone: 'light' },
  teal: { id: 'teal', bg: C.teal, fg: C.paper, main: C.tangerine, alt: C.butter, tone: 'dark' },
  acid: { id: 'acid', bg: C.acid, fg: C.ink, main: C.bubblegum, alt: C.electric, tone: 'light' },
  night: { id: 'night', bg: C.ink, fg: C.paper, main: C.acid, alt: C.bubblegum, tone: 'dark' },
  paper: { id: 'paper', bg: C.paper, fg: C.ink, main: C.tangerine, alt: C.electric, tone: 'light' },
}

export const CATEGORIES: Category[] = [
  { id: 'look', label: 'Look', blurb: 'Things you make for eyes', color: C.electric },
  { id: 'tinker', label: 'Tinker', blurb: 'Build it, break it, bodge it', color: C.acid },
  { id: 'noise', label: 'Noise', blurb: 'Make the air do something', color: C.bubblegum },
  { id: 'make', label: 'Make', blurb: 'Hands first, plans later', color: C.tangerine },
  { id: 'move', label: 'Move', blurb: 'Your body, but fun', color: C.lavender },
  { id: 'taste', label: 'Taste', blurb: 'Edible experiments', color: C.butter },
  { id: 'wander', label: 'Wander', blurb: 'Go outside (on purpose)', color: '#3FB6A8' },
  { id: 'think', label: 'Think', blurb: 'Puzzles, words, worlds', color: C.paper },
]

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, Category>

export const VIBE_LABELS = {
  'night-owl': 'Night owl',
  'early-bird': 'Early bird',
  'hands-on': 'Hands-on',
  brainy: 'Brainy',
  outdoorsy: 'Outdoorsy',
  homebody: 'Homebody',
  loud: 'Loud',
  quiet: 'Quiet',
  solo: 'Solo-friendly',
  squad: 'Better with a squad',
} as const

/** Signal colours a visitor can pick for their pass. */
export const SIGNALS = [
  { id: 'butter', label: 'Butter', color: C.butter },
  { id: 'electric', label: 'Electric', color: C.electric },
  { id: 'acid', label: 'Acid', color: C.acid },
  { id: 'bubblegum', label: 'Bubblegum', color: C.bubblegum },
  { id: 'tangerine', label: 'Tangerine', color: C.tangerine },
  { id: 'lavender', label: 'Lavender', color: C.lavender },
] as const

export type SignalId = (typeof SIGNALS)[number]['id']
