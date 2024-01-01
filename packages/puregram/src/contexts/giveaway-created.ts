import { inspectable } from 'inspectable'
import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { Constructor } from '../types/types'
import { applyMixins } from '../utils/helpers'
import { Context } from './context'
import { ChatActionMixin, ChatControlMixin, ChatInviteControlMixin, ChatMemberControlMixin, ChatSenderControlMixin, CloneMixin, ForumMixin, NodeMixin, PinsMixin, SendMixin, TargetMixin } from './mixins'
import { Message } from '../common/structures/message'

interface GiveawayCreatedContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

/** This object represents a service message about the creation of a scheduled giveaway. Currently holds no information. */
class GiveawayCreatedContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor (options: GiveawayCreatedContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'giveaway_created',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }
}

interface GiveawayCreatedContext extends Constructor<GiveawayCreatedContext>, Message, TargetMixin, SendMixin, ChatActionMixin, NodeMixin, ForumMixin, ChatInviteControlMixin, ChatControlMixin, ChatSenderControlMixin, ChatMemberControlMixin, PinsMixin, CloneMixin<GiveawayCreatedContext, GiveawayCreatedContextOptions> {}
applyMixins(GiveawayCreatedContext, [Message, TargetMixin, SendMixin, ChatActionMixin, NodeMixin, ForumMixin, ChatInviteControlMixin, ChatControlMixin, ChatSenderControlMixin, ChatMemberControlMixin, PinsMixin, CloneMixin])

export { GiveawayCreatedContext }

inspectable(GiveawayCreatedContext, {
  serialize (context: GiveawayCreatedContext) {
    return {
      id: context.id,
      createdAt: context.createdAt,
      chat: context.chat,
      chatId: context.chatId,
      chatType: context.chatType
    }
  }
})
