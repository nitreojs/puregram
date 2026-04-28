// @puregram/flow — conversational primitives plugin

// side-effect import: declaration-merges `flow: UpdateFlowExtension` onto every
// applicable update class from @puregram/api. without this consumers don't see
// the augmentations
import './generated/augmentations'

export {
  FlowHandlerMissing,
  FlowKindMismatch,
  FlowPersistenceUnconfigured,
  WaitForCancelled,
  WaitForTimeout
} from './errors'
export { flow, type CollectMediaGroupOptions, type FlowExtension, type FlowOptions } from './flow'
export type {
  PersistentPromptOptions,
  PersistentWaitForOptions
} from './persistent/dispatch'
export type {
  FlowHandleConfig,
  FlowHandleContext,
  FlowHandlers,
  PersistedFlow,
  PersistentOpenOptions,
  ValidateResult
} from './persistent/types'
export type { PromptOptions } from './prompt'
export type { Filter, WaitForOptions, WaitForResult } from './wait-for/types'
