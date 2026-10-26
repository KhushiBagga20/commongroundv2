import { Bookmark, Heart, X } from 'lucide-react'
import { C } from '@/data/palette'
import { getHobby } from '@/data/repository'
import type { Verdict } from '@/data/types'
import { cn } from '@/lib/format'
import { useCollector } from '@/store/collector'
import { toast } from '@/store/ui'
import { Keycap } from '../ui/Keycap'

const OPTIONS: { v: Verdict; label: string; on: string; Icon: typeof Heart }[] = [
  { v: 'into', label: 'Into it', on: C.acid, Icon: Heart },
  { v: 'later', label: 'Save for later', on: C.lavender, Icon: Bookmark },
  { v: 'nah', label: 'Not for me', on: C.tangerine, Icon: X },
]

/** Three keys that set (or clear) a hobby's verdict from anywhere. */
export function VerdictKeys({ hobbyId, size = 'md', className }: { hobbyId: string; size?: 'sm' | 'md'; className?: string }) {
  const current = useCollector((s) => s.verdicts[hobbyId]?.v)
  const setVerdict = useCollector((s) => s.setVerdict)
  const clearVerdict = useCollector((s) => s.clearVerdict)
  const name = getHobby(hobbyId)?.name ?? 'Hobby'

  const choose = (v: Verdict) => {
    if (current === v) {
      clearVerdict(hobbyId)
      return
    }
    setVerdict(hobbyId, v)
    if (v === 'into') toast({ title: `${name} is in your collection`, tone: 'acid' })
    if (v === 'later') toast({ title: `${name} saved for later`, tone: 'lav' })
  }

  return (
    <div className={cn('verdict-keys', size === 'sm' && 'verdict-keys--sm', className)} role="group" aria-label={`How do you feel about ${name}?`}>
      {OPTIONS.map(({ v, label, on, Icon }) => (
        <Keycap key={v} on={on} led={on} aria-pressed={current === v} onClick={() => choose(v)} className="verdict-key" depth={size === 'sm' ? 5 : 7}>
          <span className="verdict-key__inner">
            <Icon size={size === 'sm' ? 15 : 18} strokeWidth={2.6} aria-hidden="true" />
            <span>{label}</span>
          </span>
        </Keycap>
      ))}
    </div>
  )
}
