import { ContextInterface } from '../types'

import {
  SceneContext,
  StepSceneContext
} from '../contexts'

export interface StepContext<S extends Record<string, unknown> = {}> extends ContextInterface {
  scene: SceneContext<S> & {
    /** Stepping scene control context */
    step: StepSceneContext<S>
  }
}

export type StepSceneHandler<T = {}, S extends Record<string, unknown> = Record<string, any>> = (context: StepContext<S> & T) => unknown

export interface StepSceneOptions<T> {
  steps: StepSceneHandler<T>[]

  enterHandler?: StepSceneHandler<T>

  leaveHandler?: StepSceneHandler<T>
}
