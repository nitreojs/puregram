import type { UpdateKindMap } from '@puregram/api'

import type { ValidateResult } from '../persistent/types'

export type Filter<U> = (update: U) => boolean

export interface WaitForOptions<K extends keyof UpdateKindMap, T = UpdateKindMap[K]> {
  filter?: Filter<UpdateKindMap[K]>
  timeout?: number
  nullOnTimeout?: boolean
  consume?: boolean

  /** runs after filter matches; return false / string to reject + (optionally) feedback the user */
  validate?: (update: UpdateKindMap[K]) => ValidateResult
  /** shapes the matched update before the await resolves; transform output dictates the promise type */
  transform?: (update: UpdateKindMap[K]) => T
  /**
   * abort signal — when fired, the waiter rejects with `WaiterAbortedError` and
   * unregisters its listeners. compose with `AbortSignal.timeout(...)` /
   * `AbortSignal.any([...])` for shared deadlines across multiple waiters
   */
  signal?: AbortSignal
}

export type WaitForResult<
  K extends keyof UpdateKindMap,
  NullOnTimeout extends boolean | undefined,
  T = UpdateKindMap[K]
> = NullOnTimeout extends true ? T | null : T
