// @puregram/flow — conversational primitives plugin

// side-effect import: declaration-merges `flow: UpdateFlowExtension` onto every
// applicable update class from @puregram/api. without this consumers don't see
// the augmentations
import './generated/augmentations'

export { WaitForCancelled, WaitForTimeout } from './errors'
export { flow, type FlowExtension } from './flow'
export { mediaGroup, type MediaGroupExtension, type MediaGroupOptions } from './media-group/plugin'
export { MediaGroupUpdate } from './media-group/update'
export type { PromptOptions } from './prompt'
export type { Filter, WaitForOptions, WaitForResult } from './wait-for/types'
