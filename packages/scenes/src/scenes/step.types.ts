import type { SceneContext, ScenePayload } from '../contexts/scene'
import type { StepSceneContext } from '../contexts/step'
import type { SceneState } from '../types'

/**
 * the payload a step handler receives. parameterised over:
 *   S — the per-scene user state shape (see SceneState)
 *   U — the wrapped update kind the scene handles (e.g. MessageUpdate)
 *
 * U fields surface directly on the payload, so handlers can use the wrapped
 * Update API (.text, .send(), .raw) without casts. the augmented `scene`
 * field is replaced with one carrying the StepSceneContext under .step
 */
export type StepContext<S = SceneState, U = ScenePayload> = U & {
  scene: SceneContext<S> & {
    step: StepSceneContext<S>
  }
}

export type StepSceneHandler<S = SceneState, U = ScenePayload> = (
  payload: StepContext<S, U>
) => unknown

export interface StepSceneOptions<S = SceneState, U = ScenePayload> {
  steps: StepSceneHandler<S, U>[]
  enterHandler?: StepSceneHandler<S, U>
  leaveHandler?: StepSceneHandler<S, U>
}
