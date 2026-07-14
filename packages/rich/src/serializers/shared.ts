import type { TelegramInputRichBlock, TelegramRichText } from '@puregram/api'

import { RichError } from '../error'
import type { RichMediaKind } from '../media'

/** the media block kinds — each carries its `InputMedia` payload under its own type key */
export type RichMediaBlock = Extract<TelegramInputRichBlock, { type: RichMediaKind }>

export interface MediaPayload {
  url: string
  spoiler: boolean
}

function inputMedia (block: RichMediaBlock) {
  switch (block.type) {
    case 'photo': return block.photo
    case 'video': return block.video
    case 'audio': return block.audio
    case 'animation': return block.animation
    case 'voice_note': return block.voice_note
  }
}

/** pulls the http(s) url out of a media block; MediaSource envelopes have no string form */
export function mediaPayload (block: RichMediaBlock) {
  const input = inputMedia(block)

  // MediaSource envelopes intentionally travel through the string-typed `media` field
  if (typeof input.media !== 'string') {
    throw new RichError('cannot serialize MediaSource media to a dialect string — send blocks natively')
  }

  return { url: input.media, spoiler: 'has_spoiler' in input && input.has_spoiler === true }
}

/** flattens rich text to its raw characters — for `pre` blocks, whose content is never styled */
export function plainText (text: TelegramRichText): string {
  if (typeof text === 'string') {
    return text
  }

  if (Array.isArray(text)) {
    return text.map(t => plainText(t)).join('')
  }

  switch (text.type) {
    case 'anchor': return ''
    case 'custom_emoji': return text.alternative_text
    case 'mathematical_expression': return text.expression
    default: return plainText(text.text)
  }
}

/** a paragraph holding exactly one `reference` node is a footnote definition */
export function footnoteReference (text: TelegramRichText) {
  return typeof text === 'object' && !Array.isArray(text) && text.type === 'reference' ? text : null
}
