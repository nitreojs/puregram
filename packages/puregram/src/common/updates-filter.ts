import { UpdateType } from '../types/enums'

import { MaybeArray, UpdateName } from '../types/types'

/**
 * This class manages allowed update types for the Telegram Bot API.
 * Provides static methods to retrieve all update types or exclude specific types.
 *
 * This may be useful when you want to tell Telegram Bot API that you're going to handle `chat_member`
 * and other events that require to be provided in the `allowed_updates` as well as handling all other
 * updates
 *
 * @example
 * ```
 * const telegram = new Telegram({
 *   token: process.env.TOKEN,
 *   allowedUpdates: UpdatesFilter.all()
 * })
 * ```
 */
export class UpdatesFilter {
  /** All allowed update types including `chat_member` */
  static all () {
    return Object.values(UpdateType)
  }

  /** All allowed update types excluding `types` you provided */
  static except (types: MaybeArray<UpdateType | UpdateName>) {
    const excluded = Array.isArray(types) ? types : [types]

    return UpdatesFilter.all().filter(t => !excluded.includes(t))
  }
}
