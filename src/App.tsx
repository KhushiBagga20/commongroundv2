import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router'
import { AnimatePresence } from 'motion/react'
import { AppShell } from '@/components/layout/AppShell'
import { PageShell } from '@/components/layout/PageShell'
import { channelFor } from '@/components/layout/spaces'
import { SpaceLoader } from '@/components/ui/bits'

const loaders = {
  playground: () => import('@/spaces/playground/PlaygroundPage'),
  swipe: () => import('@/spaces/swipe/SwipeMachinePage'),
  rabbit: () => import('@/spaces/rabbit-hole/RabbitHolePage'),
  clubhouse: () => import('@/spaces/clubhouse/ClubhousePage'),
  room: () => import('@/spaces/clubhouse/RoomPage'),
  collection: () => import('@/spaces/collection/CollectionPage'),
}

const PlaygroundPage = lazy(loaders.playground)
const SwipeMachinePage = lazy(loaders.swipe)
const RabbitHolePage = lazy(loaders.rabbit)
const ClubhousePage = lazy(loaders.clubhouse)
const RoomPage = lazy(loaders.room)
const CollectionPage = lazy(loaders.collection)

/** Warm the other spaces once the first one is idle, so channel changes never wait on the network. */
function usePrefetchSpaces() {
  useEffect(() => {
    const run = () => Object.values(loaders).forEach((load) => void load())
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number }
    const id = w.requestIdleCallback ? w.requestIdleCallback(run) : window.setTimeout(run, 1500)
    return () => {
      if (!w.requestIdleCallback) window.clearTimeout(id)
    }
  }, [])
}

function AnimatedRoutes() {
  const location = useLocation()
  const meta = channelFor(location.pathname)
  usePrefetchSpaces()

  return (
    <AnimatePresence mode="wait" initial={false} custom={{ next: meta }} onExitComplete={() => window.scrollTo(0, 0)}>
      <PageShell key={meta.key} meta={meta}>
        <Suspense fallback={<SpaceLoader />}>
          <Routes location={location}>
            <Route path="/" element={<PlaygroundPage />} />
            <Route path="/swipe" element={<SwipeMachinePage />} />
            <Route path="/rabbit-hole" element={<RabbitHolePage />} />
            <Route path="/clubhouse" element={<ClubhousePage />} />
            <Route path="/clubhouse/:roomId" element={<RoomPage />} />
            <Route path="/collection" element={<CollectionPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </PageShell>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <AnimatedRoutes />
      </AppShell>
    </BrowserRouter>
  )
}
