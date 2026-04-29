import type { StepContext, StepSceneHandler } from '../scenes/step.types'
import type { SceneState } from '../types'

import type { ScenePayload } from './scene'

export interface StepContextOptions<S = SceneState> {
  payload: StepContext<S> & ScenePayload
  steps: StepSceneHandler<S>[]
  /** runs before every step body. if it leaves or navigates, the step is skipped */
  beforeStep?: StepSceneHandler<S>
  /** runs after every step body, only if the step did not leave or navigate */
  afterStep?: StepSceneHandler<S>
}

export interface StepContextGoOptions {
  silent?: boolean
}
