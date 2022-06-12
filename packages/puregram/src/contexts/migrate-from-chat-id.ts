import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { Message } from '../updates/'
import { applyMixins } from '../utils/helpers'

import { Context } from './context'
import { NodeMixin, SendMixin, TargetMixin } from './mixins'

interface MigrateFromChatIdContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class MigrateFromChatIdContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor(options: MigrateFromChatIdContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'migrate_from_chat_id',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  clone(options?: MigrateFromChatIdContextOptions) {
    return new MigrateFromChatIdContext({
      telegram: this.telegram,
      payload: this.payload,
      updateId: this.updateId!,
      update: this.update!,
      ...options
    })
  }

  /** Chat ID */
  get eventId() {
    return this.payload.migrate_to_chat_id!
  }
}

interface MigrateFromChatIdContext extends Message, TargetMixin, SendMixin, NodeMixin { }
applyMixins(MigrateFromChatIdContext, [Message, TargetMixin, SendMixin, NodeMixin])

inspectable(MigrateFromChatIdContext, {
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

export { MigrateFromChatIdContext }
