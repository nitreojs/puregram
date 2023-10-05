import { ContextInterface } from '../types'
import { SceneRepository } from '../scene-manager.types'

export interface SceneContextOptions {
  context: ContextInterface

  repository: SceneRepository
}

export interface SceneContextEnterOptions<S extends Record<string, unknown> = Record<string, any>> {
  /** Logging into a handler without executing it */
  silent?: boolean

  /** The standard state for the scene */
  state?: S
}

export interface SceneContextLeaveOptions {
  /** Logging into a handler without executing it */
  silent?: boolean

  /** Cancelled scene */
  cancelled?: boolean
}

export enum LastAction {
  None = 'none',
  Enter = 'enter',
  Leave = 'leave'
}
