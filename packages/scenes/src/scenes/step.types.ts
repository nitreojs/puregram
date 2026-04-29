import type { SceneContext, ScenePayload } from '../contexts/scene'
import type { StepSceneContext } from '../contexts/step'
import type { SceneState } from '../types'

export interface StepContext<S = SceneState> extends ScenePayload {
  scene: SceneContext<S> & {
    step: StepSceneContext<S>
  }
}

export type StepSceneHandler<S = SceneState> = (
  payload: StepContext<S>
) => unknown

export interface StepSceneOptions<S = SceneState> {
  steps: StepSceneHandler<S>[]
  enterHandler?: StepSceneHandler<S>
  leaveHandler?: StepSceneHandler<S>
}
