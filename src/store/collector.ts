/**
 * The collector: everything a visitor does, persisted to localStorage.
 * Every mutation goes through an action here — this is the seam a real
 * backend would sync against.
 */
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { AchievementSnapshot } from '@/data/achievements'
import { evaluateAchievements } from '@/data/achievements'
import type { SignalId } from '@/data/palette'
import type { PatternId, Project, Reply, Thread, Verdict, Vibe } from '@/data/types'
import { uid } from '@/lib/format'

export interface Pass {
  name: string
  signal: SignalId
  vibes: Vibe[]
  createdAt: number
}

export interface SwipeEvent {
  id: string
  verdict: Verdict
  at: number
}

export type MotionPref = 'system' | 'full' | 'calm'

export interface StickerPos {
  x: number
  y: number
  r: number
}

export interface CollectorData {
  pass: Pass | null
  verdicts: Record<string, { v: Verdict; at: number }>
  history: SwipeEvent[]
  swipes: number
  undos: number
  deckSeed: number
  discovered: Record<string, number>
  trail: string[]
  notes: Record<string, string>
  joined: Record<string, number>
  quests: Record<string, number>
  rsvps: Record<string, number>
  localThreads: Thread[]
  localReplies: Record<string, Reply[]>
  localProjects: Project[]
  waves: Record<string, number>
  secrets: Record<string, number>
  unlocked: Record<string, number>
  stickers: Record<string, StickerPos>
  motion: MotionPref
}

export interface CollectorActions {
  savePass: (pass: Omit<Pass, 'createdAt'>) => void
  setVerdict: (id: string, v: Verdict, opts?: { fromSwipe?: boolean }) => void
  clearVerdict: (id: string) => void
  undo: () => SwipeEvent | null
  reshuffle: () => void
  resetSkipped: () => void
  discover: (id: string) => boolean
  pushTrail: (id: string) => void
  backTrail: () => string | null
  clearTrail: () => void
  setNote: (id: string, text: string) => void
  toggleJoin: (roomId: string) => boolean
  toggleQuest: (questId: string) => void
  toggleRsvp: (happeningId: string) => void
  addThread: (roomId: string, input: { title: string; body: string; tag: Thread['tag'] }) => Thread
  removeThread: (id: string) => void
  addReply: (threadId: string, body: string) => void
  addProject: (
    roomId: string,
    input: { title: string; blurb: string; lookingForCollab: boolean; cover: { pattern: PatternId; bg: string; fg: string; art: string } },
  ) => Project
  removeProject: (id: string) => void
  toggleWave: (personId: string) => void
  unlockSecret: (id: string) => void
  placeSticker: (id: string, pos: StickerPos) => void
  resetStickers: () => void
  setMotion: (m: MotionPref) => void
  resetAll: () => void
}

export type CollectorState = CollectorData & CollectorActions

export const YOU = 'you'

export const initialData = (): CollectorData => ({
  pass: null,
  verdicts: {},
  history: [],
  swipes: 0,
  undos: 0,
  deckSeed: Math.floor(Math.random() * 1e9),
  discovered: {},
  trail: [],
  notes: {},
  joined: {},
  quests: {},
  rsvps: {},
  localThreads: [],
  localReplies: {},
  localProjects: [],
  waves: {},
  secrets: {},
  unlocked: {},
  stickers: {},
  motion: 'system',
})

function without<T>(rec: Record<string, T>, key: string): Record<string, T> {
  const next = { ...rec }
  delete next[key]
  return next
}

function toggled(rec: Record<string, number>, key: string): Record<string, number> {
  return rec[key] ? without(rec, key) : { ...rec, [key]: Date.now() }
}

