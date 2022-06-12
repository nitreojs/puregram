import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'
import { VideoChatEnded } from '../common/structures'

import { Telegram } from '../telegram'
import { applyMixins } from '../utils/helpers'
import { Message } from '../updates/'
import { Constructor } from '../types/types'

import { Context } from './context'
import { NodeMixin, SendMixin, TargetMixin, CloneMixin } from './mixins'

interface VideoChatEndedContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class VideoChatEndedContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor(options: VideoChatEndedContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'video_chat_ended',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Service message: video chat ended */
  get videoChatEnded() {
    return new VideoChatEnded(this.payload.video_chat_ended!)
  }
}

interface VideoChatEndedContext extends Constructor<VideoChatEndedContext>, Message, TargetMixin, SendMixin, NodeMixin, CloneMixin<VideoChatEndedContext, VideoChatEndedContextOptions> { }
applyMixins(VideoChatEndedContext, [Message, TargetMixin, SendMixin, NodeMixin, CloneMixin])

inspectable(VideoChatEndedContext, {
  serialize(context) {
    return {
      id: context.id,
      from: context.from,
      senderId: context.senderId,
      createdAt: context.createdAt,
      chat: context.chat,
      chatId: context.chatId,
      chatType: context.chatType,
      videoChatEnded: context.videoChatEnded
    }
  }
})

export { VideoChatEndedContext }
