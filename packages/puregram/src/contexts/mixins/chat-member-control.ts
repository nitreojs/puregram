import * as Methods from '../../generated/methods'
import * as Interfaces from '../../generated/telegram-interfaces'

import { Optional } from '../../types/types'

import { Context } from '../context'

import { NodeMixin } from './node'
import { TargetMixin } from './target'

/** This object represents a mixin that is able to control member's rights */
class ChatMemberControlMixin {
  /** Bans a user (o_O) */
  banMember (params?: Optional<Methods.BanChatMemberParams, 'chat_id' | 'user_id'>) {
    return this.telegram.api.banChatMember({
      chat_id: this.chatId,
      user_id: this.senderId!,
      ...params
    })
  }

  /** Unbans a user (O_o) */
  unbanMember (params?: Optional<Methods.UnbanChatMemberParams, 'chat_id' | 'user_id'>) {
    return this.telegram.api.unbanChatMember({
      chat_id: this.chatId,
      user_id: this.senderId!,
      ...params
    })
  }

  /** Restricts a user (O_O) */
  restrictMember (permissions: Interfaces.TelegramChatPermissions, params?: Optional<Methods.RestrictChatMemberParams, 'chat_id' | 'user_id'>) {
    return this.telegram.api.restrictChatMember({
      chat_id: this.chatId,
      permissions,
      user_id: this.senderId!,
      ...params
    })
  }

  /** Promotes/demotes a user (o_o) */
  promoteMember (params?: Optional<Methods.PromoteChatMemberParams, 'chat_id' | 'user_id'>) {
    return this.telegram.api.promoteChatMember({
      chat_id: this.chatId,
      user_id: this.senderId!,
      ...params
    })
  }
}

interface ChatMemberControlMixin extends Context, TargetMixin, NodeMixin { }

export { ChatMemberControlMixin }
