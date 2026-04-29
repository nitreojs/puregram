import { session } from '@puregram/session'
import { Telegram } from 'puregram'
import { describe, expect, it, vi } from 'vitest'

import { scenes } from '../src/scenes'
import { StepScene } from '../src/scenes/step'

interface ProbeUpdate {
  [key: string]: unknown
  kind: 'probe'
  from?: { id: number }
}

interface OrphanUpdate {
  kind: 'orphan'
  x: number
}

declare module '@puregram/api' {
  interface UpdateKindMap {
    probe: ProbeUpdate
    orphan: OrphanUpdate
  }
}

const STUB_BOT = { id: 1, is_bot: true as const, first_name: 'bot', username: 'testbot' }

const makeTg = () => new Telegram({ token: 'TEST', bot: STUB_BOT })
  .extend(session())
  .extend(scenes())

describe('scenes() — install shape', () => {
  it('throws if session is not installed (dependsOn enforcement)', async () => {
    const t = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(scenes())
    await expect(t.start()).rejects.toThrow(/session|depends/i)
  })

  it('returns { add, has, remove, all } under tg.scenes', async () => {
    const t = makeTg()
    await t.start()
    expect(typeof t.scenes.add).toBe('function')
    expect(typeof t.scenes.has).toBe('function')
    expect(typeof t.scenes.remove).toBe('function')
    expect(typeof t.scenes.all).toBe('function')
    await t.shutdown()
  })

  it('seeds the manager from options.scenes', async () => {
    const wizard = new StepScene('wizard', [() => {}])
    const t = new Telegram({ token: 'TEST', bot: STUB_BOT })
      .extend(session())
      .extend(scenes({ scenes: [wizard] }))
    await t.start()
    expect(t.scenes.has('wizard')).toBe(true)
    await t.shutdown()
  })

  it('tg.scenes.add throws on duplicate slug', async () => {
    const wizard = new StepScene('wizard', [() => {}])
    const t = makeTg()
    await t.start()
    t.scenes.add(wizard)
    expect(() => t.scenes.add(wizard)).toThrow()
    await t.shutdown()
  })
})

describe('scenes() — onUpdate middleware', () => {
  it('attaches update.scene when the storage key resolves', async () => {
    const t = makeTg()
    await t.start()

    let received: any
    t.defineUpdate('probe')
    t.on('probe', (u: any) => { received = u })

    t.emit('probe', { from: { id: 7 } })
    await new Promise(r => setImmediate(r))

    expect(received.scene).toBeDefined()
    expect(typeof received.scene.enter).toBe('function')
    await t.shutdown()
  })

  it('does not attach update.scene when the storage key is undefined', async () => {
    const t = makeTg()
    await t.start()

    let received: any
    t.defineUpdate('orphan')
    t.on('orphan', (u: any) => { received = u })

    t.emit('orphan', { x: 1 })
    await new Promise(r => setImmediate(r))

    expect(received.scene).toBeUndefined()
    await t.shutdown()
  })

  it('reenters the active scene and consumes the update (no user handler)', async () => {
    const enter = vi.fn()
    const wizard = new StepScene('wizard', { enterHandler: enter, steps: [] })
    const t = new Telegram({ token: 'TEST', bot: STUB_BOT })
      .extend(session())
      .extend(scenes({ scenes: [wizard] }))
    await t.start()

    await t.session.set('7', { __scene: { current: 'wizard' } })

    const userHandler = vi.fn()
    t.defineUpdate('probe')
    t.on('probe', userHandler)

    t.emit('probe', { from: { id: 7 } })
    await new Promise(r => setImmediate(r))

    expect(enter).toHaveBeenCalled()
    expect(userHandler).not.toHaveBeenCalled()
    await t.shutdown()
  })

  it('does not consume the update when no scene is active (next() runs)', async () => {
    const t = makeTg()
    await t.start()

    const userHandler = vi.fn()
    t.defineUpdate('probe')
    t.on('probe', userHandler)

    t.emit('probe', { from: { id: 7 } })
    await new Promise(r => setImmediate(r))

    expect(userHandler).toHaveBeenCalled()
    await t.shutdown()
  })

  it('user handler can call update.scene.enter() and persist current to session', async () => {
    const wizard = new StepScene('wizard', [() => {}])
    const t = new Telegram({ token: 'TEST', bot: STUB_BOT })
      .extend(session())
      .extend(scenes({ scenes: [wizard] }))
    await t.start()

    t.defineUpdate('probe')
    t.on('probe', async (u: any) => { await u.scene.enter('wizard') })

    t.emit('probe', { from: { id: 7 } })
    await new Promise(r => setImmediate(r))

    const stored = await t.session.get('7') as { __scene?: { current?: string } } | undefined
    expect(stored?.__scene?.current).toBe('wizard')
    await t.shutdown()
  })
})
