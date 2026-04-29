import { LastAction } from '../contexts/scene.types'
import { StepSceneContext } from '../contexts/step'
import type { StepContextOptions } from '../contexts/step.types'
import type { SceneState } from '../types'

import type { SceneHandlerPayload, SceneInterface } from './scene'
import type { StepContext, StepSceneHandler, StepSceneOptions } from './step.types'

export class StepScene<S = SceneState, U = unknown> implements SceneInterface {
  readonly slug: string

  private readonly steps: StepSceneHandler<S, U>[]
  private readonly onEnterHandler: StepSceneHandler<S, U>
  private readonly onLeaveHandler: StepSceneHandler<S, U>
  private readonly onBeforeStep: StepSceneHandler<S, U> | undefined
  private readonly onAfterStep: StepSceneHandler<S, U> | undefined

  constructor (slug: string, rawOptions: StepSceneOptions<S, U> | StepSceneHandler<S, U>[]) {
    const options: StepSceneOptions<S, U> = Array.isArray(rawOptions)
      ? { steps: rawOptions }
      : rawOptions

    this.slug = slug
    this.steps = options.steps
    this.onEnterHandler = options.enterHandler ?? (() => {})
    this.onLeaveHandler = options.leaveHandler ?? (() => {})
    this.onBeforeStep = options.beforeStep
    this.onAfterStep = options.afterStep
  }

  enterHandler = async (payload: SceneHandlerPayload) => {
    const ctxOptions: StepContextOptions<S> = {
      payload: payload as unknown as StepContext<S>,
      steps: this.steps as unknown as StepSceneHandler<S>[]
    }

    if (this.onBeforeStep !== undefined) {
      ctxOptions.beforeStep = this.onBeforeStep as unknown as StepSceneHandler<S>
    }

    if (this.onAfterStep !== undefined) {
      ctxOptions.afterStep = this.onAfterStep as unknown as StepSceneHandler<S>
    }

    const stepCtx = new StepSceneContext<S>(ctxOptions)

    ;(payload.scene as unknown as { step: StepSceneContext<S> }).step = stepCtx

    await this.onEnterHandler(payload as unknown as StepContext<S, U>)

    if (payload.scene.lastAction !== LastAction.Leave) {
      await stepCtx.reenter()
    }
  }

  leaveHandler = async (payload: SceneHandlerPayload) => {
    await this.onLeaveHandler(payload as unknown as StepContext<S, U>)
  }
}
