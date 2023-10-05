import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'
import { PhotoSize, Message } from '../common/structures'

import { Telegram } from '../telegram'
import { applyMixins } from '../utils/helpers'
import { Constructor } from '../types/types'

import { Context } from './context'
import { NodeMixin, SendMixin, TargetMixin, CloneMixin, ChatMemberControlMixin, PinsMixin, ChatControlMixin, ChatInviteControlMixin, ChatSenderControlMixin } from './mixins'

interface NewChatPhotoContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class NewChatPhotoContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor (options: NewChatPhotoContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'new_chat_photo',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** New chat photo */
  get eventPhoto () {
    const sizes = this.payload.new_chat_photo as Interfaces.TelegramPhotoSize[]

    return sizes.map(size => new PhotoSize(size))
  }
}

interface NewChatPhotoContext extends Constructor<NewChatPhotoContext>, Message, TargetMixin, SendMixin, NodeMixin, ChatInviteControlMixin, ChatControlMixin, ChatSenderControlMixin, ChatMemberControlMixin, PinsMixin, CloneMixin<NewChatPhotoContext, NewChatPhotoContextOptions> { }
applyMixins(NewChatPhotoContext, [Message, TargetMixin, SendMixin, NodeMixin, ChatInviteControlMixin, ChatControlMixin, ChatSenderControlMixin, ChatMemberControlMixin, PinsMixin, CloneMixin])

inspectable(NewChatPhotoContext, {
  serialize (context) {
    return {
      id: context.id,
      from: context.from,
      senderId: context.senderId,
      createdAt: context.createdAt,
      chat: context.chat,
      chatId: context.chatId,
      chatType: context.chatType,
      eventPhoto: context.eventPhoto
    }
  }
})

export { NewChatPhotoContext }
