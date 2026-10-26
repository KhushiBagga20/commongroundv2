import { describe, expect, it } from 'vitest'
import { HOBBIES } from '@/data/hobbies'
import { buildDeck } from './deck'

const base = { hobbies: HOBBIES, category: 'all' as const, seed: 42, verdicts: {}, vibes: [] }

describe('buildDeck', () => {
  it('is deterministic for a seed', () => {
    expect(buildDeck(base).map((h) => h.id)).toEqual(buildDeck(base).map((h) => h.id))
  })

  it('keeps the remaining order stable as cards are decided', () => {
    const full = buildDeck(base).map((h) => h.id)
    const after = buildDeck({ ...base, verdicts: { [full[0]]: { v: 'into' } } }).map((h) => h.id)
    expect(after).toEqual(full.slice(1))
  })

  it('removes decided hobbies and filters by category', () => {
    const deck = buildDeck({ ...base, category: 'taste', verdicts: { sourdough: { v: 'nah' } } })
    expect(deck.every((h) => h.category === 'taste')).toBe(true)
    expect(deck.some((h) => h.id === 'sourdough')).toBe(false)
  })

  it('nudges hobbies that match your vibes toward the top', () => {
    const deck = buildDeck({ ...base, vibes: ['night-owl', 'brainy'] })
    const topTen = deck.slice(0, 10)
    const matching = topTen.filter((h) => h.vibes.includes('night-owl') || h.vibes.includes('brainy'))
    expect(matching.length).toBeGreaterThanOrEqual(8)
  })

  it('puts a pinned (undone) card on top', () => {
    const deck = buildDeck({ ...base, pinned: 'pottery' })
    expect(deck[0].id).toBe('pottery')
  })
})
