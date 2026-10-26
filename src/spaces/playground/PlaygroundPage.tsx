import { CuriositySlot } from './CuriositySlot'
import { Hero } from './Hero'
import { HowItWorks } from './HowItWorks'
import { RoomsReel } from './RoomsReel'
import { StickerBoard } from './StickerBoard'

/** Space 01 — the interactive poster that introduces the universe. */
export default function PlaygroundPage() {
  return (
    <div className="pg">
      <Hero />
      <CuriositySlot />
      <HowItWorks />
      <RoomsReel />
      <StickerBoard />
    </div>
  )
}
