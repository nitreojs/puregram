// @puregram/scenes — multi-step scenes plugin

// side-effect: loads codegenerated `declare module '@puregram/api'` augmentations
// + the `__scene` field declaration-merged onto `@puregram/session`'s SessionData
import './generated/augmentations'
import './session-augmentation'

export { scenes, type ScenesExtension } from './plugin'
export { SceneContext } from './contexts/scene'
export type { ScenePayload, SceneSessionState } from './contexts/scene'
export {
  LastAction,
  type SceneContextEnterOptions,
  type SceneContextLeaveOptions,
  type SceneContextOptions
} from './contexts/scene.types'
export { StepSceneContext } from './contexts/step'
export type { StepContextGoOptions, StepContextOptions } from './contexts/step.types'
export { StepScene } from './scenes/step'
export type {
  StepContext,
  StepSceneHandler,
  StepSceneOptions
} from './scenes/step.types'
export type { SceneHandlerPayload, SceneInterface } from './scenes/scene'
export type { AnyUpdate, SceneOptions, SceneState } from './types'
