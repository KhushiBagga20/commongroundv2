import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Sticker, type StickerId } from '@/art/Stickers'
import { ACHIEVEMENTS } from '@/data/achievements'
import { hobbyCount } from '@/data/repository'
import { isTypingTarget } from '@/hooks/useHotkeys'
import { isCalm } from '@/motion/calm'
import { newlyUnlocked, useCollector } from '@/store/collector'
import { toast } from '@/store/ui'

const BY_ID = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]))

/** Records achievements as soon as the collector satisfies them. */
export function useAchievementWatcher() {
  useEffect(() => {
    const check = () => {
      const s = useCollector.getState()
      const fresh = newlyUnlocked(s, hobbyCount)
      if (!fresh.length) return
      const now = Date.now()
      useCollector.setState({ unlocked: { ...s.unlocked, ...Object.fromEntries(fresh.map((id) => [id, now])) } })
      fresh.forEach((id) => toast({ title: BY_ID[id].name, body: BY_ID[id].hint, tone: 'butter', kind: 'achievement' }))
    }
    const unsub = useCollector.subscribe(check)
    // persisted state may already satisfy something new
    const t = window.setTimeout(check, 600)
    return () => {
      unsub()
      window.clearTimeout(t)
    }
  }, [])
}

/** Pause ambient CSS when the tab is hidden. */
export function useVisibilityAttribute() {
  useEffect(() => {
    const sync = () => {
      document.documentElement.dataset.tab = document.hidden ? 'hidden' : 'visible'
    }
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [])
}

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
const WORD = 'weird'

export const PARTY_EVENT = 'cg:party'
export const WEIRD_EVENT = 'cg:weird'

/** Harmless secrets: an old cheat code, a magic word, and late-night visits. */
export function useSecrets() {
  const unlockSecret = useCollector((s) => s.unlockSecret)
  useEffect(() => {
    const h = new Date().getHours()
    if (h >= 0 && h < 5) unlockSecret('night-owl')

    let seq: string[] = []
    let word = ''
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target) || e.metaKey || e.ctrlKey || e.altKey) return
      seq = [...seq, e.key.length === 1 ? e.key.toLowerCase() : e.key].slice(-KONAMI.length)
      if (seq.join() === KONAMI.join()) {
        seq = []
        unlockSecret('konami')
        window.dispatchEvent(new CustomEvent(PARTY_EVENT))
        toast({ title: 'Cheat code accepted.', body: 'Nothing is unlocked except joy.', tone: 'gum' })
      }
      if (e.key.length === 1) {
        word = (word + e.key.toLowerCase()).slice(-WORD.length)
        if (word === WORD) {
          word = ''
          unlockSecret('say-it')
          window.dispatchEvent(new CustomEvent(WEIRD_EVENT))
          window.dispatchEvent(new CustomEvent(PARTY_EVENT))
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [unlockSecret])
}

const PARTY: StickerId[] = ['yes', 'ooh', 'weird', 'smiley', 'bolt', 'heart', 'eye', 'planet', 'curious', 'new', 'flower', 'yes', 'smiley', 'bolt']

interface Piece {
  key: string
  id: StickerId
  x: number
  size: number
  r0: number
  r1: number
  duration: number
  delay: number
}

/** A short, bounded sticker rain. Never more than 14 pieces, gone in under 3s. */
export function PartyLayer() {
  const [pieces, setPieces] = useState<Piece[]>([])
  useEffect(() => {
    let t = 0
    const go = () => {
      if (isCalm()) return
      const burst = Date.now()
      setPieces(
        PARTY.map((id, i) => ({
          key: `${burst}-${i}`,
          id,
          x: (i / PARTY.length) * 100 + Math.random() * 6,
          size: 70 + Math.round(Math.random() * 40),
          r0: Math.random() * 90 - 45,
          r1: Math.random() * 720 - 360,
          duration: 1.6 + Math.random(),
          delay: Math.random() * 0.4,
        })),
      )
      window.clearTimeout(t)
      t = window.setTimeout(() => setPieces([]), 2800)
    }
    window.addEventListener(PARTY_EVENT, go)
    return () => {
      window.removeEventListener(PARTY_EVENT, go)
      window.clearTimeout(t)
    }
  }, [])

  return (
    <div className="party" aria-hidden="true">
      <AnimatePresence>
        {pieces.map((p) => (
          <motion.div
            key={p.key}
            className="party__piece"
            style={{ left: `${p.x}vw` }}
            initial={{ y: '-20vh', rotate: p.r0 }}
            animate={{ y: '115vh', rotate: p.r1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: p.duration, ease: [0.4, 0, 0.8, 0.6], delay: p.delay }}
          >
            <Sticker id={p.id} size={p.size} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
