import { describe, expect, it, vi } from 'vitest'

import { SceneContext } from '../../src/contexts/scene'
import { LastAction } from '../../src/contexts/scene.types'
import { SceneManager } from '../../src/manager'
import { StepScene } from '../../src/scenes/step'

const makePayload = () => {
  const session: Record<string, unknown> = { __scene: { current: 'wizard' } }
  return { session }
}

describe('StepScene', () => {
  it('constructed from a steps array uses no enter/leave handlers', async () => {
    const step = vi.fn()
    const scene = new StepScene('wizard', [step])
    const manager = new SceneManager()
    manager.add(scene)

    const payload = makePayload() as never
    const sceneCtx = new SceneContext({ payload, manager })
    ;(payload as { scene?: SceneContext }).scene = sceneCtx

    await scene.enterHandler(payload as never)

    expect(step).toHaveBeenCalled()
  })

  it('constructed from full options invokes enterHandler then steps[0]', async () => {
    const enter = vi.fn()
    const step0 = vi.fn()
    const scene = new StepScene('wizard', { enterHandler: enter, steps: [step0] })
    const manager = new SceneManager()
    manager.add(scene)

    const payload = makePayload() as never
    const sceneCtx = new SceneContext({ payload, manager })
    ;(payload as { scene?: SceneContext }).scene = sceneCtx

    await scene.enterHandler(payload as never)

    expect(enter).toHaveBeenCalled()
    expect(step0).toHaveBeenCalled()
  })

  it('does not invoke step[0] if enterHandler called scene.leave()', async () => {
    const step0 = vi.fn()
    const scene = new StepScene('wizard', {
      enterHandler: (p) => { p.scene.lastAction = LastAction.Leave },
      steps: [step0]
    })
    const manager = new SceneManager()
    manager.add(scene)

    const payload = makePayload() as never
    const sceneCtx = new SceneContext({ payload, manager })
    ;(payload as { scene?: SceneContext }).scene = sceneCtx

    await scene.enterHandler(payload as never)

    expect(step0).not.toHaveBeenCalled()
  })

  it('leaveHandler defaults to a noop', async () => {
    const scene = new StepScene('wizard', [() => {}])
    const payload = makePayload() as never

    await expect(scene.leaveHandler(payload as never)).resolves.toBeUndefined()
  })

  it('leaveHandler runs user-supplied leaveHandler', async () => {
    const leave = vi.fn()
    const scene = new StepScene('wizard', { leaveHandler: leave, steps: [() => {}] })
    const payload = makePayload() as never

    await scene.leaveHandler(payload as never)

    expect(leave).toHaveBeenCalled()
  })
})
