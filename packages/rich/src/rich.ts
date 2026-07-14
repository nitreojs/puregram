import type { RichLike, TelegramInputRichBlock, TelegramInputRichMessage, TelegramInputRichMessageMedia } from '@puregram/api'

import { RichError } from './error'
import type { Dialect } from './node'
import { serializeBlocks } from './serializers'

/** the emitted rich message — native blocks (default) or a raw dialect string, plus the InputRichMessage options */
export class Rich implements RichLike {
  isRtl?: boolean
  skipEntityDetection?: boolean

  constructor (
    readonly dialect: Dialect | 'blocks',
    readonly content: string | TelegramInputRichBlock[],
    readonly media?: TelegramInputRichMessageMedia[]
  ) {}

  /** the native block list — `undefined` for raw dialect envelopes */
  get blocks () {
    return this.dialect === 'blocks' ? this.blockContent : undefined
  }

  // dialect discriminates the content payload; a plain class can't express the union pairing
  private get blockContent () {
    return this.content as TelegramInputRichBlock[]
  }

  private get rawContent () {
    return this.content as string
  }

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

  /** serialize into a rich-markdown string (interop/debugging; envelope media must be urls) */
  toMarkdown () {
    return this.serialize('markdown')
  }

  /** serialize into a rich-html string (interop/debugging; envelope media must be urls) */
  toHtml () {
    return this.serialize('html')
  }

  /** the method arg — `{ blocks | [dialect], media?, is_rtl?, skip_entity_detection? }` */
  toInputRichMessage () {
    const out: TelegramInputRichMessage = this.dialect === 'blocks'
      ? { blocks: this.blockContent }
      : { [this.dialect]: this.content }

    if (this.media !== undefined && this.media.length > 0) {
      out.media = this.media
    }

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

  private serialize (dialect: Dialect) {
    if (this.dialect === 'blocks') {
      return serializeBlocks(this.blockContent, dialect)
    }

    if (this.dialect !== dialect) {
      throw new RichError(`cannot serialize a raw ${this.dialect} Rich to ${dialect}`)
    }

    return this.rawContent
  }
}
