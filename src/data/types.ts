/* Domain types. These are the contract a real backend would satisfy. */

export type CategoryId = 'look' | 'tinker' | 'noise' | 'make' | 'move' | 'taste' | 'wander' | 'think'

export type SwatchId = 'butter' | 'cobalt' | 'gum' | 'tang' | 'lav' | 'teal' | 'acid' | 'night' | 'paper'

export interface Swatch {
  id: SwatchId
  /** poster ground */
  bg: string
  /** text colour on the ground (only used for large type) */
  fg: string
  /** main illustration fill */
  main: string
  /** secondary illustration fill */
  alt: string
  tone: 'light' | 'dark'
}

export type Vibe = 'night-owl' | 'early-bird' | 'hands-on' | 'brainy' | 'outdoorsy' | 'homebody' | 'loud' | 'quiet' | 'solo' | 'squad'

export interface Category {
  id: CategoryId
  label: string
  blurb: string
  color: string
}

export interface Hobby {
  id: string
  /** poster number, printed as No. 07 */
  no: number
  name: string
  category: CategoryId
  swatch: SwatchId
  tagline: string
  description: string
  vibes: Vibe[]
  difficulty: 1 | 2 | 3 | 4 | 5
  cost: { tier: 0 | 1 | 2 | 3; label: string }
  time: string
  firstStep: string
  starterKit: string[]
  /** three slot-machine reels, read as one sentence */
  pitch: [string, string, string]
}

export interface Connection {
  a: string
  b: string
  because: string
}

export type Verdict = 'into' | 'later' | 'nah'

export type Origin = 'demo' | 'local'

export interface Person {
  id: string
  name: string
  handle: string
  bio: string
  into: string[]
  openToCollab: boolean
  lookingFor?: string
}

export type PatternId = 'dots' | 'stripes' | 'checks' | 'waves' | 'grid' | 'stars' | 'zigzag' | 'rings' | 'confetti'

export interface RoomIdentity {
  bg: string
  fg: string
  accent: string
  pattern: PatternId
  /** hobby whose illustration is the room's emblem */
  emblem: string
}

export interface Room {
  id: string
  name: string
  hobbyIds: string[]
  tagline: string
  about: string
  identity: RoomIdentity
  hostId: string
  memberIds: string[]
  /** demo population count shown on the door */
  memberCount: number
  founded: string
  rules: string[]
}

export interface Reply {
  id: string
  authorId: string
  body: string
  createdAt: string
  origin: Origin
}

export interface Thread {
  id: string
  roomId: string
  authorId: string
  title: string
  body: string
  tag: 'question' | 'show & tell' | 'idea' | 'help' | 'chat'
  createdAt: string
  replies: Reply[]
  origin: Origin
}

export interface ProjectCover {
  pattern: PatternId
  bg: string
  fg: string
  art: string
}

export interface Project {
  id: string
  roomId: string
  makerId: string
  title: string
  blurb: string
  cover: ProjectCover
  lookingForCollab: boolean
  createdAt: string
  origin: Origin
}

export interface Happening {
  id: string
  roomId: string
  title: string
  when: string
  where: string
  kind: 'online' | 'irl'
  blurb: string
  capacity: number
  going: number
}

export interface Quest {
  id: string
  roomId: string
  code: string
  title: string
  brief: string
}
