/**
 * The only door into catalogue data. Components never import raw data files.
 * To connect a backend, replace these functions with fetchers (and wrap the
 * call sites in a query cache); the return shapes are the contract.
 */
import { CONNECTIONS } from './connections'
import { HOBBIES } from './hobbies'
import { CATEGORY_BY_ID, SWATCHES } from './palette'
import { PEOPLE } from './people'
import { RAW_HAPPENINGS, RAW_PROJECTS, RAW_QUESTS, RAW_THREADS, ROOMS } from './rooms'
import type { CategoryId, Connection, Happening, Hobby, Person, Project, Quest, Room, Swatch, Thread } from './types'

const HOUR = 3_600_000
const DAY = 24 * HOUR
/** Demo timeline anchor: everything is relative to when the app booted. */
const NOW = Date.now()

const hobbyById = new Map(HOBBIES.map((h) => [h.id, h]))
const roomById = new Map(ROOMS.map((r) => [r.id, r]))
const personById = new Map(PEOPLE.map((p) => [p.id, p]))

// ── hobbies ───────────────────────────────────────────────────────────────
export const listHobbies = (): Hobby[] => HOBBIES
export const getHobby = (id: string): Hobby | undefined => hobbyById.get(id)
export const hobbyCount = HOBBIES.length
export const swatchOf = (h: Hobby): Swatch => SWATCHES[h.swatch]
export const categoryOf = (h: Hobby) => CATEGORY_BY_ID[h.category]
export const hobbiesIn = (category: CategoryId | 'all'): Hobby[] => (category === 'all' ? HOBBIES : HOBBIES.filter((h) => h.category === category))

// ── connections ───────────────────────────────────────────────────────────
export const listConnections = (): Connection[] => CONNECTIONS

const adjacency = new Map<string, { id: string; because: string }[]>()
for (const c of CONNECTIONS) {
  if (!adjacency.has(c.a)) adjacency.set(c.a, [])
  if (!adjacency.has(c.b)) adjacency.set(c.b, [])
  adjacency.get(c.a)!.push({ id: c.b, because: c.because })
  adjacency.get(c.b)!.push({ id: c.a, because: c.because })
}

export function neighbours(id: string): { hobby: Hobby; because: string }[] {
  return (adjacency.get(id) ?? []).map((n) => ({ hobby: hobbyById.get(n.id)!, because: n.because })).filter((n) => n.hobby)
}

// ── people ────────────────────────────────────────────────────────────────
export const getPerson = (id: string): Person | undefined => personById.get(id)

// ── rooms ─────────────────────────────────────────────────────────────────
export const listRooms = (): Room[] => ROOMS
export const getRoom = (id: string): Room | undefined => roomById.get(id)
export const roomsForHobby = (hobbyId: string): Room[] => ROOMS.filter((r) => r.hobbyIds.includes(hobbyId))

/** Rooms ranked by overlap with the hobbies a visitor is into. */
export function recommendRooms(intoIds: string[]): { room: Room; matches: Hobby[] }[] {
  const into = new Set(intoIds)
  return ROOMS.map((room) => ({
    room,
    matches: room.hobbyIds.filter((h) => into.has(h)).map((h) => hobbyById.get(h)!),
  }))
    .filter((r) => r.matches.length > 0)
    .sort((a, b) => b.matches.length - a.matches.length || b.room.memberCount - a.room.memberCount)
}

const THREADS: Thread[] = RAW_THREADS.map((t) => {
  const created = NOW - t.hoursAgo * HOUR
  return {
    id: t.id,
    roomId: t.roomId,
    authorId: t.authorId,
    title: t.title,
    body: t.body,
    tag: t.tag,
    createdAt: new Date(created).toISOString(),
    origin: 'demo',
    replies: t.replies.map(([authorId, body], i) => ({
      id: `${t.id}-r${i}`,
      authorId,
      body,
      createdAt: new Date(Math.min(NOW - 60_000, created + (i + 1) * 0.6 * HOUR)).toISOString(),
      origin: 'demo',
    })),
  }
})

const PROJECTS: Project[] = RAW_PROJECTS.map((p) => ({
  id: p.id,
  roomId: p.roomId,
  makerId: p.makerId,
  title: p.title,
  blurb: p.blurb,
  cover: p.cover,
  lookingForCollab: p.lookingForCollab,
  createdAt: new Date(NOW - p.daysAgo * DAY).toISOString(),
  origin: 'demo',
}))

function startOfToday() {
  const d = new Date(NOW)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

const HAPPENINGS: Happening[] = RAW_HAPPENINGS.map((h) => ({
  id: h.id,
  roomId: h.roomId,
  title: h.title,
  when: new Date(startOfToday() + h.inDays * DAY + h.hour * HOUR).toISOString(),
  where: h.where,
  kind: h.kind,
  blurb: h.blurb,
  capacity: h.capacity,
  going: h.going,
}))

const QUESTS: Quest[] = RAW_QUESTS

export const threadsForRoom = (roomId: string): Thread[] => THREADS.filter((t) => t.roomId === roomId)
export const projectsForRoom = (roomId: string): Project[] => PROJECTS.filter((p) => p.roomId === roomId)
export const happeningsForRoom = (roomId: string): Happening[] => HAPPENINGS.filter((h) => h.roomId === roomId).sort((a, b) => a.when.localeCompare(b.when))
export const questForRoom = (roomId: string): Quest | undefined => QUESTS.find((q) => q.roomId === roomId)
export const getQuest = (id: string): Quest | undefined => QUESTS.find((q) => q.id === id)
export const getHappening = (id: string): Happening | undefined => HAPPENINGS.find((h) => h.id === id)
export const listQuests = (): Quest[] => QUESTS
