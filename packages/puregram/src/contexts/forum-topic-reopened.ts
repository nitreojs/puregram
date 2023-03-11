import { Message } from '../common/structures'
import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { applyMixins } from '../utils/helpers'
import { Constructor } from '../types/types'

import { Context } from './context'
import { inspectable } from 'inspectable'
import { CloneMixin, NodeMixin, SendMixin, TargetMixin } from './mixins'

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
}

interface ForumTopicReopenedContext extends Constructor<ForumTopicReopenedContext>, Message, TargetMixin, SendMixin, NodeMixin, CloneMixin<ForumTopicReopenedContext, ForumTopicReopenedContextOptions> { }
applyMixins(ForumTopicReopenedContext, [Message, TargetMixin, SendMixin, NodeMixin, CloneMixin])

inspectable(ForumTopicReopenedContext, {
  serialize (context) {
    return { }
  }
})

export { ForumTopicReopenedContext }
