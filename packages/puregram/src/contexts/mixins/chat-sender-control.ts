import * as Methods from '../../generated/methods'
import { Optional } from '../../types/types'

import { Context } from '../context'

import { TargetMixin } from './target'

/** This object is a mixin that does all the chat-sender stuff, right? */
class ChatSenderControlMixin {
  /** Bans a channel chat */
  banChatSender (senderChatId: number, params?: Optional<Methods.BanChatSenderChatParams, 'chat_id' | 'sender_chat_id'>) {
    return this.telegram.api.banChatSenderChat({
      chat_id: this.chatId,
      sender_chat_id: senderChatId,
      ...params
    })
  }

  /** Unbans a channel chat */
  unbanChatSender (senderChatId: number, params?: Optional<Methods.UnbanChatSenderChatParams, 'chat_id' | 'sender_chat_id'>) {
    return this.telegram.api.unbanChatSenderChat({
      chat_id: this.chatId,
      sender_chat_id: senderChatId,
      ...params
    })
  }
}

interface ChatSenderControlMixin extends Context, TargetMixin { }

export { ChatSenderControlMixin }
