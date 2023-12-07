import { Message } from '../common/structures'
import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { applyMixins } from '../utils/helpers'
import { Constructor } from '../types/types'

import { Context } from './context'
import { inspectable } from 'inspectable'
import { ChatControlMixin, ChatInviteControlMixin, ChatMemberControlMixin, ChatSenderControlMixin, CloneMixin, ForumMixin, NodeMixin, PinsMixin, SendMixin, ChatActionMixin, TargetMixin } from './mixins'

interface ForumTopicClosedContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

/** This object represents a service message about a forum topic closed in the chat. Currently holds no information. */
class ForumTopicClosedContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor (options: ForumTopicClosedContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'forum_topic_closed',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }
}

interface ForumTopicClosedContext extends Constructor<ForumTopicClosedContext>, Message, TargetMixin, SendMixin, ChatActionMixin, NodeMixin, ForumMixin, ChatInviteControlMixin, ChatControlMixin, ChatSenderControlMixin, ChatMemberControlMixin, PinsMixin, CloneMixin<ForumTopicClosedContext, ForumTopicClosedContextOptions> { }
applyMixins(ForumTopicClosedContext, [Message, TargetMixin, SendMixin, ChatActionMixin, NodeMixin, ForumMixin, ChatInviteControlMixin, ChatControlMixin, ChatSenderControlMixin, ChatMemberControlMixin, PinsMixin, CloneMixin])

inspectable(ForumTopicClosedContext, {
  serialize (context) {
    return {}
  }
})

export { ForumTopicClosedContext }
