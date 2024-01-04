import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'
import { VideoChatScheduled, Message } from '../common/structures'

import { Telegram } from '../telegram'
import { applyMixins, memoizeGetters } from '../utils/helpers'
import { Constructor } from '../types/types'

import { Context } from './context'
import { NodeMixin, SendMixin, ChatActionMixin, TargetMixin, CloneMixin, ChatMemberControlMixin, PinsMixin, ChatControlMixin, ChatInviteControlMixin, ChatSenderControlMixin } from './mixins'

interface VideoChatScheduledContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class VideoChatScheduledContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor (options: VideoChatScheduledContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'video_chat_scheduled',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Service message: video chat scheduled */
  get eventScheduled () {
    return new VideoChatScheduled(this.payload.video_chat_scheduled as Interfaces.TelegramVideoChatScheduled)
  }
}

interface VideoChatScheduledContext extends Constructor<VideoChatScheduledContext>, Message, TargetMixin, SendMixin, ChatActionMixin, NodeMixin, ChatInviteControlMixin, ChatControlMixin, ChatSenderControlMixin, ChatMemberControlMixin, PinsMixin, CloneMixin<VideoChatScheduledContext, VideoChatScheduledContextOptions> { }
applyMixins(VideoChatScheduledContext, [Message, TargetMixin, SendMixin, ChatActionMixin, NodeMixin, ChatInviteControlMixin, ChatControlMixin, ChatSenderControlMixin, ChatMemberControlMixin, PinsMixin, CloneMixin])
memoizeGetters(VideoChatScheduledContext, ['eventScheduled'])

inspectable(VideoChatScheduledContext, {
  serialize (context) {
    return {
      id: context.id,
      from: context.from,
      senderId: context.senderId,
      createdAt: context.createdAt,
      chat: context.chat,
      chatId: context.chatId,
      chatType: context.chatType,
      eventScheduled: context.eventScheduled
    }
  }
})

export { VideoChatScheduledContext }
