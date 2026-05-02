import type { StepContext, StepSceneHandler } from '../scenes/step.types'
import type { SceneState } from '../types'

import type { ScenePayload } from './scene'

// internal options for StepSceneContext. uses `ScenePayload` (not StepContext's user-facing
// MessageUpdate default) so the internal context works for any scene update kind
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
