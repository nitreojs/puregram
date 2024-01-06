import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'
import * as Methods from '../generated/methods'

import { ChosenInlineResult } from '../common/structures'
import { Telegram } from '../telegram'
import { filterPayload, applyMixins } from '../utils/helpers'
import { Constructor, Require } from '../types/types'

import { Context } from './context'
import { SendMixin, ChatActionMixin, CloneMixin } from './mixins'
import { InlineKeyboard, InlineKeyboardBuilder } from '../common'

interface ChosenInlineResultContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramChosenInlineResult
  updateId: number
}

/**
 * The result of an inline query that was chosen by
 * a user and sent to their chat partner
 */
class ChosenInlineResultContext extends Context {
  payload: Interfaces.TelegramChosenInlineResult

  constructor (options: ChosenInlineResultContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'chosen_inline_result',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Checks if the result has `location` property */
  hasLocation (): this is Require<this, 'location'> {
    return this.location !== undefined
  }

  /** Checks if the query has `inlineMessageId` property */
  hasInlineMessageId (): this is Require<this, 'inlineMessageId'> {
    return this.inlineMessageId !== undefined
  }

  /** Edits a callback query messages text */
  editText (
    text: Methods.EditMessageTextParams['text'],
    params?: Partial<Methods.EditMessageTextParams>
  ) {
    if (!this.hasInlineMessageId()) {
      throw new TypeError('cannot edit a message without an `inlineMessageId` property')
    }

    return this.telegram.api.editMessageText({
      inline_message_id: this.inlineMessageId,
      text,
      ...params
    })
  }

  /** Edits a callback query messages caption */
  editCaption (
    caption: NonNullable<Methods.EditMessageCaptionParams['caption']>,
    params?: Partial<Methods.EditMessageCaptionParams>
  ) {
    if (!this.hasInlineMessageId()) {
      throw new TypeError('cannot edit a message without an `inlineMessageId` property')
    }

    return this.telegram.api.editMessageCaption({
      inline_message_id: this.inlineMessageId,
      caption,
      ...params
    })
  }

  /** Edits a callback query messages media */
  editMedia (
    media: Methods.EditMessageMediaParams['media'],
    params?: Partial<Methods.EditMessageMediaParams>
  ) {
    if (!this.hasInlineMessageId()) {
      throw new TypeError('cannot edit a message without an `inlineMessageId` property')
    }

    return this.telegram.api.editMessageMedia({
      inline_message_id: this.inlineMessageId,
      media,
      ...params
    })
  }

  /** Edits a callback query messages live location */
  editLiveLocation (params: Methods.EditMessageLiveLocationParams) {
    if (!this.hasInlineMessageId()) {
      throw new TypeError('cannot edit a message without an `inlineMessageId` property')
    }

    return this.telegram.api.editMessageLiveLocation({
      inline_message_id: this.inlineMessageId,
      ...params
    })
  }

  /** Stops a callback query messages live location */
  stopLiveLocation (params?: Methods.StopMessageLiveLocationParams) {
    if (!this.hasInlineMessageId()) {
      throw new TypeError('cannot edit a message without an `inlineMessageId` property')
    }

    return this.telegram.api.stopMessageLiveLocation({
      inline_message_id: this.inlineMessageId,
      ...params
    })
  }

  /** Edits a callback query messages reply markup */
  editReplyMarkup (
    replyMarkup: InlineKeyboard | InlineKeyboardBuilder | Interfaces.TelegramInlineKeyboardMarkup,
    params?: Partial<Methods.EditMessageReplyMarkupParams>
  ) {
    if (!this.hasInlineMessageId()) {
      throw new TypeError('cannot edit a message without an `inlineMessageId` property')
    }

    return this.telegram.api.editMessageReplyMarkup({
      inline_message_id: this.inlineMessageId,
      reply_markup: replyMarkup,
      ...params
    })
  }
}

// @ts-expect-error [senderId: number] is not compatible with [senderId: number | undefined] :shrug:
interface ChosenInlineResultContext extends Constructor<ChosenInlineResultContext>, ChosenInlineResult, SendMixin, ChatActionMixin, CloneMixin<ChosenInlineResultContext, ChosenInlineResultContextOptions> { }
applyMixins(ChosenInlineResultContext, [ChosenInlineResult, SendMixin, ChatActionMixin, CloneMixin])

inspectable(ChosenInlineResultContext, {
  serialize (result) {
    const payload = {
      resultId: result.resultId,
      from: result.from,
      senderId: result.senderId,
      location: result.location,
      inlineMessageId: result.inlineMessageId,
      query: result.query
    }

    return filterPayload(payload)
  }
})

export { ChosenInlineResultContext }
