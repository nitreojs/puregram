import { inspectable } from 'inspectable'
import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { Constructor } from '../types/types'
import { applyMixins, filterPayload } from '../utils/helpers'
import { Context } from './context'
import { ChatActionMixin, ChatControlMixin, ChatInviteControlMixin, ChatMemberControlMixin, ChatSenderControlMixin, CloneMixin, ForumMixin, NodeMixin, PinsMixin, SendMixin, TargetMixin } from './mixins'
import { Message } from '../common/structures/message'

interface GiveawayWinnersContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

/** This object represents a message about the completion of a giveaway with public winners. */
class GiveawayWinnersContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor (options: GiveawayWinnersContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'giveaway_winners',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Giveaway winners */
  get eventGiveaway () {
    return this.giveawayWinners!
  }
}

interface GiveawayWinnersContext extends Constructor<GiveawayWinnersContext>, Message, TargetMixin, SendMixin, ChatActionMixin, NodeMixin, ForumMixin, ChatInviteControlMixin, ChatControlMixin, ChatSenderControlMixin, ChatMemberControlMixin, PinsMixin, CloneMixin<GiveawayWinnersContext, GiveawayWinnersContextOptions> {}
applyMixins(GiveawayWinnersContext, [Message, TargetMixin, SendMixin, ChatActionMixin, NodeMixin, ForumMixin, ChatInviteControlMixin, ChatControlMixin, ChatSenderControlMixin, ChatMemberControlMixin, PinsMixin, CloneMixin])

export { GiveawayWinnersContext }

inspectable(GiveawayWinnersContext, {
  serialize (context: GiveawayWinnersContext) {
    const payload = {
      id: context.id,
      createdAt: context.createdAt,
      chat: context.chat,
      chatId: context.chatId,
      chatType: context.chatType,
      eventGiveaway: context.eventGiveaway
    }

    return filterPayload(payload)
  }
})
