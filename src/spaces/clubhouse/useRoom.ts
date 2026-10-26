import { useMemo } from 'react'
import { getPerson, getRoom, happeningsForRoom, projectsForRoom, questForRoom, threadsForRoom } from '@/data/repository'
import type { Person, Thread } from '@/data/types'
import { useCollector, YOU } from '@/store/collector'

/** A room's demo content merged with whatever this visitor added locally. */
export function useRoom(roomId: string) {
  const localThreads = useCollector((s) => s.localThreads)
  const localReplies = useCollector((s) => s.localReplies)
  const localProjects = useCollector((s) => s.localProjects)

  return useMemo(() => {
    const room = getRoom(roomId)
    if (!room) return null
    const threads: Thread[] = [...localThreads.filter((t) => t.roomId === roomId), ...threadsForRoom(roomId)].map((t) => ({
      ...t,
      replies: [...t.replies, ...(localReplies[t.id] ?? [])],
    }))
    const projects = [...localProjects.filter((p) => p.roomId === roomId), ...projectsForRoom(roomId)]
    const members = room.memberIds.map((id) => getPerson(id)).filter((p): p is Person => !!p)
    return { room, threads, projects, happenings: happeningsForRoom(roomId), quest: questForRoom(roomId), members }
  }, [roomId, localThreads, localReplies, localProjects])
}

export function nameOf(authorId: string, youName?: string) {
  if (authorId === YOU) return youName ? `${youName} (you)` : 'You'
  return getPerson(authorId)?.name ?? 'Someone'
}
