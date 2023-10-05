import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { Constructor } from '../types/types'
import { Message } from '../common/structures'
import { applyMixins } from '../utils/helpers'

import { Context } from './context'
import { NodeMixin, SendMixin, TargetMixin, CloneMixin, ChatMemberControlMixin, PinsMixin, ChatControlMixin, ChatInviteControlMixin, ChatSenderControlMixin } from './mixins'

interface DeleteChatPhotoContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class DeleteChatPhotoContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor (options: DeleteChatPhotoContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'delete_chat_photo',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }
}

interface DeleteChatPhotoContext extends Constructor<DeleteChatPhotoContext>, Message, TargetMixin, SendMixin, NodeMixin, ChatInviteControlMixin, ChatControlMixin, ChatSenderControlMixin, ChatMemberControlMixin, PinsMixin, CloneMixin<DeleteChatPhotoContext, DeleteChatPhotoContextOptions> { }
applyMixins(DeleteChatPhotoContext, [Message, TargetMixin, SendMixin, NodeMixin, ChatInviteControlMixin, ChatControlMixin, ChatSenderControlMixin, ChatMemberControlMixin, PinsMixin, CloneMixin])

inspectable(DeleteChatPhotoContext, {
  serialize (context) {
    return {
      id: context.id,
      from: context.from,
      senderId: context.senderId,
      createdAt: context.createdAt,
      chat: context.chat,
      chatId: context.chatId,
      chatType: context.chatType
    }
  }
})

export { DeleteChatPhotoContext }
