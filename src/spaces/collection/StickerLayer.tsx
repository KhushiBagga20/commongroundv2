import type { RefObject } from 'react'
import { motion, useMotionValue, type PanInfo } from 'motion/react'
import { Sticker, STICKERS, type StickerId } from '@/art/Stickers'
import { cn } from '@/lib/format'
import { useCollector, type StickerPos } from '@/store/collector'

/** Default placements: x is % of the page width, y is px from the top. */
export const DEFAULT_STICKERS: { id: StickerId; pos: StickerPos }[] = [
  { id: 'heart', pos: { x: 70, y: 84, r: -12 } },
  { id: 'yes', pos: { x: 88, y: 560, r: 10 } },
  { id: 'smiley', pos: { x: 2, y: 980, r: 8 } },
  { id: 'bolt', pos: { x: 92, y: 1350, r: -8 } },
  { id: 'planet', pos: { x: 6, y: 1800, r: 14 } },
  { id: 'weird', pos: { x: 80, y: 2250, r: -6 } },
]

function PlacedSticker({ id, pos, editing, container }: { id: StickerId; pos: StickerPos; editing: boolean; container: RefObject<HTMLDivElement | null> }) {
  const placeSticker = useCollector((s) => s.placeSticker)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const box = container.current?.getBoundingClientRect()
    if (!box) return
    const nx = Math.max(0, Math.min(96, pos.x + (info.offset.x / box.width) * 100))
    const ny = Math.max(0, pos.y + info.offset.y)
    placeSticker(id, { x: nx, y: ny, r: pos.r + (info.velocity.x > 0 ? 4 : -4) })
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      className={cn('placed', editing && 'is-editing')}
      style={{ left: `${pos.x}%`, top: pos.y, x, y, rotate: pos.r }}
      drag={editing}
      dragMomentum={false}
      dragConstraints={container}
      dragElastic={0.1}
      whileDrag={{ scale: 1.15 }}
      onDragEnd={onDragEnd}
      data-cursor={editing ? 'drag' : undefined}
      aria-label={editing ? `${STICKERS[id].label}, draggable` : undefined}
      aria-hidden={!editing}
    >
      <Sticker id={id} size={96} />
    </motion.div>
  )
}

/** Decorative stickers over the scrapbook. Fixed in place unless you're decorating. */
export function StickerLayer({ editing, container }: { editing: boolean; container: RefObject<HTMLDivElement | null> }) {
  const placed = useCollector((s) => s.stickers)
  return (
    <div className={cn('sticker-layer', editing && 'is-editing')}>
      {DEFAULT_STICKERS.map((s) => (
        <PlacedSticker key={s.id} id={s.id} pos={placed[s.id] ?? s.pos} editing={editing} container={container} />
      ))}
    </div>
  )
}
