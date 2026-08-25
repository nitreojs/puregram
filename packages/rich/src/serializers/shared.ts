import type { TelegramInputRichBlock, TelegramRichMessageButton, TelegramRichText } from '@puregram/api'

import { RichError } from '../error'
import { escapeHtml } from '../escape'
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
    case 'document': return block.document
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
    case 'button': return plainText(text.button.text)
    default: return plainText(text.text)
  }
}

/** `<tg-button>` attributes — the only form either dialect documents for buttons */
export function buttonAttrs (button: TelegramRichMessageButton, escape: (value: string) => string = escapeHtml) {
  const style = button.style === undefined ? '' : ` style="${escape(button.style)}"`
  const head = (type: string) => ` type="${type}"${style}`

  if (button.url !== undefined) {
    return `${head('url')} url="${escape(button.url)}"`
  }

  if (button.callback_data !== undefined) {
    return `${head('callback_data')} data="${escape(button.callback_data)}"`
  }

  if (button.web_app !== undefined) {
    return `${head('web_app')} url="${escape(button.web_app.url)}"`
  }

  if (button.login_url !== undefined) {
    const login = button.login_url

    if (login.bot_username !== undefined) {
      throw new RichError('a login_url bot_username has no dialect attribute — send the buttons as native blocks')
    }

    const forwardText = login.forward_text === undefined ? '' : ` forward-text="${escape(login.forward_text)}"`
    const writeAccess = login.request_write_access === true ? ' request-write-access' : ''

    return `${head('login_url')} url="${escape(login.url)}"${forwardText}${writeAccess}`
  }

  if (button.switch_inline_query !== undefined) {
    return `${head('switch_inline_query')} query="${escape(button.switch_inline_query)}"`
  }

  if (button.switch_inline_query_current_chat !== undefined) {
    return `${head('switch_inline_query_current_chat')} query="${escape(button.switch_inline_query_current_chat)}"`
  }

  if (button.switch_inline_query_chosen_chat !== undefined) {
    const chosen = button.switch_inline_query_chosen_chat
    const flags = [
      chosen.allow_user_chats === true ? ' allow-user-chats' : '',
      chosen.allow_bot_chats === true ? ' allow-bot-chats' : '',
      chosen.allow_group_chats === true ? ' allow-group-chats' : '',
      chosen.allow_channel_chats === true ? ' allow-channel-chats' : ''
    ].join('')

    return `${head('switch_inline_query_chosen_chat')} query="${escape(chosen.query ?? '')}"${flags}`
  }

  if (button.copy_text !== undefined) {
    return `${head('copy_text')} text="${escape(button.copy_text.text)}"`
  }

  if (button.disabled !== undefined) {
    return head('disabled')
  }

  throw new RichError(`cannot serialize a button with no action: ${JSON.stringify(button)}`)
}

/** a paragraph holding exactly one `reference` node is a footnote definition */
export function footnoteReference (text: TelegramRichText) {
  return typeof text === 'object' && !Array.isArray(text) && text.type === 'reference' ? text : null
}
