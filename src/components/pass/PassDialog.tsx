import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'motion/react'
import { Printer } from 'lucide-react'
import { SIGNALS, VIBE_LABELS, type SignalId } from '@/data/palette'
import type { Vibe } from '@/data/types'
import { cn } from '@/lib/format'
import { spring } from '@/motion/springs'
import { useCollector } from '@/store/collector'
import { toast, useUI } from '@/store/ui'
import { Keycap } from '../ui/Keycap'
import { Dialog } from '../ui/Overlay'
import { PassCard } from './PassCard'

const VIBES = Object.keys(VIBE_LABELS) as Vibe[]

/** Entering CommonGround: name, signal colour, up to three vibes. All optional. */
export function PassDialog() {
  const open = useUI((s) => s.passOpen)
  const close = useUI((s) => s.closePass)
  const pass = useCollector((s) => s.pass)
  return (
    <Dialog open={open} onClose={close} label={pass ? 'Edit your pass' : 'Get your pass'} className="pass-dialog">
      {open && <PassForm onClose={close} />}
    </Dialog>
  )
}

/** Mounted fresh each time the dialog opens, so it always starts from the saved pass. */
function PassForm({ onClose: close }: { onClose: () => void }) {
  const pass = useCollector((s) => s.pass)
  const savePass = useCollector((s) => s.savePass)
  const navigate = useNavigate()

  const [name, setName] = useState(pass?.name ?? '')
  const [signal, setSignal] = useState<SignalId>(pass?.signal ?? 'butter')
  const [vibes, setVibes] = useState<Vibe[]>(pass?.vibes ?? [])
  const [printing, setPrinting] = useState(false)

  const toggleVibe = (v: Vibe) => setVibes((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : cur.length >= 3 ? [...cur.slice(1), v] : [...cur, v]))

  const firstTime = !pass

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const finalName = name.trim() || 'Curious Human'
    savePass({ name: finalName, signal, vibes })
    setPrinting(true)
    window.setTimeout(
      () => {
        close()
        toast({
          title: firstTime ? `Welcome in, ${finalName}.` : 'Pass updated.',
          body: firstTime ? 'Your deck is tuned to your vibes.' : undefined,
          tone: 'acid',
        })
        if (firstTime) navigate('/swipe')
      },
      document.documentElement.dataset.motion === 'calm' ? 0 : 900,
    )
  }

  const skip = () => {
    close()
    if (firstTime) navigate('/swipe')
  }

  return (
    <form onSubmit={submit} className="pass-dialog__grid">
      <div className="pass-dialog__preview">
        <div className="pass-dialog__slot" aria-hidden="true" />
        <motion.div
          animate={printing ? { y: [0, -14, 26], rotate: [0, -2, 3] } : { y: 0, rotate: -2 }}
          transition={printing ? { duration: 0.8, times: [0, 0.35, 1] } : spring.gentle}
        >
          <PassCard pass={{ name, signal, vibes, createdAt: pass?.createdAt }} />
        </motion.div>
        {printing && (
          <motion.span
            className="pass-dialog__stamp display"
            initial={{ scale: 2.4, opacity: 0, rotate: -24 }}
            animate={{ scale: 1, opacity: 1, rotate: -12 }}
            transition={spring.bouncy}
          >
            Valid!
          </motion.span>
        )}
      </div>

      <div className="pass-dialog__form">
        <p className="pixel pass-dialog__kicker">{firstTime ? 'Step inside' : 'Your pass'}</p>
        <h2 className="display pass-dialog__title">{firstTime ? 'Get your pass' : 'Edit your pass'}</h2>
        <p className="pass-dialog__lede">Everything stays in this browser. Skip anything you like.</p>

        <label className="field-label" htmlFor="pass-name">
          What should we call you?
        </label>
        <input
          id="pass-name"
          className="field"
          value={name}
          maxLength={24}
          placeholder="Curious Human"
          onChange={(e) => setName(e.target.value)}
          autoComplete="nickname"
          data-autofocus
        />

        <fieldset className="pass-dialog__set">
          <legend className="field-label">Your signal colour</legend>
          <div className="pass-dialog__signals" role="radiogroup" aria-label="Signal colour">
            {SIGNALS.map((s) => (
              <Keycap
                key={s.id}
                role="radio"
                aria-checked={signal === s.id}
                aria-label={s.label}
                cap={s.color}
                on={s.color}
                led={false}
                depth={6}
                className="pass-dialog__signal"
                onClick={() => setSignal(s.id)}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="pass-dialog__set">
          <legend className="field-label">
            Pick up to three vibes <span className="field-hint">(tunes your deck)</span>
          </legend>
          <div className="pass-dialog__vibes">
            {VIBES.map((v) => (
              <button
                key={v}
                type="button"
                className={cn('chip vibe-chip', vibes.includes(v) && 'is-on')}
                aria-pressed={vibes.includes(v)}
                onClick={() => toggleVibe(v)}
              >
                {VIBE_LABELS[v]}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="pass-dialog__actions">
          <button type="submit" className="ink-btn ink-btn--lg" style={{ '--face': 'var(--tangerine)' } as React.CSSProperties} disabled={printing}>
            <Printer size={20} strokeWidth={2.6} aria-hidden="true" /> {firstTime ? 'Print my pass' : 'Reprint'}
          </button>
          {firstTime && (
            <button type="button" className="text-btn" onClick={skip}>
              Skip — just let me swipe
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
