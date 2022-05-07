import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'
import { VideoChatStarted } from '../common/structures'

import { Telegram } from '../telegram'
import { applyMixins } from '../utils/helpers'
import { Message } from '../updates/'

import { Context } from './context'
import { NodeMixin, SendMixin, TargetMixin } from './mixins'

interface VideoChatStartedContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class VideoChatStartedContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor(options: VideoChatStartedContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'video_chat_started',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Service message: video chat started */
  get videoChatStarted() {
    return new VideoChatStarted(this.payload.video_chat_started!)
  }
}

interface VideoChatStartedContext extends Message, TargetMixin, SendMixin, NodeMixin { }
applyMixins(VideoChatStartedContext, [Message, TargetMixin, SendMixin, NodeMixin])

inspectable(VideoChatStartedContext, {
  serialize(context: VideoChatStartedContext) {
    return {
      id: context.id,
      from: context.from,
      senderId: context.senderId,
      createdAt: context.createdAt,
      chat: context.chat,
      chatId: context.chatId,
      chatType: context.chatType,
      videoChatStarted: context.videoChatStarted
    }
  }
})

export { VideoChatStartedContext }
