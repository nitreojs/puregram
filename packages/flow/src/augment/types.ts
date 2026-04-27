import type { MessageUpdate, UpdateKindMap } from '@puregram/api'

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
   * how strictly the next update is matched against the source update.
   * default: `'chat+from'` when both extracted, `'chat'` when only chat extracted, `'none'` otherwise
   */
  match?: AugmentedWaitForMatch
}

export interface UpdateFlowExtension {
  prompt: (text: string, options?: AugmentedPromptOptions) => Promise<MessageUpdate | null>
  waitFor: <K extends keyof UpdateKindMap> (
    kind: K,
    options?: AugmentedWaitForOptions<K>
  ) => Promise<UpdateKindMap[K] | null>
}

// declaration-merge augmentations live in src/generated/augmentations.ts
// regenerate via `yarn generate:augmentations` after a @puregram/api version bump
// or after adding/removing an EXTRACTORS entry
