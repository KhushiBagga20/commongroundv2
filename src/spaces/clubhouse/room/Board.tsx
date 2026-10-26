import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { MessageSquare, Send, Trash } from 'lucide-react'
import { Avatar } from '@/art/Avatar'
import { DemoBadge } from '@/components/ui/bits'
import type { Room, Thread } from '@/data/types'
import { cn, plural, timeAgo } from '@/lib/format'
import { spring } from '@/motion/springs'
import { useCollector, YOU } from '@/store/collector'
import { toast } from '@/store/ui'
import { nameOf } from '../useRoom'
import { JoinPrompt } from './JoinPrompt'

const TAGS: Thread['tag'][] = ['show & tell', 'question', 'idea', 'help', 'chat']

/** Discussions: readable, threaded, and honest about what's local. */
export function Board({ room, threads, joined }: { room: Room; threads: Thread[]; joined: boolean }) {
  const addThread = useCollector((s) => s.addThread)
  const passName = useCollector((s) => s.pass?.name)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tag, setTag] = useState<Thread['tag']>('show & tell')
  const [open, setOpen] = useState<string | null>(null)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    const t = addThread(room.id, { title, body, tag })
    setTitle('')
    setBody('')
    setOpen(t.id)
    toast({ title: 'Posted to the board', body: 'Saved in this browser only.', tone: 'acid' })
  }

  return (
    <div className="board">
      {joined ? (
        <form className="composer" onSubmit={submit}>
          <div className="composer__head">
            <Avatar seed={passName ?? 'you'} size={40} />
            <p className="composer__title">Start a thread</p>
            <DemoBadge />
          </div>
          <label className="sr-only" htmlFor="thread-title">
            Thread title
          </label>
          <input
            id="thread-title"
            className="field"
            placeholder="What’s on your mind? (a question, a win, a weird idea)"
            value={title}
            maxLength={120}
            onChange={(e) => setTitle(e.target.value)}
          />
          <label className="sr-only" htmlFor="thread-body">
            Details
          </label>
          <textarea
            id="thread-body"
            className="field"
            placeholder="Add details, if you like."
            value={body}
            maxLength={1200}
            onChange={(e) => setBody(e.target.value)}
          />
          <div className="composer__foot">
            <div className="composer__tags" role="radiogroup" aria-label="Thread type">
              {TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={tag === t}
                  className={cn('chip vibe-chip', tag === t && 'is-on')}
                  onClick={() => setTag(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            <button type="submit" className="ink-btn" disabled={!title.trim()} style={{ '--face': 'var(--acid-green)' } as React.CSSProperties}>
              <Send size={16} strokeWidth={2.6} aria-hidden="true" /> Post
            </button>
          </div>
        </form>
      ) : (
        <JoinPrompt room={room} action="start threads and reply" />
      )}

      <ul className="threads">
        {threads.map((t) => (
          <ThreadCard key={t.id} thread={t} expanded={open === t.id} onToggle={() => setOpen(open === t.id ? null : t.id)} joined={joined} youName={passName} />
        ))}
      </ul>
    </div>
  )
}

function ThreadCard({
  thread: t,
  expanded,
  onToggle,
  joined,
  youName,
}: {
  thread: Thread
  expanded: boolean
  onToggle: () => void
  joined: boolean
  youName?: string
}) {
  const addReply = useCollector((s) => s.addReply)
  const removeThread = useCollector((s) => s.removeThread)
  const [reply, setReply] = useState('')
  const mine = t.authorId === YOU
  const panelId = `thread-${t.id}`

  const send = (e: FormEvent) => {
    e.preventDefault()
    if (!reply.trim()) return
    addReply(t.id, reply)
    setReply('')
  }

  return (
    <motion.li layout="position" className={cn('thread', expanded && 'is-open', mine && 'thread--mine')} transition={spring.snappy}>
      <button type="button" className="thread__summary" onClick={onToggle} aria-expanded={expanded} aria-controls={panelId}>
        <Avatar seed={mine ? (youName ?? 'you') : t.authorId} size={44} />
        <span className="thread__meta">
          <span className="thread__who">
            <strong>{nameOf(t.authorId, youName)}</strong>
            <span className="chip thread__tag">{t.tag}</span>
            <span className="thread__time mono">{timeAgo(t.createdAt)}</span>
            {t.origin === 'local' && <DemoBadge>Only you can see this</DemoBadge>}
          </span>
          <span className="thread__title">{t.title}</span>
          {!expanded && t.body && <span className="thread__excerpt">{t.body}</span>}
        </span>
        <span className="thread__count mono">
          <MessageSquare size={15} strokeWidth={2.6} aria-hidden="true" /> {t.replies.length}
          <span className="sr-only"> {plural(t.replies.length, 'reply', 'replies')}</span>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id={panelId}
            className="thread__panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="thread__inner">
              {t.body && <p className="thread__body">{t.body}</p>}
              <ol className="replies">
                {t.replies.map((r) => (
                  <li key={r.id} className="reply">
                    <Avatar seed={r.authorId === YOU ? (youName ?? 'you') : r.authorId} size={32} />
                    <div>
                      <p className="reply__who">
                        <strong>{nameOf(r.authorId, youName)}</strong> <span className="mono">{timeAgo(r.createdAt)}</span>
                        {r.origin === 'local' && <DemoBadge>local</DemoBadge>}
                      </p>
                      <p className="reply__body">{r.body}</p>
                    </div>
                  </li>
                ))}
                {!t.replies.length && <li className="reply reply--empty">No replies yet. Be the first nice person.</li>}
              </ol>
              {joined ? (
                <form className="reply-box" onSubmit={send}>
                  <label className="sr-only" htmlFor={`reply-${t.id}`}>
                    Reply
                  </label>
                  <input
                    id={`reply-${t.id}`}
                    className="field"
                    placeholder="Write a reply…"
                    value={reply}
                    maxLength={800}
                    onChange={(e) => setReply(e.target.value)}
                  />
                  <button type="submit" className="ink-btn ink-btn--sm" disabled={!reply.trim()}>
                    Reply
                  </button>
                </form>
              ) : (
                <p className="thread__join mono">Join the room to reply.</p>
              )}
              {mine && (
                <button
                  type="button"
                  className="text-btn thread__delete"
                  onClick={() => {
                    removeThread(t.id)
                    toast({ title: 'Thread deleted', tone: 'ink' })
                  }}
                >
                  <Trash size={14} strokeWidth={2.6} aria-hidden="true" /> Delete my thread
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  )
}
