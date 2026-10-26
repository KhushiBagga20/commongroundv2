import { beforeEach, describe, expect, it } from 'vitest'
import { hobbyCount } from '@/data/repository'
import { initialData, newlyUnlocked, useCollector } from './collector'

const s = () => useCollector.getState()

beforeEach(() => {
  localStorage.clear()
  useCollector.setState({ ...initialData() })
})

describe('collector store', () => {
  it('records swipes, and undo removes the most recent one', () => {
    s().setVerdict('pottery', 'into', { fromSwipe: true })
    s().setVerdict('chess', 'nah', { fromSwipe: true })
    expect(s().swipes).toBe(2)
    const ev = s().undo()
    expect(ev?.id).toBe('chess')
    expect(s().verdicts.chess).toBeUndefined()
    expect(s().verdicts.pottery?.v).toBe('into')
    expect(s().undos).toBe(1)
  })

  it('skips history entries changed elsewhere when undoing', () => {
    s().setVerdict('pottery', 'into', { fromSwipe: true })
    s().setVerdict('chess', 'nah', { fromSwipe: true })
    s().setVerdict('chess', 'later') // changed in the dossier, not by a swipe
    const ev = s().undo()
    expect(ev?.id).toBe('pottery')
    expect(s().verdicts.chess?.v).toBe('later')
  })

  it('brings skipped cards back on reshuffle-skipped', () => {
    s().setVerdict('pottery', 'nah', { fromSwipe: true })
    s().setVerdict('chess', 'into', { fromSwipe: true })
    s().resetSkipped()
    expect(s().verdicts.pottery).toBeUndefined()
    expect(s().verdicts.chess?.v).toBe('into')
  })

  it('joins and leaves rooms', () => {
    expect(s().toggleJoin('film-club')).toBe(true)
    expect(s().joined['film-club']).toBeTypeOf('number')
    expect(s().toggleJoin('film-club')).toBe(false)
    expect(s().joined['film-club']).toBeUndefined()
  })

  it('discovers a hobby once', () => {
    expect(s().discover('astronomy')).toBe(true)
    expect(s().discover('astronomy')).toBe(false)
  })

  it('keeps local posts marked as local', () => {
    const t = s().addThread('film-club', { title: '  Hello  ', body: 'hi', tag: 'chat' })
    expect(t.origin).toBe('local')
    expect(t.title).toBe('Hello')
    s().addReply(t.id, 'first!')
    expect(s().localReplies[t.id]).toHaveLength(1)
    s().removeThread(t.id)
    expect(s().localThreads).toHaveLength(0)
    expect(s().localReplies[t.id]).toBeUndefined()
  })

  it('persists to localStorage under a versioned key', () => {
    s().setVerdict('pottery', 'into')
    const raw = JSON.parse(localStorage.getItem('commonground:collector') ?? '{}')
    expect(raw.version).toBe(1)
    expect(raw.state.verdicts.pottery.v).toBe('into')
  })

  it('reports achievements that are newly satisfied', () => {
    expect(newlyUnlocked(s(), hobbyCount)).not.toContain('first-spark')
    s().setVerdict('pottery', 'into', { fromSwipe: true })
    expect(newlyUnlocked(s(), hobbyCount)).toContain('first-spark')
    useCollector.setState({ unlocked: { 'first-spark': Date.now() } })
    expect(newlyUnlocked(s(), hobbyCount)).not.toContain('first-spark')
  })

  it('resets everything but keeps the motion preference', () => {
    s().setMotion('calm')
    s().setVerdict('pottery', 'into')
    s().resetAll()
    expect(s().verdicts).toEqual({})
    expect(s().motion).toBe('calm')
  })
})
