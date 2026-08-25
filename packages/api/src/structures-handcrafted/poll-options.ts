import type { InspectOptionsStylized } from 'node:util'

import { INSPECT, makeInspect } from '../generated/inspect'
import { PollOption } from '../generated/structures'
import type { TelegramPollOption } from '../generated/types'

type InspectFn = (value: unknown, options: InspectOptionsStylized) => string

/**
 * the options of a poll
 *
 * wraps the `PollOption[]` payload as a single ergonomic object exposing the leading option
 * and the summed vote count. iterating yields `PollOption` wrappers in payload order
 */
export class PollOptions {
  raw: TelegramPollOption[]
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private _options?: PollOption[]

  constructor (raw: TelegramPollOption[]) {
    this.raw = raw
  }

  /** lazily-wrapped `PollOption` instances for every option */
  get options () {
    this._options ??= this.raw.map(x => new PollOption(x))

    return this._options
  }

  /** number of options */
  get length () {
    return this.raw.length
  }

  /** every option's votes summed; exceeds `Poll.totalVoterCount` when the poll allows multiple answers */
  get totalVotes () {
    let total = 0

    for (const option of this.raw) {
      total += option.voter_count
    }

    return total
  }

  /** option with the most votes, first one on a tie */
  get winner () {
    return this.options.reduce((acc, cur) => (cur.voterCount > acc.voterCount ? cur : acc))
  }

  /** wrap a raw `PollOption[]` payload in a `PollOptions` */
  static fromPayload (raw: TelegramPollOption[]) {
    return new PollOptions(raw)
  }

  /** option with the given `persistent_id`, or undefined */
  byId (persistentId: string) {
    return this.options.find(x => x.persistentId === persistentId)
  }

  [Symbol.iterator] () {
    return this.options[Symbol.iterator]()
  }

  [INSPECT] (depth: number, options: InspectOptionsStylized, inspect: InspectFn) {
    return makeInspect('PollOptions', this, depth, options, inspect)
  }
}
