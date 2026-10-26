import { useCollector, type MotionPref } from '@/store/collector'
import { useUI } from '@/store/ui'
import { useHotkeys } from '@/hooks/useHotkeys'
import { Keycap } from '../ui/Keycap'
import { Dialog } from '../ui/Overlay'

const GROUPS: { title: string; keys: [string, string][] }[] = [
  {
    title: 'Anywhere',
    keys: [
      ['1 – 5', 'Switch space'],
      ['?', 'This panel'],
      ['Esc', 'Close sheets & dialogs'],
    ],
  },
  {
    title: 'Swipe Machine',
    keys: [
      ['→', 'Into it'],
      ['←', 'Not for me'],
      ['↑', 'Save for later'],
      ['Space', 'Flip card'],
      ['I', 'Open dossier'],
      ['Z', 'Undo'],
    ],
  },
  {
    title: 'Rabbit Hole',
    keys: [
      ['+ / −', 'Zoom'],
      ['0', 'Fit everything'],
      ['Arrows', 'Pan the map'],
      ['Esc', 'Let go of a sticker'],
      ['/', 'Search'],
    ],
  },
]

const MOTION: { id: MotionPref; label: string }[] = [
  { id: 'system', label: 'Follow my system' },
  { id: 'full', label: 'Full motion' },
  { id: 'calm', label: 'Calm' },
]

/** Shortcuts, motion settings and an honest note about what's real here. */
export function HelpDialog() {
  const open = useUI((s) => s.shortcutsOpen)
  const setOpen = useUI((s) => s.setShortcuts)
  const motion = useCollector((s) => s.motion)
  const setMotion = useCollector((s) => s.setMotion)

  useHotkeys({ '?': () => setOpen(true) })

  return (
    <Dialog open={open} onClose={() => setOpen(false)} label="Shortcuts and help" className="help-dialog">
      <p className="pixel help-dialog__kicker">Control panel</p>
      <h2 className="display help-dialog__title">How this place works</h2>
      <div className="help-dialog__grid">
        {GROUPS.map((g) => (
          <section key={g.title}>
            <h3 className="label">{g.title}</h3>
            <dl className="help-dialog__keys">
              {g.keys.map(([k, v]) => (
                <div key={k + v}>
                  <dt>
                    <kbd>{k}</kbd>
                  </dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <section className="help-dialog__motion">
        <h3 className="label">Motion</h3>
        <div role="radiogroup" aria-label="Motion preference" className="help-dialog__motion-keys">
          {MOTION.map((m) => (
            <Keycap key={m.id} role="radio" aria-checked={motion === m.id} on="var(--acid-green)" onClick={() => setMotion(m.id)} depth={5}>
              <span className="help-dialog__motion-label">{m.label}</span>
            </Keycap>
          ))}
        </div>
      </section>

      <section className="help-dialog__honest">
        <h3 className="label">What’s real in this prototype</h3>
        <p>
          Your swipes, saved hobbies, notes, rooms joined, quests, posts and stickers are <strong>really saved — in this browser only</strong>. The people,
          threads, events and member counts are <strong>demo content</strong>; nothing you post is sent anywhere, and nobody else can see it.
        </p>
        <p className="help-dialog__secret">There are a few secrets. None of them are required for anything.</p>
      </section>
    </Dialog>
  )
}
