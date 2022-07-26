import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'
import { VideoChatParticipantsInvited, Message } from '../common/structures'

import { Telegram } from '../telegram'
import { applyMixins } from '../utils/helpers'
import { Constructor } from '../types/types'

import { Context } from './context'
import { NodeMixin, SendMixin, TargetMixin, CloneMixin } from './mixins'

interface VideoChatParticipantsInvitedContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class VideoChatParticipantsInvitedContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor (options: VideoChatParticipantsInvitedContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'video_chat_participants_invited',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Service message: new participants invited to a video chat */
  get eventParticipantsInvited () {
    return new VideoChatParticipantsInvited(this.payload.video_chat_participants_invited as Interfaces.TelegramVideoChatParticipantsInvited)
  }
}

interface VideoChatParticipantsInvitedContext extends Constructor<VideoChatParticipantsInvitedContext>, Message, TargetMixin, SendMixin, NodeMixin, CloneMixin<VideoChatParticipantsInvitedContext, VideoChatParticipantsInvitedContextOptions> { }
applyMixins(VideoChatParticipantsInvitedContext, [Message, TargetMixin, SendMixin, NodeMixin, CloneMixin])

inspectable(VideoChatParticipantsInvitedContext, {
  serialize (context) {
    return {
      id: context.id,
      from: context.from,
      senderId: context.senderId,
      createdAt: context.createdAt,
      chat: context.chat,
      chatId: context.chatId,
      chatType: context.chatType,
      eventParticipantsInvited: context.eventParticipantsInvited
    }
  }
})

export { VideoChatParticipantsInvitedContext }
