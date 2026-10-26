import type { CategoryId, Hobby, Verdict, Vibe } from '@/data/types'
import { shuffle } from './random'

export interface DeckInput {
  hobbies: readonly Hobby[]
  category: CategoryId | 'all'
  seed: number
  verdicts: Record<string, { v: Verdict } | undefined>
  vibes: readonly Vibe[]
  /** a card that should sit on top (e.g. one that was just undone) */
  pinned?: string | null
}

/**
 * The Swipe Machine's deck: unseen hobbies in the chosen category, shuffled by a
 * stable seed, with hobbies that match the visitor's vibes nudged upward.
 */
export function buildDeck({ hobbies, category, seed, verdicts, vibes, pinned }: DeckInput): Hobby[] {
  // Shuffle the whole catalogue first so the order stays put as cards are removed.
  const shuffled = shuffle(hobbies, seed)
  const wanted = new Set(vibes)
  // Partial sort: matching vibes rise, but the shuffle still mixes within a band.
  const scored = shuffled
    .map((h, i) => ({ h, score: h.vibes.filter((v) => wanted.has(v)).length * 6 - i * 0.35 }))
    .filter(({ h }) => !verdicts[h.id] && (category === 'all' || h.category === category))
  scored.sort((a, b) => b.score - a.score)
  const deck = scored.map((s) => s.h)
  if (pinned) {
    const idx = deck.findIndex((h) => h.id === pinned)
    if (idx > 0) deck.unshift(...deck.splice(idx, 1))
  }
  return deck
}
