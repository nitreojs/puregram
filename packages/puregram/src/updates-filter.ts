import { type UpdateKind, UPDATE_KINDS } from '@puregram/api'

type MaybeArray<T> = T | readonly T[]

/**
 * helper for bot-api `allowed_updates`. telegram's default subscription
 * excludes opt-in kinds like `chat_member` and `business_message` — to receive
 * them you must list every desired kind explicitly. `UpdatesFilter.all()` returns
 * every kind; `UpdatesFilter.except(...)` returns everything-but-N
 *
 * @example
 * ```ts
 * const telegram = new Telegram({
 *   token: process.env.TOKEN,
 *   allowedUpdates: UpdatesFilter.all()
 * })
 *
 * await telegram.startPolling({
 *   allowedUpdates: UpdatesFilter.except(['business_connection', 'business_message'])
 * })
 * ```
 */
export class UpdatesFilter {
  /** every update kind, including the opt-in ones */
  static all () {
    return [...UPDATE_KINDS]
  }

  /** every update kind except the listed ones */
  static except (kinds: MaybeArray<UpdateKind>) {
    const skip = new Set(Array.isArray(kinds) ? kinds : [kinds])

    return UPDATE_KINDS.filter(k => !skip.has(k))
  }
}
