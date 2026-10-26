import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Sparkles, X } from 'lucide-react'
import { C } from '@/data/palette'
import { spring } from '@/motion/springs'
import { useUI, type Toast, type ToastTone } from '@/store/ui'

const TONES: Record<ToastTone, { bg: string; fg: string }> = {
  ink: { bg: C.ink, fg: C.paper },
  acid: { bg: C.acid, fg: C.ink },
  gum: { bg: C.bubblegum, fg: C.ink },
  butter: { bg: C.butter, fg: C.ink },
  lav: { bg: C.lavender, fg: C.ink },
  tang: { bg: C.tangerine, fg: C.ink },
}

function ToastCard({ t }: { t: Toast }) {
  const dismiss = useUI((s) => s.dismissToast)
  useEffect(() => {
    const id = window.setTimeout(() => dismiss(t.id), t.kind === 'achievement' ? 4600 : 3200)
    return () => window.clearTimeout(id)
  }, [t.id, t.kind, dismiss])
  const tone = TONES[t.tone]
  return (
    <motion.li
      layout
      className="toast"
      style={{ background: tone.bg, color: tone.fg }}
      initial={{ y: 40, rotate: -6, scale: 0.8, opacity: 0 }}
      animate={{ y: 0, rotate: t.id % 2 ? 1.5 : -1.5, scale: 1, opacity: 1 }}
      exit={{ x: -60, rotate: -8, opacity: 0, transition: { duration: 0.2 } }}
      transition={spring.bouncy}
    >
      {t.kind === 'achievement' && (
        <span className="toast__badge" aria-hidden="true">
          <Sparkles size={16} strokeWidth={2.6} />
        </span>
      )}
      <div className="toast__text">
        {t.kind === 'achievement' && <span className="pixel toast__kicker">Badge unlocked</span>}
        <strong>{t.title}</strong>
        {t.body && <span className="toast__body">{t.body}</span>}
      </div>
      <button type="button" className="toast__x" aria-label="Dismiss" onClick={() => dismiss(t.id)}>
        <X size={14} strokeWidth={3} />
      </button>
    </motion.li>
  )
}

export function Toasts() {
  const toasts = useUI((s) => s.toasts)
  return (
    <ol className="toasts" aria-live="polite" aria-label="Notifications">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastCard key={t.id} t={t} />
        ))}
      </AnimatePresence>
    </ol>
  )
}