export const useCollector = create<CollectorState>()(
  persist(
    (set, get) => ({
      ...initialData(),

      savePass: (pass) => set((s) => ({ pass: { ...pass, createdAt: s.pass?.createdAt ?? Date.now() } })),

      setVerdict: (id, v, opts) =>
        set((s) => ({
          verdicts: { ...s.verdicts, [id]: { v, at: Date.now() } },
          history: opts?.fromSwipe ? [...s.history, { id, verdict: v, at: Date.now() }].slice(-60) : s.history,
          swipes: opts?.fromSwipe ? s.swipes + 1 : s.swipes,
        })),

      clearVerdict: (id) => set((s) => ({ verdicts: without(s.verdicts, id) })),

      undo: () => {
        const { history, verdicts } = get()
        // Skip history entries whose verdict was since changed elsewhere (e.g. in the dossier).
        for (let i = history.length - 1; i >= 0; i--) {
          const ev = history[i]
          if (verdicts[ev.id]?.v === ev.verdict) {
            set((s) => ({
              history: s.history.slice(0, i),
              verdicts: without(s.verdicts, ev.id),
              undos: s.undos + 1,
            }))
            return ev
          }
        }
        set({ history: [] })
        return null
      },

      reshuffle: () => set({ deckSeed: Math.floor(Math.random() * 1e9) }),

      resetSkipped: () =>
        set((s) => ({
          verdicts: Object.fromEntries(Object.entries(s.verdicts).filter(([, val]) => val.v !== 'nah')),
          history: s.history.filter((h) => h.verdict !== 'nah'),
          deckSeed: Math.floor(Math.random() * 1e9),
        })),

      discover: (id) => {
        if (get().discovered[id]) return false
        set((s) => ({ discovered: { ...s.discovered, [id]: Date.now() } }))
        return true
      },

      pushTrail: (id) => set((s) => (s.trail[s.trail.length - 1] === id ? s : { trail: [...s.trail, id].slice(-24) })),

      backTrail: () => {
        const { trail } = get()
        if (trail.length < 2) {
          set({ trail: [] })
          return null
        }
        const next = trail.slice(0, -1)
        set({ trail: next })
        return next[next.length - 1]
      },

      clearTrail: () => set({ trail: [] }),

      setNote: (id, text) => set((s) => ({ notes: text.trim() ? { ...s.notes, [id]: text.slice(0, 600) } : without(s.notes, id) })),

      toggleJoin: (roomId) => {
        const joined = !get().joined[roomId]
        set((s) => ({ joined: toggled(s.joined, roomId) }))
        return joined
      },

      toggleQuest: (questId) => set((s) => ({ quests: toggled(s.quests, questId) })),
      toggleRsvp: (happeningId) => set((s) => ({ rsvps: toggled(s.rsvps, happeningId) })),

      addThread: (roomId, input) => {
        const thread: Thread = {
          id: uid('t'),
          roomId,
          authorId: YOU,
          title: input.title.trim().slice(0, 120),
          body: input.body.trim().slice(0, 1200),
          tag: input.tag,
          createdAt: new Date().toISOString(),
          replies: [],
          origin: 'local',
        }
        set((s) => ({ localThreads: [thread, ...s.localThreads] }))
        return thread
      },

      removeThread: (id) => set((s) => ({ localThreads: s.localThreads.filter((t) => t.id !== id), localReplies: without(s.localReplies, id) })),

      addReply: (threadId, body) =>
        set((s) => ({
          localReplies: {
            ...s.localReplies,
            [threadId]: [
              ...(s.localReplies[threadId] ?? []),
              { id: uid('r'), authorId: YOU, body: body.trim().slice(0, 800), createdAt: new Date().toISOString(), origin: 'local' },
            ],
          },
        })),

      addProject: (roomId, input) => {
        const project: Project = {
          id: uid('pr'),
          roomId,
          makerId: YOU,
          title: input.title.trim().slice(0, 80),
          blurb: input.blurb.trim().slice(0, 280),
          cover: input.cover,
          lookingForCollab: input.lookingForCollab,
          createdAt: new Date().toISOString(),
          origin: 'local',
        }
        set((s) => ({ localProjects: [project, ...s.localProjects] }))
        return project
      },

      removeProject: (id) => set((s) => ({ localProjects: s.localProjects.filter((p) => p.id !== id) })),

      toggleWave: (personId) => set((s) => ({ waves: toggled(s.waves, personId) })),

      unlockSecret: (id) => set((s) => (s.secrets[id] ? s : { secrets: { ...s.secrets, [id]: Date.now() } })),

      placeSticker: (id, pos) => set((s) => ({ stickers: { ...s.stickers, [id]: pos } })),
      resetStickers: () => set({ stickers: {} }),

      setMotion: (motion) => set({ motion }),

      resetAll: () => set({ ...initialData(), motion: get().motion }),
    }),
    {
      name: 'commonground:collector',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s): CollectorData => ({
        pass: s.pass,
        verdicts: s.verdicts,
        history: s.history,
        swipes: s.swipes,
        undos: s.undos,
        deckSeed: s.deckSeed,
        discovered: s.discovered,
        trail: s.trail,
        notes: s.notes,
        joined: s.joined,
        quests: s.quests,
        rsvps: s.rsvps,
        localThreads: s.localThreads,
        localReplies: s.localReplies,
        localProjects: s.localProjects,
        waves: s.waves,
        secrets: s.secrets,
        unlocked: s.unlocked,
        stickers: s.stickers,
        motion: s.motion,
      }),
    },
  ),
)

// ── derived selectors ────────────────────────────────────────────────────

export function idsWith(verdicts: CollectorData['verdicts'], v: Verdict): string[] {
  return Object.entries(verdicts)
    .filter(([, val]) => val.v === v)
    .sort((a, b) => b[1].at - a[1].at)
    .map(([id]) => id)
}

export function snapshot(s: CollectorData, totalHobbies: number): AchievementSnapshot {
  const vs = Object.values(s.verdicts)
  return {
    into: vs.filter((x) => x.v === 'into').length,
    later: vs.filter((x) => x.v === 'later').length,
    nah: vs.filter((x) => x.v === 'nah').length,
    swipes: s.swipes,
    undos: s.undos,
    discovered: Object.keys(s.discovered).length,
    totalHobbies,
    joined: Object.keys(s.joined).length,
    quests: Object.keys(s.quests).length,
    rsvps: Object.keys(s.rsvps).length,
    posts: s.localThreads.length + Object.values(s.localReplies).reduce((n, r) => n + r.length, 0),
    projects: s.localProjects.length,
    secrets: s.secrets,
  }
}

/** Returns achievement ids that are satisfied but not yet recorded. */
export function newlyUnlocked(s: CollectorData, totalHobbies: number): string[] {
  return evaluateAchievements(snapshot(s, totalHobbies)).filter((id) => !s.unlocked[id])
}
