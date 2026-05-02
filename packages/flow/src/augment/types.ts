import type { MessageUpdate, UpdateKindMap } from '@puregram/api'

import type { CollectMediaGroupOptions } from '../flow'
import type { PromptOptions } from '../prompt'
import type { WaitForOptions } from '../wait-for/types'

export type AugmentedWaitForMatch = 'none' | 'chat' | 'chat+from'

export interface AugmentedPromptOptions extends Omit<PromptOptions, 'from'> {
  /** override the auto-derived chat (defaults to extractor's output) */
  chat?: number | string
  /** override the auto-derived from (undefined leaves the underlying prompt unscoped by user) */
  from?: number
}

export interface AugmentedWaitForOptions<K extends keyof UpdateKindMap> extends WaitForOptions<K> {
  /**
   * how strictly the next update is matched against the source — default
   * `'chat+from'` when both extracted, `'chat'` when only chat extracted, `'none'` otherwise
   */
  match?: AugmentedWaitForMatch
}

export interface UpdateFlowExtension {
  prompt: (text: string, options?: AugmentedPromptOptions) => Promise<MessageUpdate | null>
  waitFor: <K extends keyof UpdateKindMap> (
    kind: K,
    options?: AugmentedWaitForOptions<K>
  ) => Promise<UpdateKindMap[K] | null>
  /**
   * collect every message sharing a `media_group_id` with this update into one array.
   * meaningful on message-payload updates; non-message updates resolve immediately with
   * `[source]` cast as MessageUpdate
   */
  collectMediaGroup: (options?: CollectMediaGroupOptions) => Promise<MessageUpdate[]>
}
