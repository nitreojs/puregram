import {
  StepContext,
  StepSceneHandler
} from '../scenes'

export interface StepContextOptions<S extends Record<string, unknown> = Record<string, any>> {
  context: StepContext<S>

  steps: StepSceneHandler[]
}

export interface StepContextGoOptions {
  /** Logging into a handler without executing it */
  silent?: boolean
}
