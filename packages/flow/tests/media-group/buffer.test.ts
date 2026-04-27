import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { MediaGroupBuffer } from '../../src/media-group/buffer'

const fakeMessage = (id: string, text: string) => (
  { raw: { media_group_id: id, text } } as any
)

describe('MediaGroupBuffer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('resolves with all accumulated messages once the window settles', async () => {
    const buf = new MediaGroupBuffer()
    const m1 = fakeMessage('a', '1')
    const m2 = fakeMessage('a', '2')

    const p = buf.collect('a', m1, 1000)

    buf.collect('a', m2, 1000)

    let resolved: any[] | null = null

    p.then((m) => {
      resolved = m
    })

    expect(resolved).toBeNull()

    vi.advanceTimersByTime(1000)
    await Promise.resolve()
    await Promise.resolve()

    expect(resolved).toEqual([m1, m2])
  })

  it('resets the timer on each subsequent collect (sliding window)', async () => {
    const buf = new MediaGroupBuffer()
    const m1 = fakeMessage('a', '1')
    const m2 = fakeMessage('a', '2')

    const p = buf.collect('a', m1, 1000)

    let resolved: any[] | null = null

    p.then((m) => {
      resolved = m
    })

    vi.advanceTimersByTime(800)
    buf.collect('a', m2, 1000)
    vi.advanceTimersByTime(800)
    await Promise.resolve()

    // total elapsed: 1600ms, but timer was reset at 800ms — still pending
    expect(resolved).toBeNull()

    vi.advanceTimersByTime(200)
    await Promise.resolve()
    await Promise.resolve()

    expect(resolved).toEqual([m1, m2])
  })

  it('returns the same promise for repeated collects on the same id', () => {
    const buf = new MediaGroupBuffer()
    const m = fakeMessage('a', 'x')

    const a = buf.collect('a', m, 1000)
    const b = buf.collect('a', m, 1000)

    expect(a).toBe(b)
  })

  it('keeps separate buckets per id and resolves them independently', async () => {
    const buf = new MediaGroupBuffer()

    const pa = buf.collect('a', fakeMessage('a', '1'), 1000)
    const pb = buf.collect('b', fakeMessage('b', '1'), 1000)

    let aDone = false
    let bDone = false

    pa.then(() => {
      aDone = true
    })
    pb.then(() => {
      bDone = true
    })

    vi.advanceTimersByTime(1000)
    await Promise.resolve()
    await Promise.resolve()

    expect(aDone).toBe(true)
    expect(bDone).toBe(true)
  })

  it('flushAll resolves every pending bucket immediately', async () => {
    const buf = new MediaGroupBuffer()

    const pa = buf.collect('a', fakeMessage('a', '1'), 60_000)
    const pb = buf.collect('b', fakeMessage('b', '1'), 60_000)

    buf.flushAll()

    await expect(pa).resolves.toHaveLength(1)
    await expect(pb).resolves.toHaveLength(1)
  })

  it('dedupes when the same message is collected twice', async () => {
    const buf = new MediaGroupBuffer()
    const m = fakeMessage('a', '1')

    const p = buf.collect('a', m, 1000)

    buf.collect('a', m, 1000)

    let resolved: any[] | null = null

    p.then((messages) => {
      resolved = messages
    })

    vi.advanceTimersByTime(1000)
    await Promise.resolve()
    await Promise.resolve()

    expect(resolved).toHaveLength(1)
  })
})
