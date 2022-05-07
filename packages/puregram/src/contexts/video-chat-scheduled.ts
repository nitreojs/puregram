import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'
import { VideoChatScheduled } from '../common/structures'

import { Telegram } from '../telegram'
import { applyMixins } from '../utils/helpers'
import { Message } from '../updates/'

import { Context } from './context'
import { NodeMixin, SendMixin, TargetMixin } from './mixins'

interface VideoChatScheduledContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class VideoChatScheduledContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor(options: VideoChatScheduledContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'video_chat_scheduled',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Service message: video chat scheduled */
  get videoChatScheduled() {
    return new VideoChatScheduled(this.payload.video_chat_scheduled!)
  }
}

interface VideoChatScheduledContext extends Message, TargetMixin, SendMixin, NodeMixin { }
applyMixins(VideoChatScheduledContext, [Message, TargetMixin, SendMixin, NodeMixin])

inspectable(VideoChatScheduledContext, {
  serialize(context: VideoChatScheduledContext) {
    return {
      id: context.id,
      from: context.from,
      senderId: context.senderId,
      createdAt: context.createdAt,
      chat: context.chat,
      chatId: context.chatId,
      chatType: context.chatType,
      videoChatScheduled: context.videoChatScheduled
    }
  }
})

export { VideoChatScheduledContext }
