import type { SceneContext } from '../contexts/scene'
import type { StepSceneContext } from '../contexts/step'
import type { AnyUpdate, SceneState } from '../types'

/**
 * the payload a step handler receives. parameterised over:
 *   S — the per-scene user state shape (see SceneState)
 *   U — the wrapped update kind(s) the scene handles. defaults to AnyUpdate
 *       since scenes can receive any kind whose storage key resolves; users
 *       narrow with `u.is(kind)` inside step bodies. pass a tighter union
 *       (e.g. `MessageUpdate`, or `MessageUpdate | CallbackQueryUpdate`) to
 *       skip the narrow when a scene only handles specific kinds
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
   * runs before every step body. if it calls `scene.leave()` or `step.go/.next/
   * .previous`, the step body is skipped. handy for global checks like /cancel
   */
  beforeStep?: StepSceneHandler<S, U>
  /**
   * runs after every step body, only if the step did not leave or navigate.
   * runs before `firstTime` is cleared, so the hook still sees firstTime as it
   * was during the step body
   */
  afterStep?: StepSceneHandler<S, U>
}
