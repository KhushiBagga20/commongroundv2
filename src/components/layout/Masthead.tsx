import { Link } from 'react-router'
import { CircleQuestionMark, Feather, Zap } from 'lucide-react'
import { Avatar } from '@/art/Avatar'
import { useCalm } from '@/motion/calm'
import { useCollector } from '@/store/collector'
import { useUI } from '@/store/ui'

function Mark() {
  return (
    <svg viewBox="0 0 64 64" width="30" height="30" aria-hidden="true" className="mast__mark">
      <g stroke="#17172B" strokeWidth="3.5" strokeLinejoin="round">
        <g fill="#FF7148" className="mast__petals">
          {[0, 60, 120, 180, 240, 300].map((r) => (
            <ellipse key={r} cx="32" cy="10" rx="7" ry="9" transform={`rotate(${r} 32 34)`} />
          ))}
        </g>
        <circle cx="32" cy="34" r="17" fill="#FFDE70" />
      </g>
      <circle cx="26" cy="33" r="2.6" fill="#17172B" />
      <circle cx="38" cy="33" r="2.6" fill="#17172B" />
      <path d="M26 40 q6 5 12 0" fill="none" stroke="#17172B" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

/** Two paper pills in the top corners: home, and your status. */
export function Masthead() {
  const into = useCollector((s) => Object.values(s.verdicts).filter((v) => v.v === 'into').length)
  const pass = useCollector((s) => s.pass)
  const motion = useCollector((s) => s.motion)
  const setMotion = useCollector((s) => s.setMotion)
  const calm = useCalm()
  const openPass = useUI((s) => s.openPass)
  const setShortcuts = useUI((s) => s.setShortcuts)

  const toggleMotion = () => setMotion(calm ? 'full' : 'calm')

  return (
    <header className="mast">
      <Link to="/" className="mast__pill mast__home" aria-label="CommonGround home">
        <Mark />
        <span className="mast__word display">CommonGround</span>
      </Link>
      <div className="mast__pill mast__status">
        <Link to="/collection" className="mast__count" aria-label={`${into} hobbies you're into. Open your collection.`}>
          <span className="mast__count-dot" aria-hidden="true" />
          <span className="pixel">{String(into).padStart(2, '0')}</span>
          <span className="mast__count-label">into it</span>
        </Link>
        <button
          type="button"
          className="mast__icon"
          onClick={toggleMotion}
          aria-pressed={calm}
          aria-label={calm ? 'Calm motion is on. Switch to full motion.' : 'Full motion is on. Switch to calm motion.'}
          title={calm ? `Calm motion${motion === 'system' ? ' (from your system)' : ''}` : 'Full motion'}
        >
          {calm ? <Feather size={18} strokeWidth={2.4} /> : <Zap size={18} strokeWidth={2.4} />}
        </button>
        <button type="button" className="mast__icon" onClick={() => setShortcuts(true)} aria-label="Keyboard shortcuts and help" title="Shortcuts & help (?)">
          <CircleQuestionMark size={18} strokeWidth={2.4} />
        </button>
        <button type="button" className="mast__pass" onClick={() => openPass()} aria-label={pass ? `Your pass: ${pass.name}. Edit pass.` : 'Get your pass'}>
          {pass ? <Avatar seed={pass.name} size={30} /> : <span className="pixel">Get pass</span>}
        </button>
      </div>
    </header>
  )
}
