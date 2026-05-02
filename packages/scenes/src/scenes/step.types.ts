import type { SceneContext } from '../contexts/scene'
import type { StepSceneContext } from '../contexts/step'
import type { AnyUpdate, SceneState } from '../types'

/**
 * payload a step handler receives. `S` = per-scene user state, `U` = wrapped update
 * kind(s) the scene handles (defaults to `AnyUpdate`). narrow with `u.is(kind)` inside
 * step bodies, or pass a tighter union (e.g. `MessageUpdate`) to skip the narrow
 */
export type StepContext<S = SceneState, U = AnyUpdate> = U & {
  scene: SceneContext<S> & {
    step: StepSceneContext<S>
  }
}

export type StepSceneHandler<S = SceneState, U = AnyUpdate> = (
  payload: StepContext<S, U>
) => unknown

export interface StepSceneOptions<S = SceneState, U = AnyUpdate> {
  steps: StepSceneHandler<S, U>[]
  enterHandler?: StepSceneHandler<S, U>
  leaveHandler?: StepSceneHandler<S, U>
  /**
   * runs before every step body — calling `scene.leave()` or `step.go/.next/.previous`
   * skips the body. handy for `/cancel`
   */
  beforeStep?: StepSceneHandler<S, U>
  /** runs after every step body, only when the step didn't leave or navigate. runs before `firstTime` is cleared */
  afterStep?: StepSceneHandler<S, U>
}
