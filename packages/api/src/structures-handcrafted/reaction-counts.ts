import type { InspectOptionsStylized } from 'node:util'

import { INSPECT, makeInspect } from '../generated/inspect'
import { ReactionCount } from '../generated/structures'
import type { TelegramReactionCount } from '../generated/types'

type InspectFn = (value: unknown, options: InspectOptionsStylized) => string

/**
 * the reaction tally on a message
 *
 * wraps the `ReactionCount[]` payload as a single ergonomic object exposing the summed and
 * per-emoji counts. iterating yields `ReactionCount` wrappers in payload order
 */
export class ReactionCounts {
  raw: TelegramReactionCount[]
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private _counts?: ReactionCount[]

  constructor (raw: TelegramReactionCount[]) {
    this.raw = raw
  }

  /** lazily-wrapped `ReactionCount` instances for every reaction */
  get counts () {
    this._counts ??= this.raw.map(x => new ReactionCount(x))

    return this._counts
  }

  /** number of distinct reactions */
  get length () {
    return this.raw.length
  }

  /** every reaction counted together */
  get total () {
    let total = 0

    for (const count of this.raw) {
      total += count.total_count
    }

    return total
  }

  /** most-used reaction, first one on a tie; undefined when nothing is reacted */
  get top () {
    let match: ReactionCount | undefined

    for (const count of this.counts) {
      if (match === undefined || count.totalCount > match.totalCount) {
        match = count
      }
    }

    return match
  }

  /** wrap a raw `ReactionCount[]` payload in a `ReactionCounts` */
  static fromPayload (raw: TelegramReactionCount[]) {
    return new ReactionCounts(raw)
  }

  /** how many times this standard emoji was reacted with, 0 when absent */
  countOf (emoji: string) {
    return this.raw.find(x => x.type.type === 'emoji' && x.type.emoji === emoji)?.total_count ?? 0
  }

  /** how many times this custom emoji was reacted with, 0 when absent */
  countOfCustomEmoji (customEmojiId: string) {
    return this.raw.find(x => x.type.type === 'custom_emoji' && x.type.custom_emoji_id === customEmojiId)?.total_count ?? 0
  }

  /** how many paid (telegram stars) reactions were added, 0 when absent */
  countOfPaid () {
    return this.raw.find(x => x.type.type === 'paid')?.total_count ?? 0
  }

  [Symbol.iterator] () {
    return this.counts[Symbol.iterator]()
  }

  [INSPECT] (depth: number, options: InspectOptionsStylized, inspect: InspectFn) {
    return makeInspect('ReactionCounts', this, depth, options, inspect)
  }
}
