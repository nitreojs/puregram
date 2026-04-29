import type { StepContext, StepSceneHandler } from '../scenes/step.types'
import type { SceneState } from '../types'

import type { ScenePayload } from './scene'

export interface StepContextOptions<S = SceneState> {
  payload: StepContext<S> & ScenePayload
  steps: StepSceneHandler<S>[]
}

export interface StepContextGoOptions {
  silent?: boolean
}
