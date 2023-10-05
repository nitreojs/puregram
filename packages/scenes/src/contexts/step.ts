import {
  StepContextOptions,
  StepContextGoOptions
} from './step.types'

import { StepSceneHandler } from '../scenes'
import { LastAction } from './scene.types'

export class StepSceneContext<S extends Record<string, unknown> = Record<string, any>> {
  private readonly context: StepContextOptions<S>['context']
  private readonly steps: StepContextOptions<S>['steps']
  private stepChanged = false

  constructor (options: StepContextOptions<S>) {
    this.context = options.context

    this.steps = options.steps
  }

  /** The first enter to the handler */
  get firstTime () {
    const { firstTime = true } = this.context.scene.session

    return firstTime
  }

  /** Returns current `stepId` */
  get stepId () {
    return this.context.scene.session.stepId || 0
  }

  /** Sets current `stepId` */
  set stepId (stepId: number) {
    const { session } = this.context.scene

    session.stepId = stepId
    session.firstTime = true

    this.stepChanged = true
  }

  /** Returns current handler */
  get current (): StepSceneHandler<{}, S> | undefined {
    return this.steps[this.stepId]
  }

  /** Reenter current step handler */
  async reenter () {
    const { current } = this

    if (!current) {
      await this.context.scene.leave()

      return
    }

    this.stepChanged = false

    await current(this.context)

    if (this.context.scene.lastAction !== LastAction.Leave && !this.stepChanged) {
      this.context.scene.session.firstTime = false
    }
  }

  /** The `go` method goes to a specific step */
  go (stepId: number, { silent = false }: StepContextGoOptions = {}) {
    this.stepId = stepId

    if (silent) {
      return Promise.resolve()
    }

    return this.reenter()
  }

  /** Move to the next handler */
  next (options?: StepContextGoOptions) {
    return this.go(this.stepId + 1, options)
  }

  /** Move to the previous handler */
  previous (options?: StepContextGoOptions) {
    return this.go(this.stepId - 1, options)
  }
}
