import { describe, expect, it, vi } from 'vitest'

import { LastAction } from '../../src/contexts/scene.types'
import { StepSceneContext } from '../../src/contexts/step'

interface FakeScene {
  session: { stepId?: number, firstTime?: boolean }
  lastAction: LastAction
  leave: () => Promise<void>
}

const makePayload = (scene: FakeScene) => ({
  scene
})

describe('StepSceneContext', () => {
  it('stepId defaults to 0 when session has no stepId', () => {
    const fake: FakeScene = { session: {}, lastAction: LastAction.None, leave: async () => {} }
    const payload = makePayload(fake)
    const ctx = new StepSceneContext({ payload: payload as never, steps: [() => {}] })

    expect(ctx.stepId).toBe(0)
  })

  it('firstTime defaults to true when not in session', () => {
    const fake: FakeScene = { session: {}, lastAction: LastAction.None, leave: async () => {} }
    const payload = makePayload(fake)
    const ctx = new StepSceneContext({ payload: payload as never, steps: [() => {}] })

    expect(ctx.firstTime).toBe(true)
  })

  it('current returns the handler at stepId', () => {
    const a = vi.fn()
    const b = vi.fn()
    const fake: FakeScene = { session: { stepId: 1 }, lastAction: LastAction.None, leave: async () => {} }
    const payload = makePayload(fake)
    const ctx = new StepSceneContext({ payload: payload as never, steps: [a, b] })

    expect(ctx.current).toBe(b)
  })

  it('reenter() invokes current(payload) and clears firstTime when not leaving', async () => {
    const handler = vi.fn()
    const fake: FakeScene = { session: { stepId: 0, firstTime: true }, lastAction: LastAction.None, leave: async () => {} }
    const payload = makePayload(fake)
    const ctx = new StepSceneContext({ payload: payload as never, steps: [handler] })

    await ctx.reenter()

    expect(handler).toHaveBeenCalledWith(payload)
    expect(fake.session.firstTime).toBe(false)
  })

  it('reenter() calls scene.leave() when current is undefined', async () => {
    const leave = vi.fn()
    const fake: FakeScene = { session: { stepId: 5 }, lastAction: LastAction.None, leave }
    const payload = makePayload(fake)
    const ctx = new StepSceneContext({ payload: payload as never, steps: [] })

    await ctx.reenter()

    expect(leave).toHaveBeenCalled()
  })

  it('go(n) sets stepId, marks firstTime=true, and reenters', async () => {
    const a = vi.fn()
    const b = vi.fn()
    const fake: FakeScene = { session: { stepId: 0, firstTime: false }, lastAction: LastAction.None, leave: async () => {} }
    const payload = makePayload(fake)
    const ctx = new StepSceneContext({ payload: payload as never, steps: [a, b] })

    await ctx.go(1)

    expect(b).toHaveBeenCalled()
    expect(fake.session.stepId).toBe(1)
  })

  it('go(n, { silent: true }) sets stepId without invoking the handler', async () => {
    const a = vi.fn()
    const b = vi.fn()
    const fake: FakeScene = { session: { stepId: 0, firstTime: false }, lastAction: LastAction.None, leave: async () => {} }
    const payload = makePayload(fake)
    const ctx = new StepSceneContext({ payload: payload as never, steps: [a, b] })

    await ctx.go(1, { silent: true })

    expect(b).not.toHaveBeenCalled()
    expect(fake.session.stepId).toBe(1)
    expect(fake.session.firstTime).toBe(true)
  })

  it('next() advances by one step', async () => {
    const a = vi.fn()
    const b = vi.fn()
    const fake: FakeScene = { session: { stepId: 0, firstTime: false }, lastAction: LastAction.None, leave: async () => {} }
    const payload = makePayload(fake)
    const ctx = new StepSceneContext({ payload: payload as never, steps: [a, b] })

    await ctx.next()
    expect(b).toHaveBeenCalled()
    expect(fake.session.stepId).toBe(1)
  })

  it('previous() steps back by one', async () => {
    const a = vi.fn()
    const b = vi.fn()
    const fake: FakeScene = { session: { stepId: 1, firstTime: false }, lastAction: LastAction.None, leave: async () => {} }
    const payload = makePayload(fake)
    const ctx = new StepSceneContext({ payload: payload as never, steps: [a, b] })

    await ctx.previous()
    expect(a).toHaveBeenCalled()
    expect(fake.session.stepId).toBe(0)
  })

  it('reenter() does not clear firstTime when scene leaves mid-handler', async () => {
    const fake: FakeScene = { session: { stepId: 0, firstTime: true }, lastAction: LastAction.None, leave: async () => {} }
    const payload = makePayload(fake)
    const handler = vi.fn().mockImplementation(() => {
      fake.lastAction = LastAction.Leave
    })
    const ctx = new StepSceneContext({ payload: payload as never, steps: [handler] })

    await ctx.reenter()

    expect(handler).toHaveBeenCalled()
    expect(fake.session.firstTime).toBe(true)
  })

  it('reenter() does not clear firstTime when go() ran inside the handler', async () => {
    const fake: FakeScene = { session: { stepId: 0, firstTime: true }, lastAction: LastAction.None, leave: async () => {} }
    const payload = makePayload(fake)
    const handler = vi.fn().mockImplementation(async () => {
      await ctx.go(1, { silent: true })
    })
    const ctx: StepSceneContext = new StepSceneContext({ payload: payload as never, steps: [handler, () => {}] })

    await ctx.reenter()

    expect(fake.session.firstTime).toBe(true)
  })

  it('beforeStep runs before every step body', async () => {
    const before = vi.fn()
    const handler = vi.fn()
    const fake: FakeScene = { session: { stepId: 0 }, lastAction: LastAction.None, leave: async () => {} }
    const payload = makePayload(fake)
    const ctx = new StepSceneContext({ payload: payload as never, steps: [handler], beforeStep: before })

    await ctx.reenter()

    expect(before).toHaveBeenCalledWith(payload)
    expect(handler).toHaveBeenCalled()
    expect(before.mock.invocationCallOrder[0]).toBeLessThan(handler.mock.invocationCallOrder[0])
  })

  it('beforeStep that calls scene.leave() skips the step body', async () => {
    const handler = vi.fn()
    const before = vi.fn().mockImplementation(() => {
      fake.lastAction = LastAction.Leave
    })
    const fake: FakeScene = { session: { stepId: 0 }, lastAction: LastAction.None, leave: async () => {} }
    const payload = makePayload(fake)
    const ctx = new StepSceneContext({ payload: payload as never, steps: [handler], beforeStep: before })

    await ctx.reenter()

    expect(before).toHaveBeenCalled()
    expect(handler).not.toHaveBeenCalled()
  })

  it('beforeStep that navigates skips the step body', async () => {
    const handler0 = vi.fn()
    const handler1 = vi.fn()
    const fake: FakeScene = { session: { stepId: 0 }, lastAction: LastAction.None, leave: async () => {} }
    const payload = makePayload(fake)
    const before = vi.fn().mockImplementation(async () => {
      await ctx.go(1, { silent: true })
    })
    const ctx: StepSceneContext = new StepSceneContext({
      payload: payload as never,
      steps: [handler0, handler1],
      beforeStep: before
    })

    await ctx.reenter()

    expect(handler0).not.toHaveBeenCalled()
    expect(handler1).not.toHaveBeenCalled()
  })

  it('afterStep runs after a step that did not leave or navigate', async () => {
    const after = vi.fn()
    const handler = vi.fn()
    const fake: FakeScene = { session: { stepId: 0 }, lastAction: LastAction.None, leave: async () => {} }
    const payload = makePayload(fake)
    const ctx = new StepSceneContext({ payload: payload as never, steps: [handler], afterStep: after })

    await ctx.reenter()

    expect(handler).toHaveBeenCalled()
    expect(after).toHaveBeenCalled()
    expect(after.mock.invocationCallOrder[0]).toBeGreaterThan(handler.mock.invocationCallOrder[0])
  })

  it('afterStep does NOT run when the step body left the scene', async () => {
    const after = vi.fn()
    const fake: FakeScene = { session: { stepId: 0 }, lastAction: LastAction.None, leave: async () => {} }
    const payload = makePayload(fake)
    const handler = vi.fn().mockImplementation(() => {
      fake.lastAction = LastAction.Leave
    })
    const ctx = new StepSceneContext({ payload: payload as never, steps: [handler], afterStep: after })

    await ctx.reenter()

    expect(handler).toHaveBeenCalled()
    expect(after).not.toHaveBeenCalled()
  })

  it('afterStep does NOT run when the step body navigated', async () => {
    const after = vi.fn()
    const fake: FakeScene = { session: { stepId: 0 }, lastAction: LastAction.None, leave: async () => {} }
    const payload = makePayload(fake)
    const handler = vi.fn().mockImplementation(async () => {
      await ctx.go(1, { silent: true })
    })
    const ctx: StepSceneContext = new StepSceneContext({
      payload: payload as never,
      steps: [handler, () => {}],
      afterStep: after
    })

    await ctx.reenter()

    expect(handler).toHaveBeenCalled()
    expect(after).not.toHaveBeenCalled()
  })
})
