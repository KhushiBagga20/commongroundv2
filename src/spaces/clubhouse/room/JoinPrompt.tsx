import { DoorOpen } from 'lucide-react'
import type { Room } from '@/data/types'
import { useCollector } from '@/store/collector'
import { toast } from '@/store/ui'

/** Shown in place of a composer when you're only visiting. */
export function JoinPrompt({ room, action }: { room: Room; action: string }) {
  const toggleJoin = useCollector((s) => s.toggleJoin)
  return (
    <div className="join-prompt">
      <p>
        You’re visiting. <strong>Join {room.name}</strong> to {action}.
      </p>
      <button
        type="button"
        className="ink-btn ink-btn--sm"
        style={{ '--face': room.identity.accent } as React.CSSProperties}
        onClick={() => {
          toggleJoin(room.id)
          toast({ title: `You joined ${room.name}`, body: 'A stamp was added to your Collection.', tone: 'acid' })
        }}
      >
        <DoorOpen size={16} strokeWidth={2.6} aria-hidden="true" /> Join
      </button>
    </div>
  )
}
