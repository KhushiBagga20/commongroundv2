import { AnimatePresence, motion } from 'motion/react'
import { Sticker, type StickerId } from '@/art/Stickers'
import { spring } from '@/motion/springs'

export interface Cheer {
  id: number
  sticker: StickerId
  x: number
  y: number
  r: number
  big: boolean
}

export const CHEERS: StickerId[] = ['yes', 'ooh', 'heart', 'bolt', 'flower', 'smiley']

/** Stickers that slap onto the cabinet when you're into something. */
export function Celebrations({ cheers }: { cheers: Cheer[] }) {
  return (
    <div className="cheers" aria-hidden="true">
      <AnimatePresence>
        {cheers.map((c) => (
          <motion.div
            key={c.id}
            className="cheer"
            style={{ left: `${c.x}%`, top: `${c.y}%` }}
            initial={{ scale: 2.2, rotate: c.r - 30, opacity: 0 }}
            animate={{ scale: 1, rotate: c.r, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0, y: -30, transition: { duration: 0.25 } }}
            transition={spring.bouncy}
          >
            {c.big ? (
              <div className="cheer__big">
                <Sticker id="new" size={150} />
                <span className="pixel cheer__label">+1 collected</span>
              </div>
            ) : (
              <Sticker id={c.sticker} size={104} />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
