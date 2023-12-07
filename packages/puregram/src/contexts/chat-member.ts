import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'
import { ChatMemberUpdated } from '../common/structures'

import { Telegram } from '../telegram'
import { UpdateName, Constructor, Require } from '../types/types'
import { applyMixins } from '../utils/helpers'

import { Context } from './context'
import { SendMixin, ChatActionMixin, TargetMixin, CloneMixin, ChatControlMixin } from './mixins'

interface ChatMemberContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramChatMemberUpdated
  updateId: number
  type?: UpdateName
}

class ChatMemberContext extends Context {
  payload: Interfaces.TelegramChatMemberUpdated

  constructor (options: ChatMemberContextOptions) {
    super({
      telegram: options.telegram,
      updateType: options.type ?? 'chat_member',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Does this update have `invite_link` property? */
  hasInviteLink (): this is Require<this, 'inviteLink'> {
    return this.inviteLink !== undefined
  }
}

// @ts-expect-error [senderId: number] is not compatible with [senderId: number | undefined] :shrug:
interface ChatMemberContext extends Constructor<ChatMemberContext>, ChatMemberUpdated, TargetMixin, SendMixin, ChatActionMixin, ChatControlMixin, CloneMixin<ChatMemberContext, ChatMemberContextOptions> { }
applyMixins(ChatMemberContext, [ChatMemberUpdated, TargetMixin, SendMixin, ChatActionMixin, ChatControlMixin, CloneMixin])

inspectable(ChatMemberContext, {
  serialize (context) {
    return {
      senderId: context.senderId,
      chatId: context.chatId,
      chatType: context.chatType,
      oldChatMember: context.oldChatMember,
      newChatMember: context.newChatMember,
      date: context.date,
      inviteLink: context.inviteLink
    }
  }
})

export { ChatMemberContext }
