import type { UpdateKindMap } from '@puregram/api'
import type { Telegram } from 'puregram'

import type { Filter, WaitForOptions } from '../wait-for/types'

/** raw record stored in `KVStorage<PersistedFlow>` for every open persistent prompt */
export interface PersistedFlow {
  id: string
  kind: keyof UpdateKindMap
  chatId: number
  fromId: number | undefined
  payload: unknown
  expiresAt?: number
  attempts?: number
  createdAt: number
}

/**
 * user-augmentable handler registry — declaration-merge unifies typing of
 * `flow.handle(id, …)` and `flow.prompt({ id, payload })`:
 *
 * @example
 * ```ts
 * declare module '@puregram/flow' {
 *   interface FlowHandlers {
 *     'register:age': { kind: 'message', payload: { name: string }, result: number }
 *   }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface -- user-augmentable
export interface FlowHandlers {}

/** validate() return contract; mirrors v2 prompt validation semantics */
export type ValidateResult = boolean | string

/**
 * options for `ctx.open` — strict subset of `PromptOptions` minus ephemeral-only
 * knobs (`consume`, `nullOnTimeout`). persistent path always consumes; only `onTimeout` fires
 */
export interface PersistentOpenOptions<K extends keyof UpdateKindMap = 'message'>
  extends Pick<WaitForOptions<K>, 'filter' | 'timeout'> {
  kind?: K
  payload?: unknown
  ttl?: number
  /** when present, opens a prompt (sends `text` then waits); when absent, opens a bare waitFor */
  text?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- bot api shape lives in @puregram/api codegen
  reply_markup?: any
}

/** runtime context handed to `onAnswer` / `onTimeout` */
export interface FlowHandleContext<K extends keyof UpdateKindMap = keyof UpdateKindMap> {
  /** the registered handle id */
  id: string
  /** the chat the prompt was opened in */
  chatId: number
  /** scoped user id, undefined when the prompt accepted any user in chat */
  fromId: number | undefined
  /** verbatim payload from the prompt call site */
  payload: unknown
  /** raw matched update — for onTimeout, the update whose lazy-eviction triggered the timeout */
  update: UpdateKindMap[K]
  /** chain into another persistent prompt; same option shape as `flow.prompt` */
  open: <NK extends keyof UpdateKindMap = 'message'> (id: string, options?: PersistentOpenOptions<NK>) => Promise<void>
  /** explicit early termination — deletes the storage record, no onAnswer runs */
  close: () => Promise<void>
  /** convenience proxy onto `tg.send` bound to the chat */
  send: Telegram['send']
}

/** registered with `tg.flow.handle(id, config)` — defines what runs when a persisted record matching `id` resolves */
export interface FlowHandleConfig<
  K extends keyof UpdateKindMap = 'message',
  T = UpdateKindMap[K]
> {
  /** which update kind closes this prompt; defaults to 'message' */
  kind?: K
  /** runs before transform; return a string to re-prompt with feedback, false to silently re-prompt */
  validate?: (update: UpdateKindMap[K]) => ValidateResult
  /** shapes the matched update into the value passed to onAnswer */
  transform?: (update: UpdateKindMap[K]) => T
  /** required: the resume body that runs after a successful match */
  onAnswer: (value: T, ctx: FlowHandleContext<K>) => Promise<void> | void
  /** runs once if the persisted record's expiresAt elapses before a match */
  onTimeout?: (ctx: FlowHandleContext<K>) => Promise<void> | void
  /** optional secondary filter — combined with the call-site filter via AND */
  filter?: Filter<UpdateKindMap[K]>
}
