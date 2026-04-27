import type { UpdateKindMap } from '@puregram/api'
import type { CustomUpdate } from 'puregram'

import type { SessionStorage } from './storage'

/**
 * empty user-augmentable interface. users widen the typed surface of `update.session`
 * by declaration-merging fields onto SessionData:
 *
 *   declare module '@puregram/session' {
 *     interface SessionData {
 *       counter: number
 *       user: { name: string }
 *     }
 *   }
 *
 * single global shape — every augmented update kind sees the same SessionData
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface -- intentionally empty, user-augmentable
export interface SessionData {}

/**
 * the proxied session value handed to user code as `update.session`
 * intersects user-typed fields (via SessionData augmentation), the runtime
 * $forceUpdate flush method, and an unknown-keyed index so the proxy can
 * carry runtime keys not declared on SessionData
 */
export type SessionContext = SessionData & {
  $forceUpdate: () => Promise<boolean>
} & {
  [key: string]: unknown
}

export type AnyUpdate = UpdateKindMap[keyof UpdateKindMap] | CustomUpdate

export interface SessionOptions {
  /** persistent backend. defaults to MemoryStorage */
  storage?: SessionStorage
  /**
   * how to derive the storage key per update
   * default: from.id ?? senderChat.id ?? chat.id; undefined → no session attached
   */
  getStorageKey?: (update: AnyUpdate) => string | undefined
  /** initial session value when the storage key is empty. defaults to () => ({}) */
  initial?: (update: AnyUpdate) => SessionData
}

// per-update-kind augmentations (`declare module '@puregram/api' { interface XUpdate { session: SessionContext } }`)
// are codegenerated into `src/generated/augmentations.ts` by `scripts/emit-augmentations.ts`
// regenerate via `yarn generate:augmentations` after a @puregram/api version bump
