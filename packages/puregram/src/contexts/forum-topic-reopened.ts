import { Message } from '../common/structures'
import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { applyMixins } from '../utils/helpers'
import { Constructor, RequireValue } from '../types/types'

import { Context } from './context'
import { inspectable } from 'inspectable'
import { ChatControlMixin, ChatInviteControlMixin, ChatMemberControlMixin, ChatSenderControlMixin, CloneMixin, ForumMixin, NodeMixin, PinsMixin, SendMixin, TargetMixin } from './mixins'

interface ForumTopicReopenedContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

/** This object represents a service message about a forum topic reopened in the chat. Currently holds no information. */
class ForumTopicReopenedContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor (options: ForumTopicReopenedContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'forum_topic_reopened',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Checks whether this topic is actually a 'General' one */
  isGeneralTopic (): this is RequireValue<this, 'threadId', undefined> {
    return this.threadId === undefined
  }
}

interface ForumTopicReopenedContext extends Constructor<ForumTopicReopenedContext>, Message, TargetMixin, SendMixin, NodeMixin, ForumMixin, ChatInviteControlMixin, ChatControlMixin, ChatSenderControlMixin, ChatMemberControlMixin, PinsMixin, CloneMixin<ForumTopicReopenedContext, ForumTopicReopenedContextOptions> { }
applyMixins(ForumTopicReopenedContext, [Message, TargetMixin, SendMixin, NodeMixin, ForumMixin, ChatInviteControlMixin, ChatControlMixin, ChatSenderControlMixin, ChatMemberControlMixin, PinsMixin, CloneMixin])

inspectable(ForumTopicReopenedContext, {
  serialize (context) {
    return {}
  }
})

export { ForumTopicReopenedContext }
