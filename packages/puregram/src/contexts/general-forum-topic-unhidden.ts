import { Message } from '../common/structures'
import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { applyMixins } from '../utils/helpers'
import { Constructor, RequireValue } from '../types/types'

import { Context } from './context'
import { inspectable } from 'inspectable'
import { CloneMixin, ForumMixin, NodeMixin, SendMixin, TargetMixin } from './mixins'

interface GeneralForumTopicUnhiddenContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

/** This object represents a service message about General forum topic unhidden in the chat. Currently holds no information. */
class GeneralForumTopicUnhiddenContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor (options: GeneralForumTopicUnhiddenContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'general_forum_topic_hidden',
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

interface GeneralForumTopicUnhiddenContext extends Constructor<GeneralForumTopicUnhiddenContext>, Message, TargetMixin, SendMixin, NodeMixin, ForumMixin, CloneMixin<GeneralForumTopicUnhiddenContext, GeneralForumTopicUnhiddenContextOptions> { }
applyMixins(GeneralForumTopicUnhiddenContext, [Message, TargetMixin, SendMixin, NodeMixin, ForumMixin, CloneMixin])

inspectable(GeneralForumTopicUnhiddenContext, {
  serialize (context) {
    return {}
  }
})

export { GeneralForumTopicUnhiddenContext }
