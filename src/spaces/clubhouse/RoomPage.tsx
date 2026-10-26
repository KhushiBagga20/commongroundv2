import { useState, type CSSProperties } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Check, DoorOpen, LogOut } from 'lucide-react'
import { HobbyArt } from '@/art/HobbyArt'
import { Stamp } from '@/art/Stamp'
import { DemoBadge } from '@/components/ui/bits'
import { Keycap } from '@/components/ui/Keycap'
import { getHobby } from '@/data/repository'
import { alpha, patternCSS } from '@/lib/patterns'
import { spring } from '@/motion/springs'
import { useCollector } from '@/store/collector'
import { toast } from '@/store/ui'
import { Board } from './room/Board'
import { Happenings, QuestCard } from './room/Happenings'
import { People } from './room/People'
import { Projects } from './room/Projects'
import { useRoom } from './useRoom'

type Tab = 'board' | 'projects' | 'happenings' | 'people'

const TABS: { id: Tab; label: string }[] = [
  { id: 'board', label: 'Board' },
  { id: 'projects', label: 'Projects' },
  { id: 'happenings', label: 'Happenings' },
  { id: 'people', label: 'People' },
]

/** Inside a room: the identity stays loud, the content gets calm and readable. */
export default function RoomPage() {
  const { roomId = '' } = useParams()
  const data = useRoom(roomId)
  const joined = useCollector((s) => !!s.joined[roomId])
  const toggleJoin = useCollector((s) => s.toggleJoin)
  const [tab, setTab] = useState<Tab>('board')
  const [stamping, setStamping] = useState(0)

  if (!data) return <Navigate to="/clubhouse" replace />
  const { room, threads, projects, happenings, quest, members } = data
  const id = room.identity
  const emblem = getHobby(id.emblem)!

  const join = () => {
    const now = toggleJoin(room.id)
    if (now) {
      setStamping(Date.now())
      toast({ title: `Welcome to ${room.name}`, body: 'A stamp was added to your Collection.', tone: 'acid' })
    } else toast({ title: `You left ${room.name}`, body: 'Your stamp is gone, the door stays open.', tone: 'ink' })
  }

  const counts: Record<Tab, number> = {
    board: threads.length,
    projects: projects.length,
    happenings: happenings.length,
    people: members.length + (joined ? 1 : 0),
  }

  return (
    <div className="space room" style={{ '--rb': id.bg, '--rf': id.fg, '--ra': id.accent } as CSSProperties}>
      <header className="room__hero" style={patternCSS(id.pattern, alpha(id.fg, 0.1), 1.2)}>
        <div className="wrap room__hero-inner">
          <Link to="/clubhouse" className="room__back">
            <ArrowLeft size={16} strokeWidth={2.8} aria-hidden="true" /> Back to the hallway
          </Link>
          <div className="room__title-row">
            <div className="room__titles">
              <p className="pixel room__kicker">Room · est. {room.founded}</p>
              <h1 className="display room__title">{room.name}</h1>
              <p className="room__tagline">{room.tagline}</p>
              <ul className="room__hobbies" aria-label="Hobbies in this room">
                {room.hobbyIds.map((h) => (
                  <li key={h} className="chip">
                    {getHobby(h)?.name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="room__emblem" aria-hidden="true">
              <HobbyArt id={emblem.id} swatch={emblem.swatch} mood={joined ? 'happy' : 'idle'} className="room__emblem-art" />
              <AnimatePresence>
                {joined && (
                  <motion.div
                    key={stamping}
                    className="room__stamp"
                    initial={stamping ? { scale: 2.4, rotate: -30, opacity: 0 } : false}
                    animate={{ scale: 1, rotate: -14, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={spring.bouncy}
                  >
                    <Stamp text={room.name.replace(/^The /, '')} color={id.fg} size={130} center={<HobbyArt id={emblem.id} swatch={emblem.swatch} />} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="room__actions">
            <Keycap
              className="room__join"
              cap={joined ? 'var(--paper)' : id.accent}
              on={'var(--acid-green)'}
              led={joined ? 'var(--acid-green)' : false}
              aria-pressed={joined}
              depth={8}
              radius={16}
              onClick={join}
            >
              <span className="room__join-label">
                {joined ? (
                  <>
                    <Check size={20} strokeWidth={3} aria-hidden="true" /> You’re a member
                  </>
                ) : (
                  <>
                    <DoorOpen size={20} strokeWidth={2.8} aria-hidden="true" /> Join the room
                  </>
                )}
              </span>
            </Keycap>
            {joined && (
              <button type="button" className="text-btn room__leave" onClick={join}>
                <LogOut size={14} strokeWidth={2.6} aria-hidden="true" /> Leave
              </button>
            )}
            <p className="room__count mono">
              {room.memberCount + (joined ? 1 : 0)} members <DemoBadge>demo</DemoBadge>
            </p>
          </div>
        </div>
      </header>

      <div className="room__body paper-ground tone-light">
        <div className="wrap room__grid">
          <aside className="room__aside">
            <section className="room__about">
              <h2 className="label">About the room</h2>
              <p>{room.about}</p>
              <h3 className="label">House rules</h3>
              <ol>
                {room.rules.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ol>
            </section>
            {quest && <QuestCard quest={quest} room={room} compact />}
          </aside>

          <div className="room__main">
            <div className="room__tabs" role="tablist" aria-label="Room sections">
              {TABS.map((t) => (
                <Keycap
                  key={t.id}
                  role="tab"
                  id={`tab-${t.id}`}
                  aria-selected={tab === t.id}
                  aria-controls={`panel-${t.id}`}
                  on={id.accent}
                  led={false}
                  depth={6}
                  radius={12}
                  className="room__tab"
                  onClick={() => setTab(t.id)}
                  onKeyDown={(e) => {
                    const i = TABS.findIndex((x) => x.id === tab)
                    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                      e.preventDefault()
                      const next = TABS[(i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length]
                      setTab(next.id)
                      document.getElementById(`tab-${next.id}`)?.focus()
                    }
                  }}
                  tabIndex={tab === t.id ? 0 : -1}
                >
                  <span className="room__tab-label">{t.label}</span>
                  <span className="pixel room__tab-count">{counts[t.id]}</span>
                </Keycap>
              ))}
            </div>
            <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="room__panel">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  {tab === 'board' && <Board room={room} threads={threads} joined={joined} />}
                  {tab === 'projects' && <Projects room={room} projects={projects} joined={joined} />}
                  {tab === 'happenings' && <Happenings room={room} happenings={happenings} quest={quest} />}
                  {tab === 'people' && <People room={room} members={members} joined={joined} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
