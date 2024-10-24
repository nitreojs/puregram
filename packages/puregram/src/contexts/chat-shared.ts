import { Message, PhotoSize } from '../common/structures'
import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { applyMixins, filterPayload } from '../utils/helpers'
import { Constructor } from '../types/types'

import { Context } from './context'
import { inspectable } from 'inspectable'
import { CloneMixin, NodeMixin, PinsMixin, SendMixin, ChatActionMixin, TargetMixin } from './mixins'
import { PhotoAttachment } from '../common'

interface ChatSharedContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

/** This object contains information about the chat whose identifier was shared with the bot using a `KeyboardButtonRequestChat` button. */
class ChatSharedContext extends Context {
  payload: Interfaces.TelegramMessage

  private event: Interfaces.TelegramChatShared

  constructor (options: ChatSharedContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'chat_shared',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
    this.event = this.payload.chat_shared as Interfaces.TelegramChatShared
  }

  /** Identifier of the request */
  get requestId () {
    return this.event.request_id
  }

  /** Identifier of the shared chat. This number may have more than 32 significant bits and some programming languages may have difficulty/silent defects in interpreting it. But it has at most 52 significant bits, so a 64-bit integer or double-precision float type are safe for storing this identifier. The bot may not have access to the chat and could be unable to use this identifier, unless the chat is already known to the bot by some other means. */
  get sharedChatId () {
    return this.event.chat_id
  }

  /** Title of the chat, if the title was requested by the bot. */
  get sharedTitle () {
    return this.event.title
  }

  /** Username of the chat, if the username was requested by the bot and available. */
  get sharedUsername () {
    return this.event.username
  }

  /** Available sizes of the chat photo, if the photo was requested by the bot */
  get sharedPhoto () {
    const { photo } = this.event

    if (photo === undefined) {
      return
    }

    return new PhotoAttachment(photo.map(size => new PhotoSize(size)))
  }
}

interface ChatSharedContext extends Constructor<ChatSharedContext>, Message, TargetMixin, SendMixin, ChatActionMixin, NodeMixin, PinsMixin, CloneMixin<ChatSharedContext, ChatSharedContextOptions> { }
applyMixins(ChatSharedContext, [Message, TargetMixin, SendMixin, ChatActionMixin, NodeMixin, PinsMixin, CloneMixin])

inspectable(ChatSharedContext, {
  serialize (context) {
    const payload = {
      requestId: context.requestId,
      sharedChatId: context.sharedChatId,
      sharedTitle: context.sharedTitle,
      sharedUsername: context.sharedUsername,
      sharedPhoto: context.sharedPhoto
    }

    return filterPayload(payload)
  }
})

export { ChatSharedContext }
