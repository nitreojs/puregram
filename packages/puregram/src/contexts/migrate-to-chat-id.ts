import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { Message } from '../updates/'
import { applyMixins } from '../utils/helpers'

import { Context } from './context'
import { NodeMixin, SendMixin, TargetMixin } from './mixins'

interface MigrateToChatIdContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class MigrateToChatIdContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor(options: MigrateToChatIdContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'migrate_to_chat_id',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Chat ID */
  get eventId() {
    return this.payload.migrate_to_chat_id!
  }
}

interface MigrateToChatIdContext extends Message, TargetMixin, SendMixin, NodeMixin { }
applyMixins(MigrateToChatIdContext, [Message, TargetMixin, SendMixin, NodeMixin])

inspectable(MigrateToChatIdContext, {
  serialize(context) {
    return {
      id: context.id,
      from: context.from,
      senderId: context.senderId,
      createdAt: context.createdAt,
      chat: context.chat,
      chatId: context.chatId,
      chatType: context.chatType,
      eventId: context.eventId
    }
  }
})

export { MigrateToChatIdContext }
