import { MemoryStorage } from '@puregram/storage'
import { Telegram } from 'puregram'
import { describe, expect, it, vi } from 'vitest'

import { session } from '../src/session'
import { TTL_KEY, TTL_SYM, ttl, type TtlWrapped } from '../src/ttl'
import type { SessionContext } from '../src/types'

const STUB_BOT = { id: 1, is_bot: true as const, first_name: 'bot', username: 'testbot' }

const NOW = 1_700_000_000_000

// one long-lived telegram + storage pair per test, dispatched several times, so every
// ttl assertion crosses a real storage round trip instead of reading back the same object
const makeHarness = async () => {
  const storage = new MemoryStorage()
  const t = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(session({ storage }))

  await t.start()

  let handler: (s: SessionContext) => void = () => {}

  t.defineUpdate('ttlprobe')
  t.on('ttlprobe', (u) => {
    // custom kinds aren't covered by the codegen'd augmentations, but the plugin attaches `session` all the same
    const update = u as unknown as { session: SessionContext }

    handler(update.session)
  })

  const dispatch = (fn: (s: SessionContext) => void) => {
    const { promise, resolve } = Promise.withResolvers<void>()

    handler = fn
    t.emit('ttlprobe', { from: { id: 7 } })
    setImmediate(resolve)

    return promise
  }

  return { storage, t, dispatch }
}

describe('ttl()', () => {
  it('wraps a value with TTL_SYM, value, and t fields', () => {
    const wrapped = ttl({ a: 1 }, 5_000) as unknown as TtlWrapped<{ a: number }>

    expect(wrapped[TTL_SYM]).toBe(true)
    expect(wrapped.value).toEqual({ a: 1 })
    expect(wrapped.t).toBe(5_000)
  })

  it('default t is 30_000ms', () => {
    const wrapped = ttl('hello') as unknown as TtlWrapped<string>

    expect(wrapped.t).toBe(30_000)
  })

  it('throws if t < 0', () => {
    expect(() => ttl('x', -1)).toThrow()
  })

  it('t = 0 is allowed (treated as "no ttl" / clear by middleware)', () => {
    const wrapped = ttl('x', 0) as unknown as TtlWrapped<string>

    expect(wrapped.t).toBe(0)
  })
})

describe('ttl() — across dispatches', () => {
  it('persists ttl metadata alongside the payload', async () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(NOW)
    const { storage, t, dispatch } = await makeHarness()

    await dispatch((s) => {
      s.x = ttl('v', 1_000)
    })

    expect(await storage.get('user:7')).toEqual({ x: 'v', [TTL_KEY]: { x: { t: 1_000, at: NOW } } })

    now.mockRestore()
    await t.shutdown()
  })

  it('expires a value once the window elapses in a later dispatch', async () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(NOW)
    const { t, dispatch } = await makeHarness()

    await dispatch((s) => {
      s.x = ttl('v', 1_000)
    })

    now.mockReturnValue(NOW + 1_001)

    let read: unknown = 'unread'

    await dispatch((s) => {
      read = s.x
    })

    expect(read).toBeUndefined()

    now.mockRestore()
    await t.shutdown()
  })

  it('keeps a value readable in a later dispatch while the window is open', async () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(NOW)
    const { t, dispatch } = await makeHarness()

    await dispatch((s) => {
      s.x = ttl('v', 1_000)
    })

    now.mockReturnValue(NOW + 999)

    let read: unknown

    await dispatch((s) => {
      read = s.x
    })

    expect(read).toBe('v')

    now.mockRestore()
    await t.shutdown()
  })

  it('does not expose the metadata key on update.session', async () => {
    const { t, dispatch } = await makeHarness()

    await dispatch((s) => {
      s.x = ttl('v', 1_000)
    })

    let keys: string[] = []

    await dispatch((s) => {
      keys = Object.keys(s)
    })

    expect(keys).toEqual(['x'])

    await t.shutdown()
  })

  it('deletes the storage record when only metadata would be left', async () => {
    const { storage, t, dispatch } = await makeHarness()

    await dispatch((s) => {
      s.x = ttl('v', 1_000)
    })

    await dispatch((s) => {
      delete s.x
    })

    expect(await storage.get('user:7')).toBeUndefined()

    await t.shutdown()
  })

  it('drops metadata whose key is gone from the payload', async () => {
    const { storage, t, dispatch } = await makeHarness()

    await storage.set('user:7', { x: 1, [TTL_KEY]: { gone: { t: 1_000, at: Date.now() } } })

    await dispatch((s) => {
      s.y = 2
    })

    expect(await storage.get('user:7')).toEqual({ x: 1, y: 2 })

    await t.shutdown()
  })

  it('t = 0 clears a ttl persisted by an earlier dispatch', async () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(NOW)
    const { t, dispatch } = await makeHarness()

    await dispatch((s) => {
      s.x = ttl('v', 1_000)
    })

    await dispatch((s) => {
      s.x = ttl('v2', 0)
    })

    now.mockReturnValue(NOW + 5_000)

    let read: unknown

    await dispatch((s) => {
      read = s.x
    })

    expect(read).toBe('v2')

    now.mockRestore()
    await t.shutdown()
  })
})
