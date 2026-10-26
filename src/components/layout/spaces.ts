import { DoorOpen, Layers, Shapes, Stamp, Waypoints } from 'lucide-react'
import { C } from '@/data/palette'
import { getRoom } from '@/data/repository'

export interface Space {
  id: 'playground' | 'swipe' | 'rabbit-hole' | 'clubhouse' | 'collection'
  path: string
  no: string
  name: string
  short: string
  hint: string
  /** key cap + LED colour */
  color: string
  /** LED colour when the key is active */
  led: string
  /** channel-change curtain */
  curtain: string
  curtainFg: string
  Icon: typeof Shapes
}

export const SPACES: Space[] = [
  {
    id: 'playground',
    path: '/',
    no: '01',
    name: 'Playground',
    short: 'Home',
    hint: 'The interactive poster. Start here.',
    color: C.butter,
    led: C.tangerine,
    curtain: C.butter,
    curtainFg: C.ink,
    Icon: Shapes,
  },
  {
    id: 'swipe',
    path: '/swipe',
    no: '02',
    name: 'Swipe Machine',
    short: 'Swipe',
    hint: 'Swipe hobby cards: right for into it.',
    color: C.acid,
    led: C.electric,
    curtain: C.ink,
    curtainFg: C.acid,
    Icon: Layers,
  },
  {
    id: 'rabbit-hole',
    path: '/rabbit-hole',
    no: '03',
    name: 'Rabbit Hole',
    short: 'Explore',
    hint: 'A map of how hobbies connect.',
    color: C.lavender,
    led: C.acid,
    curtain: C.teal,
    curtainFg: C.butter,
    Icon: Waypoints,
  },
  {
    id: 'clubhouse',
    path: '/clubhouse',
    no: '04',
    name: 'Clubhouse',
    short: 'Rooms',
    hint: 'Communities, one room each.',
    color: C.tangerine,
    led: C.acid,
    curtain: C.tangerine,
    curtainFg: C.ink,
    Icon: DoorOpen,
  },
  {
    id: 'collection',
    path: '/collection',
    no: '05',
    name: 'Collection',
    short: 'You',
    hint: 'Your scrapbook of curiosities.',
    color: C.bubblegum,
    led: C.acid,
    curtain: C.bubblegum,
    curtainFg: C.ink,
    Icon: Stamp,
  },
]

export function spaceFor(pathname: string): Space {
  const seg = pathname.split('/')[1] ?? ''
  return SPACES.find((s) => s.path === `/${seg}`) ?? SPACES[0]
}

export interface ChannelMeta {
  key: string
  no: string
  name: string
  color: string
  fg: string
}

/** What the channel-change curtain should show for a given location. */
export function channelFor(pathname: string): ChannelMeta {
  const [, seg, sub] = pathname.split('/')
  const space = spaceFor(pathname)
  if (seg === 'clubhouse' && sub) {
    const room = getRoom(sub)
    if (room) return { key: `/clubhouse/${sub}`, no: '04', name: room.name.replace(/^The /, ''), color: room.identity.bg, fg: room.identity.fg }
  }
  return { key: space.path, no: space.no, name: space.name, color: space.curtain, fg: space.curtainFg }
}
