import { C } from './palette'

/** What an achievement can look at. A narrow, serialisable snapshot of collector state. */
export interface AchievementSnapshot {
  into: number
  later: number
  nah: number
  swipes: number
  undos: number
  discovered: number
  totalHobbies: number
  joined: number
  quests: number
  rsvps: number
  posts: number
  projects: number
  secrets: Record<string, number>
}

export type BadgeShape = 'burst' | 'hex' | 'circle' | 'shield' | 'flower' | 'ticket'

export interface Achievement {
  id: string
  name: string
  hint: string
  color: string
  shape: BadgeShape
  glyph: string
  secret?: boolean
  test: (s: AchievementSnapshot) => boolean
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-spark', name: 'First Spark', hint: 'Swipe right on your first hobby.', color: C.butter, shape: 'burst', glyph: '01', test: (s) => s.into >= 1 },
  { id: 'deck-diver', name: 'Deck Diver', hint: 'Swipe through 15 cards.', color: C.electric, shape: 'hex', glyph: '15', test: (s) => s.swipes >= 15 },
  {
    id: 'picky',
    name: 'Professionally Picky',
    hint: 'Skip 10 hobbies. Standards!',
    color: C.tangerine,
    shape: 'shield',
    glyph: 'NO',
    test: (s) => s.nah >= 10,
  },
  { id: 'magpie', name: 'Magpie', hint: 'Save 5 hobbies for later.', color: C.lavender, shape: 'flower', glyph: 'LTR', test: (s) => s.later >= 5 },
  { id: 'second-thoughts', name: 'Second Thoughts', hint: 'Undo three swipes.', color: C.bubblegum, shape: 'circle', glyph: '↶', test: (s) => s.undos >= 3 },
  {
    id: 'spelunker',
    name: 'Spelunker',
    hint: 'Discover 10 hobbies in the Rabbit Hole.',
    color: C.acid,
    shape: 'hex',
    glyph: '10',
    test: (s) => s.discovered >= 10,
  },
  {
    id: 'cartographer',
    name: 'Cartographer',
    hint: 'Discover every hobby on the map.',
    color: C.butter,
    shape: 'burst',
    glyph: 'ALL',
    test: (s) => s.discovered >= s.totalHobbies,
  },
  { id: 'door-knocker', name: 'Door Knocker', hint: 'Join your first room.', color: C.tangerine, shape: 'ticket', glyph: 'IN', test: (s) => s.joined >= 1 },
  { id: 'regular', name: 'The Regular', hint: 'Be a member of three rooms.', color: C.electric, shape: 'shield', glyph: '3×', test: (s) => s.joined >= 3 },
  { id: 'questing', name: 'Side Quester', hint: 'Complete a room quest.', color: C.acid, shape: 'flower', glyph: 'Q', test: (s) => s.quests >= 1 },
  { id: 'plus-one', name: 'Plus One', hint: 'Say you’re going to a happening.', color: C.lavender, shape: 'ticket', glyph: 'GO', test: (s) => s.rsvps >= 1 },
  {
    id: 'first-words',
    name: 'First Words',
    hint: 'Start a thread or reply in a room.',
    color: C.bubblegum,
    shape: 'circle',
    glyph: 'HI',
    test: (s) => s.posts >= 1,
  },
  {
    id: 'maker',
    name: 'Show-Off (Affectionate)',
    hint: 'Pin a project in a room.',
    color: C.tangerine,
    shape: 'burst',
    glyph: 'PIN',
    test: (s) => s.projects >= 1,
  },
  // secrets — hints stay vague on purpose
  {
    id: 'konami',
    name: 'Up Up Down Down',
    hint: 'An old cheat code still works here.',
    color: C.acid,
    shape: 'hex',
    glyph: '↑↑',
    secret: true,
    test: (s) => !!s.secrets.konami,
  },
  {
    id: 'pip-poker',
    name: "Don't Poke the Pip",
    hint: 'Pip is ticklish.',
    color: C.butter,
    shape: 'flower',
    glyph: '!?',
    secret: true,
    test: (s) => !!s.secrets['pip-poker'],
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    hint: 'Visit when the rest of the world is asleep.',
    color: C.lavender,
    shape: 'circle',
    glyph: '3AM',
    secret: true,
    test: (s) => !!s.secrets['night-owl'],
  },
  {
    id: 'say-it',
    name: 'Say It Out Loud',
    hint: 'Type the magic word anywhere.',
    color: C.bubblegum,
    shape: 'burst',
    glyph: 'W!',
    secret: true,
    test: (s) => !!s.secrets['say-it'],
  },
]

export function evaluateAchievements(s: AchievementSnapshot): string[] {
  return ACHIEVEMENTS.filter((a) => a.test(s)).map((a) => a.id)
}
