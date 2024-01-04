import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'
import { VideoChatEnded, Message } from '../common/structures'

import { Telegram } from '../telegram'
import { applyMixins, memoizeGetters } from '../utils/helpers'
import { Constructor } from '../types/types'

import { Context } from './context'
import { NodeMixin, SendMixin, ChatActionMixin, TargetMixin, CloneMixin, ChatMemberControlMixin, PinsMixin, ChatControlMixin, ChatInviteControlMixin, ChatSenderControlMixin } from './mixins'

interface VideoChatEndedContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class VideoChatEndedContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor (options: VideoChatEndedContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'video_chat_ended',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Service message: video chat ended */
  get eventEnded () {
    return new VideoChatEnded(this.payload.video_chat_ended as Interfaces.TelegramVideoChatEnded)
  }
}

interface VideoChatEndedContext extends Constructor<VideoChatEndedContext>, Message, TargetMixin, SendMixin, ChatActionMixin, NodeMixin, ChatInviteControlMixin, ChatControlMixin, ChatSenderControlMixin, ChatMemberControlMixin, PinsMixin, CloneMixin<VideoChatEndedContext, VideoChatEndedContextOptions> { }
applyMixins(VideoChatEndedContext, [Message, TargetMixin, SendMixin, ChatActionMixin, NodeMixin, ChatInviteControlMixin, ChatControlMixin, ChatSenderControlMixin, ChatMemberControlMixin, PinsMixin, CloneMixin])
memoizeGetters(VideoChatEndedContext, ['eventEnded'])

inspectable(VideoChatEndedContext, {
  serialize (context) {
    return {
      id: context.id,
      from: context.from,
      senderId: context.senderId,
      createdAt: context.createdAt,
      chat: context.chat,
      chatId: context.chatId,
      chatType: context.chatType,
      eventEnded: context.eventEnded
    }
  }
})

export { VideoChatEndedContext }
