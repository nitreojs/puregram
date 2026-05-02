import type { SceneManager } from '../manager'
import type { SceneState } from '../types'

/**
 * persisted under `update.session.__scene`. parameterised over per-scene state
 * (defaults to user-augmented `SceneState`)
 */
export interface SceneSessionState<S = SceneState> {
  current?: string
  state?: S
  stepId?: number
  firstTime?: boolean
}

/**
 * runtime payload a SceneContext binds to: wrapped update + `session`.
 * structural by design — scenes is generic over update kinds
 */
export interface ScenePayload {
  [key: string]: unknown
  session: { __scene?: SceneSessionState } & Record<string, unknown>
}

export interface SceneContextOptions {
  payload: ScenePayload
  manager: SceneManager
}

export interface SceneContextEnterOptions<S = SceneState> {
  /** logging into a handler without executing it */
  silent?: boolean
  /** the standard state for the scene */
  state?: S
}

export interface SceneContextLeaveOptions {
  /** logging into a handler without executing it */
  silent?: boolean
  /** cancelled scene — surfaced via SceneContext.cancelled inside leaveHandler */
  cancelled?: boolean
}

export enum LastAction {
  None = 'None',
  Enter = 'Enter',
  Leave = 'Leave'
}
