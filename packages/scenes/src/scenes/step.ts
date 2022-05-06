import { MessageContext } from 'puregram'

import { SceneInterface } from './scene'

import { StepSceneContext } from '../contexts'
import { LastAction } from '../contexts'

import {
  StepSceneHandler,
  StepContext,
  StepSceneOptions
} from './step.types'

export class StepScene<T = MessageContext> implements SceneInterface {
  slug: string

  private readonly steps: StepSceneHandler<T>[]
  private readonly onEnterHandler: NonNullable<StepSceneOptions<T>['enterHandler']>
  private readonly onLeaveHandler: NonNullable<StepSceneOptions<T>['leaveHandler']>

  constructor(slug: string, rawOptions: StepSceneOptions<T> | StepSceneHandler<T>[]) {
    const options: StepSceneOptions<T> = Array.isArray(rawOptions)
      ? { steps: rawOptions }
      : rawOptions

    this.slug = slug
    this.steps = options.steps
    this.onEnterHandler = options.enterHandler || (() => { })
    this.onLeaveHandler = options.leaveHandler || (() => { })
  }

  async enterHandler(context: StepContext & T) {
    context.scene.step = new StepSceneContext({
      context,

      // @ts-expect-error
      steps: this.steps
    })

    await this.onEnterHandler(context)

    if (context.scene.lastAction !== LastAction.LEAVE) {
      await context.scene.step.reenter()
    }
  }

  leaveHandler(context: StepContext & T) {
    return Promise.resolve(this.onLeaveHandler(context))
  }
}
