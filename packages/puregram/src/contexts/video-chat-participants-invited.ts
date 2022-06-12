import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'
import { VideoChatParticipantsInvited } from '../common/structures'

import { Telegram } from '../telegram'
import { applyMixins } from '../utils/helpers'
import { Message } from '../updates/'

import { Context } from './context'
import { NodeMixin, SendMixin, TargetMixin } from './mixins'

interface VideoChatParticipantsInvitedContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class VideoChatParticipantsInvitedContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor(options: VideoChatParticipantsInvitedContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'video_chat_participants_invited',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  clone(options?: VideoChatParticipantsInvitedContextOptions) {
    return new VideoChatParticipantsInvitedContext({
      telegram: this.telegram,
      payload: this.payload,
      updateId: this.updateId!,
      update: this.update!,
      ...options
    })
  }

  /** Service message: new participants invited to a video chat */
  get videoChatParticipantsInvited() {
    return new VideoChatParticipantsInvited(this.payload.video_chat_participants_invited!)
  }
}

interface VideoChatParticipantsInvitedContext extends Message, TargetMixin, SendMixin, NodeMixin { }
applyMixins(VideoChatParticipantsInvitedContext, [Message, TargetMixin, SendMixin, NodeMixin])

inspectable(VideoChatParticipantsInvitedContext, {
  serialize(context) {
    return {
      id: context.id,
      from: context.from,
      senderId: context.senderId,
      createdAt: context.createdAt,
      chat: context.chat,
      chatId: context.chatId,
      chatType: context.chatType,
      videoChatParticipantsInvited: context.videoChatParticipantsInvited
    }
  }
})

export { VideoChatParticipantsInvitedContext }
