import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

import { filterPayload } from '../../utils/helpers'
import { CallbackQuery } from './callback-query'

import { ChatJoinRequest } from './chat-join-request'
import { ChatMemberUpdated } from './chat-member-updated'
import { ChosenInlineResult } from './chosen-inline-result'
import { InlineQuery } from './inline-query'
import { Message } from './message'
import { Poll } from './poll'
import { PollAnswer } from './poll-answer'
import { PreCheckoutQuery } from './pre-checkout-query'
import { ShippingQuery } from './shipping-query'

/**
 * This object represents an incoming update.
 *
 * At most **one** of the optional parameters can be present in any given
 * update.
 */
export class Update implements Structure {
  constructor (public payload: Interfaces.TelegramUpdate) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /**
   * The update's unique identifier.
   * Update identifiers start from a certain positive number and increase
   * sequentially. This ID becomes especially handy if you're using
   * **Webhooks**, since it allows you to ignore repeated updates or to restore
   * the correct update sequence, should they get out of order. If there are no
   * new updates for at least a week, then identifier of the next update will
   * be chosen randomly instead of sequentially.
   */
  get id () {
    return this.payload.update_id
  }

  /**
   * New incoming message of any kind — text, photo, sticker, etc.
   */
  get message () {
    const { message } = this.payload

    if (!message) {
      return
    }

    return new Message(message)
  }

  /** New version of a message that is known to the bot and was edited */
  get editedMessage () {
    const { edited_message } = this.payload

    if (!edited_message) {
      return
    }

    return new Message(edited_message)
  }

  /** New incoming channel post of any kind — text, photo, sticker, etc. */
  get channelPost () {
    const { channel_post } = this.payload

    if (!channel_post) {
      return
    }

    return new Message(channel_post)
  }

  /** New version of a channel post that is known to the bot and was edited */
  get editedChannelPost () {
    const { edited_channel_post } = this.payload

    if (!edited_channel_post) {
      return
    }

    return new Message(edited_channel_post)
  }

  /** New incoming inline query */
  get inlineQuery () {
    const { inline_query } = this.payload

    if (!inline_query) {
      return
    }

    return new InlineQuery(inline_query)
  }

  /**
   * The result of an inline query that was chosen by a user and sent to their
   * chat partner. Please see our documentation on the feedback collecting for
   * details on how to enable these updates for your bot.
   */
  get chosenInlineResult () {
    const { chosen_inline_result } = this.payload

    if (!chosen_inline_result) {
      return
    }

    return new ChosenInlineResult(chosen_inline_result)
  }

  /** New incoming callback query */
  get callbackQuery () {
    const { callback_query } = this.payload

    if (!callback_query) {
      return
    }

    return new CallbackQuery(callback_query)
  }

  /** New incoming shipping query. Only for invoices with flexible price */
  get shippingQuery () {
    const { shipping_query } = this.payload

    if (!shipping_query) {
      return
    }

    return new ShippingQuery(shipping_query)
  }

  /**
   * New incoming pre-checkout query. Contains full information about checkout
   */
  get preCheckoutQuery () {
    const { pre_checkout_query } = this.payload

    if (!pre_checkout_query) {
      return
    }

    return new PreCheckoutQuery(pre_checkout_query)
  }

  /**
   * New poll state. Bots receive only updates about stopped polls and polls,
   * which are sent by the bot
   */
  get poll () {
    const { poll } = this.payload

    if (!poll) {
      return
    }

    return new Poll(poll)
  }

  /**
   * A user changed their answer in a non-anonymous poll. Bots receive new
   * votes only in polls that were sent by the bot itself.
   */
  get pollAnswer () {
    const { poll_answer } = this.payload

    if (!poll_answer) {
      return
    }

    return new PollAnswer(poll_answer)
  }

  get myChatMember () {
    const { my_chat_member } = this.payload

    if (!my_chat_member) {
      return
    }

    return new ChatMemberUpdated(my_chat_member)
  }

  get chatMember () {
    const { chat_member } = this.payload

    if (!chat_member) {
      return
    }

    return new ChatMemberUpdated(chat_member)
  }

  get chatJoinRequest () {
    const { chat_join_request } = this.payload

    if (!chat_join_request) {
      return
    }

    return new ChatJoinRequest(chat_join_request)
  }

  toJSON () {
    return this.payload
  }
}

inspectable(Update, {
  serialize (struct) {
    const payload = {
      id: struct.id,
      message: struct.message,
      editedMessage: struct.editedMessage,
      channelPost: struct.channelPost,
      editedChannelPost: struct.editedChannelPost,
      inlineQuery: struct.inlineQuery,
      chosenInlineResult: struct.chosenInlineResult,
      callbackQuery: struct.callbackQuery,
      shippingQuery: struct.shippingQuery,
      preCheckoutQuery: struct.preCheckoutQuery,
      poll: struct.poll,
      pollAnswer: struct.pollAnswer
    }

    return filterPayload(payload)
  }
})
