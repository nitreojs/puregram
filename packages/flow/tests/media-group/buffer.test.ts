import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { MediaGroupBuffer } from '../../src/media-group/buffer'

describe('MediaGroupBuffer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('flushes after the window with all accumulated messages', () => {
    const emits: { id: string, count: number }[] = []
    const buf = new MediaGroupBuffer(1000, (id, messages) => {
      emits.push({ id, count: messages.length })
    })

    buf.add('group-a', { raw: { media_group_id: 'group-a', text: '1' } } as any)
    buf.add('group-a', { raw: { media_group_id: 'group-a', text: '2' } } as any)
    buf.add('group-a', { raw: { media_group_id: 'group-a', text: '3' } } as any)

    expect(emits).toHaveLength(0)

    vi.advanceTimersByTime(1000)

    expect(emits).toEqual([{ id: 'group-a', count: 3 }])
  })

  it('keeps separate buckets for different ids and flushes independently', () => {
    const emits: string[] = []
    const buf = new MediaGroupBuffer(1000, id => {
      emits.push(id)
    })

    buf.add('a', { raw: { media_group_id: 'a' } } as any)

    vi.advanceTimersByTime(500)

    buf.add('b', { raw: { media_group_id: 'b' } } as any)

    vi.advanceTimersByTime(500)

    expect(emits).toEqual(['a'])

    vi.advanceTimersByTime(500)

    expect(emits).toEqual(['a', 'b'])
  })

  it('flushAll forces immediate emission for all buckets', () => {
    const emits: string[] = []
    const buf = new MediaGroupBuffer(10_000, id => {
      emits.push(id)
    })

    buf.add('a', { raw: { media_group_id: 'a' } } as any)
    buf.add('b', { raw: { media_group_id: 'b' } } as any)

    buf.flushAll()

    expect(emits.sort()).toEqual(['a', 'b'])
  })

  it('does not double-emit if flushAll is called after a window already fired', () => {
    const emits: string[] = []
    const buf = new MediaGroupBuffer(1000, id => {
      emits.push(id)
    })

    buf.add('a', { raw: { media_group_id: 'a' } } as any)

    vi.advanceTimersByTime(1000)

    expect(emits).toEqual(['a'])

    buf.flushAll()

    expect(emits).toEqual(['a'])
  })
})
