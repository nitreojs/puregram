import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'
import { VideoChatStarted, Message } from '../common/structures'

import { Telegram } from '../telegram'
import { applyMixins } from '../utils/helpers'
import { Constructor } from '../types/types'

import { Context } from './context'
import { NodeMixin, SendMixin, TargetMixin, CloneMixin, ChatMemberControlMixin, PinsMixin, ChatControlMixin, ChatInviteControlMixin, ChatSenderControlMixin } from './mixins'

interface VideoChatStartedContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class VideoChatStartedContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor (options: VideoChatStartedContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'video_chat_started',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Service message: video chat started */
  get eventStarted () {
    return new VideoChatStarted(this.payload.video_chat_started as Interfaces.TelegramVideoChatStarted)
  }
}

interface VideoChatStartedContext extends Constructor<VideoChatStartedContext>, Message, TargetMixin, SendMixin, NodeMixin, ChatInviteControlMixin, ChatControlMixin, ChatSenderControlMixin, ChatMemberControlMixin, PinsMixin, CloneMixin<VideoChatStartedContext, VideoChatStartedContextOptions> { }
applyMixins(VideoChatStartedContext, [Message, TargetMixin, SendMixin, NodeMixin, ChatInviteControlMixin, ChatControlMixin, ChatSenderControlMixin, ChatMemberControlMixin, PinsMixin, CloneMixin])

inspectable(VideoChatStartedContext, {
  serialize (context) {
    return {
      id: context.id,
      from: context.from,
      senderId: context.senderId,
      createdAt: context.createdAt,
      chat: context.chat,
      chatId: context.chatId,
      chatType: context.chatType,
      eventStarted: context.eventStarted
    }
  }
})

export { VideoChatStartedContext }
