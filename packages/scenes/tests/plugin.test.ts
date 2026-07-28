import { session } from '@puregram/session'
import { MemoryStorage } from '@puregram/storage'
import { Telegram } from 'puregram'
import { describe, expect, it, vi } from 'vitest'

import type { SceneContext } from '../src/contexts/scene'
import { scenes } from '../src/plugin'
import { StepScene } from '../src/scenes/step'

interface ProbeUpdate {
  [key: string]: unknown
  kind: 'probe'
  from?: { id: number }
  chat?: { id: number }
}

interface OrphanUpdate {
  kind: 'orphan'
  x: number
}

interface WizardState {
  name: string
}

interface SceneProbe {
  scene: SceneContext<WizardState>
}

interface StoredScene {
  __scene?: { current?: string, state?: { name?: string } }
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
  it('attaches update.scene when the update carries a session', async () => {
    const t = makeTg()

    await t.start()

    let received: any

    t.defineUpdate('probe')
    t.on('probe', (u: any) => {
      received = u
    })

    t.emit('probe', { from: { id: 7 } })
    await new Promise(resolve => setImmediate(resolve))

    expect(received.scene).toBeDefined()
    expect(typeof received.scene.enter).toBe('function')
    await t.shutdown()
  })

  it('does not attach update.scene when the update has no session', async () => {
    const t = makeTg()

    await t.start()

    let received: any

    t.defineUpdate('orphan')
    t.on('orphan', (u: any) => {
      received = u
    })

    t.emit('orphan', { x: 1 })
    await new Promise(resolve => setImmediate(resolve))

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

    await t.session.set('user:7', { __scene: { current: 'wizard' } })

    const userHandler = vi.fn()

    t.defineUpdate('probe')
    t.on('probe', userHandler)

    t.emit('probe', { from: { id: 7 } })
    await new Promise(resolve => setImmediate(resolve))

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
    await new Promise(resolve => setImmediate(resolve))

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
    t.on('probe', async (u: any) => {
      await u.scene.enter('wizard')
    })

    t.emit('probe', { from: { id: 7 } })
    await new Promise(resolve => setImmediate(resolve))

    const stored = await t.session.get('user:7') as { __scene?: { current?: string } } | undefined

    expect(stored?.__scene?.current).toBe('wizard')
    await t.shutdown()
  })

  it('passthrough predicate lets matching updates skip scene reentry', async () => {
    const enter = vi.fn()
    const wizard = new StepScene('wizard', { enterHandler: enter, steps: [] })
    const t = new Telegram({ token: 'TEST', bot: STUB_BOT })
      .extend(session())
      .extend(scenes({
        scenes: [wizard],
        passthrough: (u: any) => u.text === '/whoami'
      }))

    await t.start()
    await t.session.set('user:7', { __scene: { current: 'wizard' } })

    const userHandler = vi.fn()

    t.defineUpdate('probe')
    t.on('probe', userHandler)

    // matches passthrough — user handler runs, scene does NOT reenter
    t.emit('probe', { from: { id: 7 }, text: '/whoami' })
    await new Promise(resolve => setImmediate(resolve))

    expect(userHandler).toHaveBeenCalledTimes(1)
    expect(enter).not.toHaveBeenCalled()
    expect((userHandler.mock.calls[0]?.[0] as { scene?: unknown }).scene).toBeDefined()

    // does not match — scene reenters as usual
    t.emit('probe', { from: { id: 7 }, text: 'hello' })
    await new Promise(resolve => setImmediate(resolve))

    expect(enter).toHaveBeenCalledTimes(1)
    expect(userHandler).toHaveBeenCalledTimes(1)

    await t.shutdown()
  })

  it("round-trips scene state through session's composite storage key", async () => {
    const storage = new MemoryStorage()
    const seen: (string | undefined)[] = []
    const wizard = new StepScene<WizardState>('wizard', [
      (ctx) => {
        seen.push(ctx.scene.state.name)
      }
    ])
    const makeBot = () => new Telegram({ token: 'TEST', bot: STUB_BOT })
      .extend(session({ storage }))
      .extend(scenes({ scenes: [wizard] }))

    const writer = makeBot()

    await writer.start()
    writer.defineUpdate('probe')
    writer.on('probe', u => (u as unknown as SceneProbe).scene.enter('wizard', { state: { name: 'alice' } }))

    writer.emit('probe', { from: { id: 7 }, chat: { id: -100 } })
    await new Promise(resolve => setImmediate(resolve))
    await writer.shutdown()

    const stored = await storage.get('user:7:chat:-100') as StoredScene | undefined

    expect(stored?.__scene?.current).toBe('wizard')
    expect(stored?.__scene?.state?.name).toBe('alice')
    // scenes rides session's key — nothing is written under a scenes-specific one
    expect(await storage.get('user:7')).toBeUndefined()

    const reader = makeBot()

    await reader.start()
    reader.defineUpdate('probe')

    reader.emit('probe', { from: { id: 7 }, chat: { id: -100 } })
    await new Promise(resolve => setImmediate(resolve))

    // second entry comes from a bot that only ever saw the stored record
    expect(seen).toEqual(['alice', 'alice'])

    await reader.shutdown()
  })
})
