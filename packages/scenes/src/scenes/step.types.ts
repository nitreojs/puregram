import type { MessageUpdate } from '@puregram/api'

import type { SceneContext } from '../contexts/scene'
import type { StepSceneContext } from '../contexts/step'
import type { SceneState } from '../types'

/**
 * the payload a step handler receives. parameterised over:
 *   S — the per-scene user state shape (see SceneState)
 *   U — the wrapped update kind(s) the scene handles. defaults to MessageUpdate
 *       for the common text-wizard case. pass a union (e.g.
 *       `MessageUpdate | CallbackQueryUpdate`) for mixed-kind scenes
 *
 * U fields surface directly on the payload, so handlers can use the wrapped
 * Update API (.text, .send(), .raw) without casts. the augmented `scene`
 * field is replaced with one carrying the StepSceneContext under .step
 */
export type StepContext<S = SceneState, U = MessageUpdate> = U & {
  scene: SceneContext<S> & {
    step: StepSceneContext<S>
  }
}

export type StepSceneHandler<S = SceneState, U = MessageUpdate> = (
  payload: StepContext<S, U>
) => unknown

export interface StepSceneOptions<S = SceneState, U = MessageUpdate> {
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
