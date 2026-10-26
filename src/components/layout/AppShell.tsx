import type { ReactNode } from 'react'
import { MotionConfig } from 'motion/react'
import { useCalmAttribute } from '@/motion/calm'
import { HobbyDossier } from '../hobby/HobbyDossier'
import { PassDialog } from '../pass/PassDialog'
import { Toasts } from '../ui/Toasts'
import { CursorAura } from './CursorAura'
import { HelpDialog } from './HelpDialog'
import { Keydeck } from './Keydeck'
import { Masthead } from './Masthead'
import { PartyLayer, useAchievementWatcher, useSecrets, useVisibilityAttribute } from './Watchers'

/** Everything that persists across spaces: chrome, overlays, watchers. */
export function AppShell({ children }: { children: ReactNode }) {
  const calm = useCalmAttribute()
  useVisibilityAttribute()
  useAchievementWatcher()
  useSecrets()

  return (
    <MotionConfig reducedMotion={calm ? 'always' : 'never'}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Masthead />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Keydeck />
      <HobbyDossier />
      <PassDialog />
      <HelpDialog />
      <Toasts />
      <PartyLayer />
      <CursorAura />
    </MotionConfig>
  )
}
