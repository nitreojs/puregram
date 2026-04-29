import type { SceneState } from '../types'

import { LastAction } from './scene.types'
import type { StepContextGoOptions, StepContextOptions } from './step.types'

export class StepSceneContext<S = SceneState> {
  private readonly payload: StepContextOptions<S>['payload']
  private readonly steps: StepContextOptions<S>['steps']
  private readonly beforeStep: StepContextOptions<S>['beforeStep']
  private readonly afterStep: StepContextOptions<S>['afterStep']
  private stepChanged = false

  constructor (options: StepContextOptions<S>) {
    this.payload = options.payload
    this.steps = options.steps
    this.beforeStep = options.beforeStep
    this.afterStep = options.afterStep
  }

  get firstTime () {
    return this.payload.scene.session.firstTime ?? true
  }

  get stepId () {
    return this.payload.scene.session.stepId ?? 0
  }

  get current () {
    return this.steps[this.stepId]
  }

  set stepId (stepId: number) {
    const { session } = this.payload.scene

    session.stepId = stepId
    session.firstTime = true
    this.stepChanged = true
  }

  async reenter () {
    const { current } = this

    if (!current) {
      await this.payload.scene.leave()

      return
    }

    this.stepChanged = false

    if (this.beforeStep) {
      await this.beforeStep(this.payload)

      // beforeStep may have called scene.leave() or step.go/.next/.previous —
      // in either case, skip the step body so we don't run a stale handler
      if (this.shouldSkipBody()) {
        return
      }
    }

    await current(this.payload)

    if (this.shouldSkipBody()) {
      return
    }

    if (this.afterStep) {
      await this.afterStep(this.payload)

      if (this.shouldSkipBody()) {
        return
      }
    }

    this.payload.scene.session.firstTime = false
  }

  async go (stepId: number, options: StepContextGoOptions = {}) {
    this.stepId = stepId

    if (options.silent) {
      return
    }

    await this.reenter()
  }

  next (options?: StepContextGoOptions) {
    return this.go(this.stepId + 1, options)
  }

  previous (options?: StepContextGoOptions) {
    return this.go(this.stepId - 1, options)
  }

  private shouldSkipBody () {
    return this.payload.scene.lastAction === LastAction.Leave || this.stepChanged
  }
}
