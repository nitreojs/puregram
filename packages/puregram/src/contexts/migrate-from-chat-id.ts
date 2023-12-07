import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { Constructor } from '../types/types'
import { Message } from '../common/structures'
import { applyMixins } from '../utils/helpers'

import { Context } from './context'
import { NodeMixin, SendMixin, ChatActionMixin, TargetMixin, CloneMixin, PinsMixin, ChatInviteControlMixin } from './mixins'

interface MigrateFromChatIdContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class MigrateFromChatIdContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor (options: MigrateFromChatIdContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'migrate_from_chat_id',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Chat ID */
  get eventId () {
    return this.payload.migrate_to_chat_id as number
  }
}

interface MigrateFromChatIdContext extends Constructor<MigrateFromChatIdContext>, Message, TargetMixin, SendMixin, ChatActionMixin, NodeMixin, PinsMixin, ChatInviteControlMixin, CloneMixin<MigrateFromChatIdContext, MigrateFromChatIdContextOptions> { }
applyMixins(MigrateFromChatIdContext, [Message, TargetMixin, SendMixin, ChatActionMixin, NodeMixin, PinsMixin, ChatInviteControlMixin, CloneMixin])

inspectable(MigrateFromChatIdContext, {
  serialize (context) {
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
