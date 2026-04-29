import { describe, expect, it, vi } from 'vitest'

import { SceneContext, type ScenePayload } from '../../src/contexts/scene'
import { LastAction } from '../../src/contexts/scene.types'
import { SceneManager } from '../../src/manager'

const makePayload = (initial: Record<string, unknown> = {}): ScenePayload => {
  const session: Record<string, unknown> = { ...initial }

  return { session } as unknown as ScenePayload
}

describe('SceneContext', () => {
  it('current is undefined when session has no __scene', () => {
    const manager = new SceneManager()
    manager.add({ slug: 'foo', enterHandler: () => {}, leaveHandler: () => {} })

    const payload = makePayload()
    const ctx = new SceneContext({ payload, manager })

    expect(ctx.current).toBeUndefined()
  })

  it('current resolves when session.__scene.current is a known slug', () => {
    const manager = new SceneManager()
    const foo = { slug: 'foo', enterHandler: () => {}, leaveHandler: () => {} }
    manager.add(foo)

    const payload = makePayload({ __scene: { current: 'foo' } })
    const ctx = new SceneContext({ payload, manager })

    expect(ctx.current).toBe(foo)
  })

  it('enter() runs the scene enterHandler and persists current to session.__scene', async () => {
    const enterHandler = vi.fn()
    const manager = new SceneManager()
    manager.add({ slug: 'welcome', enterHandler, leaveHandler: () => {} })

    const payload = makePayload()
    const ctx = new SceneContext({ payload, manager })

    await ctx.enter('welcome')

    expect(enterHandler).toHaveBeenCalledWith(payload)
    expect((payload.session.__scene as { current?: string }).current).toBe('welcome')
    expect(ctx.lastAction).toBe(LastAction.Enter)
  })

  it('enter() throws on unknown slug', async () => {
    const manager = new SceneManager()
    const payload = makePayload()
    const ctx = new SceneContext({ payload, manager })

    await expect(ctx.enter('missing')).rejects.toThrow(/not found/)
  })

  it('enter() with silent: true skips the handler but still updates session.__scene', async () => {
    const enterHandler = vi.fn()
    const manager = new SceneManager()
    manager.add({ slug: 'welcome', enterHandler, leaveHandler: () => {} })

    const payload = makePayload()
    const ctx = new SceneContext({ payload, manager })

    await ctx.enter('welcome', { silent: true })

    expect(enterHandler).not.toHaveBeenCalled()
    expect((payload.session.__scene as { current?: string }).current).toBe('welcome')
  })

  it('enter() merges options.state into ctx.state', async () => {
    const manager = new SceneManager()
    manager.add({ slug: 'a', enterHandler: () => {}, leaveHandler: () => {} })

    const payload = makePayload()
    const ctx = new SceneContext({ payload, manager })

    await ctx.enter('a', { state: { name: 'alice' } as never })

    expect((ctx.state as unknown as Record<string, unknown>).name).toBe('alice')
  })

  it('reenter() throws when no current scene', async () => {
    const manager = new SceneManager()
    const payload = makePayload()
    const ctx = new SceneContext({ payload, manager })

    await expect(ctx.reenter()).rejects.toThrow(/no active scene/)
  })

  it('reenter() runs the current scene enterHandler again', async () => {
    const enterHandler = vi.fn()
    const manager = new SceneManager()
    manager.add({ slug: 'foo', enterHandler, leaveHandler: () => {} })

    const payload = makePayload({ __scene: { current: 'foo' } })
    const ctx = new SceneContext({ payload, manager })

    await ctx.reenter()

    expect(enterHandler).toHaveBeenCalled()
  })

  it('leave() runs leaveHandler and resets session.__scene', async () => {
    const leaveHandler = vi.fn()
    const manager = new SceneManager()
    manager.add({ slug: 'foo', enterHandler: () => {}, leaveHandler })

    const payload = makePayload({ __scene: { current: 'foo', state: { x: 1 } } })
    const ctx = new SceneContext({ payload, manager })

    await ctx.leave()

    expect(leaveHandler).toHaveBeenCalled()
    expect(ctx.lastAction).toBe(LastAction.Leave)
    expect(payload.session.__scene).toBeUndefined()
  })

  it('leave() with cancelled: true surfaces ctx.cancelled inside the leaveHandler', async () => {
    let observed: boolean | undefined
    const manager = new SceneManager()
    manager.add({
      slug: 'foo',
      enterHandler: () => {},
      leaveHandler: (p) => { observed = (p as { scene: { cancelled: boolean } }).scene.cancelled }
    })

    const payload = makePayload({ __scene: { current: 'foo' } })
    const ctx = new SceneContext({ payload, manager })
    ;(payload as { scene?: typeof ctx }).scene = ctx

    await ctx.leave({ cancelled: true })

    expect(observed).toBe(true)
  })

  it('leave() with silent: true skips the handler but still resets', async () => {
    const leaveHandler = vi.fn()
    const manager = new SceneManager()
    manager.add({ slug: 'foo', enterHandler: () => {}, leaveHandler })

    const payload = makePayload({ __scene: { current: 'foo' } })
    const ctx = new SceneContext({ payload, manager })

    await ctx.leave({ silent: true })

    expect(leaveHandler).not.toHaveBeenCalled()
    expect(payload.session.__scene).toBeUndefined()
  })

  it('reset() drops session.__scene', () => {
    const manager = new SceneManager()
    const payload = makePayload({ __scene: { current: 'foo', state: { x: 1 } } })
    const ctx = new SceneContext({ payload, manager })

    ctx.reset()

    expect(payload.session.__scene).toBeUndefined()
  })

  it('entering a different scene leaves the current one first', async () => {
    const aLeave = vi.fn()
    const bEnter = vi.fn()
    const manager = new SceneManager()
    manager.add({ slug: 'a', enterHandler: () => {}, leaveHandler: aLeave })
    manager.add({ slug: 'b', enterHandler: bEnter, leaveHandler: () => {} })

    const payload = makePayload({ __scene: { current: 'a' } })
    const ctx = new SceneContext({ payload, manager })
    ;(payload as { scene?: typeof ctx }).scene = ctx

    await ctx.enter('b')

    expect(aLeave).toHaveBeenCalled()
    expect(bEnter).toHaveBeenCalled()
    expect((payload.session.__scene as { current?: string }).current).toBe('b')
  })

  it('entering the current scene does NOT trigger leave', async () => {
    const aLeave = vi.fn()
    const aEnter = vi.fn()
    const manager = new SceneManager()
    manager.add({ slug: 'a', enterHandler: aEnter, leaveHandler: aLeave })

    const payload = makePayload({ __scene: { current: 'a' } })
    const ctx = new SceneContext({ payload, manager })

    await ctx.enter('a')

    expect(aLeave).not.toHaveBeenCalled()
    expect(aEnter).toHaveBeenCalled()
  })
})
