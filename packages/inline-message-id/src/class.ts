import { parseInlineMessageId } from './parse'
import { serializeInlineMessageId } from './serialize'
import type { ParsedInlineMessageId } from './types'

const INSPECT = Symbol.for('nodejs.util.inspect.custom')

/** ergonomic wrapper around {@link ParsedInlineMessageId} with derived getters */
export class InlineMessageId {
  readonly raw: ParsedInlineMessageId

  constructor (raw: ParsedInlineMessageId) {
    this.raw = raw
  }

  /** form discriminator — `'legacy'` for 20-byte ids, `'modern'` for 24-byte ids */
  get kind () {
    return this.raw.kind
  }

  /** data center id the message lives on */
  get dcId () {
    return this.raw.dcId
  }

  /** message access hash */
  get accessHash () {
    return this.raw.accessHash
  }

  /**
   * message id. for modern ids it is the dedicated `messageId` field;
   * for legacy ids it is decoded from the low 32 bits of the packed `id` long
   */
  get messageId () {
    if (this.raw.kind === 'legacy') {
      return Number(BigInt.asIntN(32, this.raw.id))
    }

    return this.raw.messageId
  }

  /**
   * legacy 32-bit chat id — decoded from the high 32 bits of the packed `id` long.
   * `undefined` for modern ids. note: this is the **legacy** mtproto chat id and is
   * not directly comparable to the bot api `chat.id` for groups/channels (which
   * follow the `-100<peer_id>` / 64-bit format)
   */
  get chatId () {
    if (this.raw.kind !== 'legacy') {
      return undefined
    }

    return Number(BigInt.asIntN(32, this.raw.id >> 32n))
  }

  /** 64-bit owner id (user who chose the inline result). `undefined` for legacy ids */
  get ownerId (): bigint | undefined {
    if (this.raw.kind !== 'modern') {
      return undefined
    }

    return this.raw.ownerId
  }

  /** parse a telegram `inline_message_id` string */
  static from (input: string) {
    return new InlineMessageId(parseInlineMessageId(input))
  }

  /** re-encode back to the base64url string telegram clients understand */
  toString () {
    return serializeInlineMessageId(this.raw)
  }

  [INSPECT] (_depth: number, _options: unknown, inspect: (v: unknown) => string) {
    return `InlineMessageId ${inspect(this.raw)}`
  }
}
