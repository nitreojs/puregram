import type { InspectOptionsStylized } from 'node:util'

import { INSPECT, makeInspect } from '../generated/inspect'
import type { TelegramReactionType, TelegramReactionTypeCustomEmoji, TelegramReactionTypeEmoji } from '../generated/types'

type InspectFn = (value: unknown, options: InspectOptionsStylized) => string

/**
 * a set of reactions on a message
 *
 * wraps the `ReactionType[]` payload as a single ergonomic object exposing the emoji and
 * custom-emoji ids without hand-narrowing the union. iterating yields the raw
 * `TelegramReactionType` entries in payload order — `ReactionType` is a union with no
 * wrapper class of its own
 */
export class Reactions {
  raw: TelegramReactionType[]
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private _emojis?: string[]
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private _customEmojiIds?: string[]

  constructor (raw: TelegramReactionType[]) {
    this.raw = raw
  }

  /** number of reactions */
  get length () {
    return this.raw.length
  }

  /** emoji of every standard emoji reaction, in payload order */
  get emojis () {
    this._emojis ??= this.raw.filter(isEmoji).map(x => x.emoji)

    return this._emojis
  }

  /** id of every custom-emoji reaction, in payload order. feeds `getCustomEmojiStickers` */
  get customEmojiIds () {
    this._customEmojiIds ??= this.raw.filter(isCustomEmoji).map(x => x.custom_emoji_id)

    return this._customEmojiIds
  }

  /** wrap a raw `ReactionType[]` payload in a `Reactions` */
  static fromPayload (raw: TelegramReactionType[]) {
    return new Reactions(raw)
  }

  /** whether a standard emoji reaction with this emoji is present */
  has (emoji: string) {
    return this.raw.some(x => x.type === 'emoji' && x.emoji === emoji)
  }

  /** whether a custom-emoji reaction with this id is present */
  hasCustomEmoji (customEmojiId: string) {
    return this.raw.some(x => x.type === 'custom_emoji' && x.custom_emoji_id === customEmojiId)
  }

  /** whether a paid (telegram stars) reaction is present */
  hasPaid () {
    return this.raw.some(x => x.type === 'paid')
  }

  /**
   * whether an equivalent reaction is present — emoji matched by emoji, custom emoji by id,
   * anything else by type
   */
  includes (reaction: TelegramReactionType) {
    if (reaction.type === 'emoji') {
      return this.has(reaction.emoji)
    }

    if (reaction.type === 'custom_emoji') {
      return this.hasCustomEmoji(reaction.custom_emoji_id)
    }

    return this.raw.some(x => x.type === reaction.type)
  }

  [Symbol.iterator] () {
    return this.raw[Symbol.iterator]()
  }

  [INSPECT] (depth: number, options: InspectOptionsStylized, inspect: InspectFn) {
    return makeInspect('Reactions', this, depth, options, inspect)
  }
}

function isEmoji (raw: TelegramReactionType): raw is TelegramReactionTypeEmoji {
  return raw.type === 'emoji'
}

function isCustomEmoji (raw: TelegramReactionType): raw is TelegramReactionTypeCustomEmoji {
  return raw.type === 'custom_emoji'
}
