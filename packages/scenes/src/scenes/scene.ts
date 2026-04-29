import type { SceneContext } from '../contexts/scene'
import type { SceneState } from '../types'

/** the universal payload a scene handler receives — any update with `scene` augmented on */
export interface SceneHandlerPayload {
  scene: SceneContext<SceneState>
  [key: string]: unknown
}

export interface SceneInterface {
  /** unique slug identifying the scene */
  slug: string

  /** invoked when the scene is entered */
  enterHandler: (payload: SceneHandlerPayload) => unknown

  /** invoked when the scene is left */
  leaveHandler: (payload: SceneHandlerPayload) => unknown
}
