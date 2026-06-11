import type { TelegramInputRichMessage } from '@puregram/api'

import type { Dialect } from './node'

/** the emitted rich message — a dialect string + the InputRichMessage options */
export class Rich {
  isRtl?: boolean
  skipEntityDetection?: boolean

  constructor (readonly dialect: Dialect, readonly content: string) {}

  /** mark the message right-to-left */
  rtl (value = true) {
    this.isRtl = value

    return this
  }

  /** disable telegram's automatic entity detection (links, mentions, hashtags, …) */
  noEntityDetection (value = true) {
    this.skipEntityDetection = value

    return this
  }

  /** the method arg — `{ [dialect]: content, is_rtl?, skip_entity_detection? }` */
  toInputRichMessage () {
    const out: TelegramInputRichMessage = { [this.dialect]: this.content }

    if (this.isRtl !== undefined) {
      out.is_rtl = this.isRtl
    }

    if (this.skipEntityDetection !== undefined) {
      out.skip_entity_detection = this.skipEntityDetection
    }

    return out
  }

  toJSON () {
    return this.toInputRichMessage()
  }
}
