import { Telegram } from 'puregram'
import { describe, expect, it, vi } from 'vitest'

import { session } from '../src/session'
import { MemoryStorage } from '../src/storage/memory'

// declare-merge custom test kinds so tg.on('probe', h) typechecks without per-call casts
// (each interface uses index signature first to keep member-ordering happy.)
interface ProbeUpdate {
  [key: string]: unknown
  kind: 'probe'
}

interface OrphanUpdate {
  kind: 'orphan'
  x: number
}

interface ReadonlyKindUpdate {
  kind: 'readonly'
  from?: { id: number }
}

interface PriorityUpdate {
  kind: 'priority'
  from?: { id: number }
  senderChat?: { id: number }
  chat?: { id: number }
}

interface AnyKindUpdate {
  kind: 'any'
  from?: { id: number }
}

interface SeedUpdate {
  kind: 'seed'
  from?: { id: number }
}

interface IdempotentUpdate {
  kind: 'idempotent'
  from?: { id: number }
}

declare module '@puregram/api' {
  interface UpdateKindMap {
    probe: ProbeUpdate
    orphan: OrphanUpdate
    readonly: ReadonlyKindUpdate
    priority: PriorityUpdate
    any: AnyKindUpdate
    seed: SeedUpdate
    idempotent: IdempotentUpdate
  }
}

const STUB_BOT = { id: 1, is_bot: true as const, first_name: 'bot', username: 'testbot' }

const makeTg = (storage = new MemoryStorage()) =>
  new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(session({ storage }))

describe('session() — install shape', () => {
  it('returns { get, set, delete } under tg.session', async () => {
    const t = makeTg()

    await t.start()

    expect(typeof t.session.get).toBe('function')
    expect(typeof t.session.set).toBe('function')
    expect(typeof t.session.delete).toBe('function')

    await t.shutdown()
  })

  it('tg.session.set/get round-trips through the configured storage', async () => {
    const storage = new MemoryStorage()
    const t = makeTg(storage)

    await t.start()
    await t.session.set('user:1', { counter: 0 })

    expect(await t.session.get('user:1')).toEqual({ counter: 0 })
    expect(await storage.get('user:1')).toEqual({ counter: 0 })

    await t.shutdown()
  })

  it('tg.session.delete removes the entry', async () => {
    const t = makeTg()

    await t.start()
    await t.session.set('k', 1)
    await t.session.delete('k')

    expect(await t.session.get('k')).toBeUndefined()

    await t.shutdown()
  })
})

describe('session() — onUpdate middleware', () => {
  it('attaches update.session and persists writes after next()', async () => {
    const storage = new MemoryStorage()
    const t = makeTg(storage)

    await t.start()

    t.defineUpdate('probe')
    t.on('probe', (u: any) => {
      u.session.counter = ((u.session.counter as number | undefined) ?? 0) + 1
    })

    t.emit('probe', { from: { id: 7 } })
    await new Promise(resolve => setImmediate(resolve))

    expect(await storage.get('7')).toEqual({ counter: 1 })

    t.emit('probe', { from: { id: 7 } })
    await new Promise(resolve => setImmediate(resolve))

    expect(await storage.get('7')).toEqual({ counter: 2 })

    await t.shutdown()
  })

  it('skips updates whose getStorageKey returns undefined (no session attached)', async () => {
    const storage = new MemoryStorage()
    const setSpy = vi.spyOn(storage, 'set')

    const t = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(session({ storage }))

    await t.start()

    t.defineUpdate('orphan')

    let received: any

    t.on('orphan', (u: any) => {
      received = u
    })

    t.emit('orphan', { x: 1 })
    await new Promise(resolve => setImmediate(resolve))

    expect(received.session).toBeUndefined()
    expect(setSpy).not.toHaveBeenCalled()

    await t.shutdown()
  })

  it('does not flush when nothing changed (touch instead)', async () => {
    const storage = new MemoryStorage()

    await storage.set('7', { existing: true })

    const setSpy = vi.spyOn(storage, 'set')
    const touchSpy = vi.spyOn(storage, 'touch')

    const t = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(session({ storage }))

    await t.start()

    t.defineUpdate('readonly')
    t.on('readonly', (u: any) => {
      const _read = u.session.existing as boolean

      return _read
    })

    setSpy.mockClear()
    t.emit('readonly', { from: { id: 7 } })
    await new Promise(resolve => setImmediate(resolve))

    expect(setSpy).not.toHaveBeenCalled()
    expect(touchSpy).toHaveBeenCalledWith('7')

    await t.shutdown()
  })

  it('default getStorageKey: from.id wins over senderChat.id wins over chat.id', async () => {
    const storage = new MemoryStorage()
    const t = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(session({ storage }))

    await t.start()

    t.defineUpdate('priority')
    t.on('priority', (u: any) => {
      u.session.hit = true
    })

    t.emit('priority', { from: { id: 1 }, senderChat: { id: 2 }, chat: { id: 3 } })
    await new Promise(resolve => setImmediate(resolve))

    expect(await storage.get('1')).toEqual({ hit: true })
    expect(await storage.get('2')).toBeUndefined()
    expect(await storage.get('3')).toBeUndefined()

    t.emit('priority', { senderChat: { id: 2 }, chat: { id: 3 } })
    await new Promise(resolve => setImmediate(resolve))

    expect(await storage.get('2')).toEqual({ hit: true })

    t.emit('priority', { chat: { id: 3 } })
    await new Promise(resolve => setImmediate(resolve))

    expect(await storage.get('3')).toEqual({ hit: true })

    await t.shutdown()
  })

  it('user-supplied getStorageKey overrides the default', async () => {
    const storage = new MemoryStorage()
    const t = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(session({
      storage,
      getStorageKey: () => 'global'
    }))

    await t.start()

    t.defineUpdate('any')
    t.on('any', (u: any) => {
      u.session.shared = true
    })

    t.emit('any', { from: { id: 1 } })
    await new Promise(resolve => setImmediate(resolve))

    expect(await storage.get('global')).toEqual({ shared: true })
    expect(await storage.get('1')).toBeUndefined()

    await t.shutdown()
  })

  it('initial(update) seeds the session when storage is empty', async () => {
    const storage = new MemoryStorage()
    const t = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(session({
      storage,
      initial: () => ({ counter: 100 })
    }))

    await t.start()

    t.defineUpdate('seed')
    t.on('seed', (u: any) => {
      u.session.counter = (u.session.counter as number) + 1
    })

    t.emit('seed', { from: { id: 9 } })
    await new Promise(resolve => setImmediate(resolve))

    expect(await storage.get('9')).toEqual({ counter: 101 })

    await t.shutdown()
  })

  it('exposes $forceUpdate on the proxy', async () => {
    const storage = new MemoryStorage()
    const t = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(session({ storage }))

    await t.start()

    t.defineUpdate('idempotent')

    let firstSession: unknown

    t.on('idempotent', (u: any) => {
      firstSession = u.session
    })

    t.emit('idempotent', { from: { id: 1 } })
    await new Promise(resolve => setImmediate(resolve))

    expect(typeof (firstSession as any).$forceUpdate).toBe('function')

    await t.shutdown()
  })
})
