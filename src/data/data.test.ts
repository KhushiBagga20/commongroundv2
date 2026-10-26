import { describe, expect, it } from 'vitest'
import { hasArt } from '@/art/HobbyArt'
import { ACHIEVEMENTS } from './achievements'
import { CONNECTIONS } from './connections'
import { HOBBIES } from './hobbies'
import { CATEGORIES, SWATCHES } from './palette'
import { PEOPLE } from './people'
import { neighbours, recommendRooms } from './repository'
import { RAW_HAPPENINGS, RAW_PROJECTS, RAW_QUESTS, RAW_THREADS, ROOMS } from './rooms'

const hobbyIds = new Set(HOBBIES.map((h) => h.id))
const personIds = new Set(PEOPLE.map((p) => p.id))
const roomIds = new Set(ROOMS.map((r) => r.id))

describe('catalogue integrity', () => {
  it('has unique hobby ids and poster numbers', () => {
    expect(hobbyIds.size).toBe(HOBBIES.length)
    expect(new Set(HOBBIES.map((h) => h.no)).size).toBe(HOBBIES.length)
  })

  it('gives every hobby a real category, swatch and illustration', () => {
    const cats = new Set(CATEGORIES.map((c) => c.id))
    for (const h of HOBBIES) {
      expect(cats.has(h.category), h.id).toBe(true)
      expect(SWATCHES[h.swatch], h.id).toBeDefined()
      expect(hasArt(h.id), `${h.id} needs an illustration`).toBe(true)
      expect(h.pitch).toHaveLength(3)
      expect(h.difficulty).toBeGreaterThanOrEqual(1)
      expect(h.difficulty).toBeLessThanOrEqual(5)
    }
  })

  it('only connects hobbies that exist, without duplicates or self-loops', () => {
    const seen = new Set<string>()
    for (const c of CONNECTIONS) {
      expect(hobbyIds.has(c.a), c.a).toBe(true)
      expect(hobbyIds.has(c.b), c.b).toBe(true)
      expect(c.a).not.toBe(c.b)
      const key = [c.a, c.b].sort().join('|')
      expect(seen.has(key), `duplicate edge ${key}`).toBe(false)
      seen.add(key)
      expect(c.because.length).toBeGreaterThan(3)
    }
  })

  it('leaves no hobby stranded in the Rabbit Hole', () => {
    for (const h of HOBBIES) expect(neighbours(h.id).length, h.id).toBeGreaterThanOrEqual(2)
  })

  it('wires rooms, people and demo content to real ids', () => {
    for (const r of ROOMS) {
      expect(hobbyIds.has(r.identity.emblem), r.id).toBe(true)
      r.hobbyIds.forEach((h) => expect(hobbyIds.has(h), `${r.id} → ${h}`).toBe(true))
      r.memberIds.forEach((p) => expect(personIds.has(p), `${r.id} → ${p}`).toBe(true))
      expect(personIds.has(r.hostId)).toBe(true)
    }
    for (const t of RAW_THREADS) {
      expect(roomIds.has(t.roomId)).toBe(true)
      expect(personIds.has(t.authorId)).toBe(true)
      t.replies.forEach(([a]) => expect(personIds.has(a), t.id).toBe(true))
    }
    for (const p of RAW_PROJECTS) {
      expect(roomIds.has(p.roomId)).toBe(true)
      expect(personIds.has(p.makerId)).toBe(true)
      expect(hobbyIds.has(p.cover.art), p.id).toBe(true)
    }
    RAW_HAPPENINGS.forEach((h) => expect(roomIds.has(h.roomId)).toBe(true))
    RAW_QUESTS.forEach((q) => expect(roomIds.has(q.roomId)).toBe(true))
    PEOPLE.forEach((p) => p.into.forEach((h) => expect(hobbyIds.has(h), `${p.id} → ${h}`).toBe(true)))
  })

  it('gives every hobby at least one room', () => {
    for (const h of HOBBIES)
      expect(
        ROOMS.some((r) => r.hobbyIds.includes(h.id)),
        h.id,
      ).toBe(true)
  })

  it('ranks room recommendations by overlap', () => {
    const recs = recommendRooms(['coding', 'generative-art', 'music-production'])
    expect(recs[0].room.id).toBe('curious-coders')
    expect(recs.every((r) => r.matches.length > 0)).toBe(true)
  })

  it('has unique achievement ids', () => {
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(ACHIEVEMENTS.length)
  })
})
