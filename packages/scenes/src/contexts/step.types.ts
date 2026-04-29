import type { StepContext, StepSceneHandler } from '../scenes/step.types'
import type { SceneState } from '../types'

import type { ScenePayload } from './scene'

// internal options passed to StepSceneContext. uses ScenePayload (not the
// user-facing MessageUpdate default of StepContext) so the internal context
// works regardless of which update kind a scene is parameterised over
export interface StepContextOptions<S = SceneState> {
  payload: StepContext<S, ScenePayload>
  steps: StepSceneHandler<S, ScenePayload>[]
  /** runs before every step body. if it leaves or navigates, the step is skipped */
  beforeStep?: StepSceneHandler<S, ScenePayload>
  /** runs after every step body, only if the step did not leave or navigate */
  afterStep?: StepSceneHandler<S, ScenePayload>
}

export interface StepContextGoOptions {
  silent?: boolean
}
