import { LastAction } from '../contexts/scene.types'
import { StepSceneContext } from '../contexts/step'
import type { SceneState } from '../types'
import type { SceneHandlerPayload, SceneInterface } from './scene'
import type { StepContext, StepSceneHandler, StepSceneOptions } from './step.types'

export class StepScene<S = SceneState> implements SceneInterface {
  readonly slug: string

  private readonly steps: StepSceneHandler<S>[]
  private readonly onEnterHandler: StepSceneHandler<S>
  private readonly onLeaveHandler: StepSceneHandler<S>

  constructor (slug: string, rawOptions: StepSceneOptions<S> | StepSceneHandler<S>[]) {
    const options: StepSceneOptions<S> = Array.isArray(rawOptions)
      ? { steps: rawOptions }
      : rawOptions

    this.slug = slug
    this.steps = options.steps
    this.onEnterHandler = options.enterHandler ?? (() => {})
    this.onLeaveHandler = options.leaveHandler ?? (() => {})
  }

  enterHandler = async (payload: SceneHandlerPayload) => {
    const stepCtx = new StepSceneContext<S>({
      payload: payload as unknown as StepContext<S>,
      steps: this.steps
    })

    ;(payload.scene as unknown as { step: StepSceneContext<S> }).step = stepCtx

    await this.onEnterHandler(payload as unknown as StepContext<S>)

    if (payload.scene.lastAction !== LastAction.Leave) {
      await stepCtx.reenter()
    }
  }

  leaveHandler = async (payload: SceneHandlerPayload) => {
    await this.onLeaveHandler(payload as unknown as StepContext<S>)
  }
}
