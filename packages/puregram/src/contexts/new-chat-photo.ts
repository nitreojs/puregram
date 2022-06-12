import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'
import { PhotoSize } from '../common/structures'

import { Telegram } from '../telegram'
import { Message } from '../updates/'
import { applyMixins } from '../utils/helpers'
import { Constructor } from '../types/types'

import { Context } from './context'
import { NodeMixin, SendMixin, TargetMixin, CloneMixin } from './mixins'

interface NewChatPhotoContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class NewChatPhotoContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor(options: NewChatPhotoContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'new_chat_photo',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** New chat photo */
  get eventPhoto() {
    return this.payload.new_chat_photo!.map(
      (size: Interfaces.TelegramPhotoSize) => new PhotoSize(size)
    )
  }
}

interface NewChatPhotoContext extends Constructor<NewChatPhotoContext>, Message, TargetMixin, SendMixin, NodeMixin, CloneMixin<NewChatPhotoContext, NewChatPhotoContextOptions> { }
applyMixins(NewChatPhotoContext, [Message, TargetMixin, SendMixin, NodeMixin, CloneMixin])

inspectable(NewChatPhotoContext, {
  serialize(context) {
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
