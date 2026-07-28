import { describe, expect, it } from 'vitest'

import { BucketRegistry, createWindow } from '../src/buckets'

describe('createWindow — sliding window', () => {
  it('allows up to `limit` recordings without wait', () => {
    const w = createWindow(3, 1_000)

    expect(w.msUntilSlot(0)).toBe(0)
    w.record(0)
    expect(w.msUntilSlot(10)).toBe(0)
    w.record(10)
    expect(w.msUntilSlot(20)).toBe(0)
    w.record(20)

    // 4th must wait until the oldest (t=0) expires at t=1000
    expect(w.msUntilSlot(30)).toBe(0 + 1_000 - 30)
  })

  it('drops expired timestamps so freed slots reopen', () => {
    const w = createWindow(2, 1_000)

    w.record(0)
    w.record(500)

    expect(w.msUntilSlot(600)).toBe(0 + 1_000 - 600)

    // at t=1_001 the t=0 stamp is expired
    expect(w.msUntilSlot(1_001)).toBe(0)
    expect(w.size(1_001)).toBe(1)
  })

  it('size reflects pruning', () => {
    const w = createWindow(5, 1_000)

    w.record(0)
    w.record(200)
    w.record(400)

    expect(w.size(0)).toBe(3)
    expect(w.size(1_001)).toBe(2)
    expect(w.size(1_201)).toBe(1)
    expect(w.size(1_401)).toBe(0)
  })

  it('zero-wait when window is empty', () => {
    const w = createWindow(1, 60_000)

    expect(w.msUntilSlot(123)).toBe(0)
  })
})

describe('BucketRegistry', () => {
  it('lazily creates one window per key', () => {
    const reg = new BucketRegistry(2, 1_000)
    const a = reg.get('a')
    const b = reg.get('b')

    expect(a).not.toBe(b)
    expect(reg.get('a')).toBe(a)
    expect(reg.count).toBe(2)
  })

  it('sweep removes empty windows', () => {
    const reg = new BucketRegistry(1, 1_000)

    reg.get('a').record(0)
    reg.get('b').record(0)

    expect(reg.count).toBe(2)

    reg.sweep(2_000)

    expect(reg.count).toBe(0)
  })

  it('sweep keeps windows that still hold live stamps', () => {
    const reg = new BucketRegistry(1, 1_000)

    reg.get('a').record(0)
    reg.get('b').record(900)

    reg.sweep(1_500)

    expect(reg.count).toBe(1)
    expect(reg.get('b').size(1_500)).toBe(1)
  })
})
