import type { SceneManager } from '../manager'
import type { SceneState } from '../types'

/** persisted under `update.session.__scene` */
export interface SceneSessionState {
  current?: string
  state?: Record<string, unknown>
  stepId?: number
  firstTime?: boolean
}

/**
 * the runtime payload a SceneContext is bound to: the wrapped update, augmented with
 * `session` (from @puregram/session). intentionally structural — no `Update` constraint
 * because scenes is generic over update kinds
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
