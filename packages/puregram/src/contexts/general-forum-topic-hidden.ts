import { Message } from '../common/structures'
import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { applyMixins } from '../utils/helpers'
import { Constructor, RequireValue } from '../types/types'

import { Context } from './context'
import { inspectable } from 'inspectable'
import { CloneMixin, NodeMixin, SendMixin, TargetMixin } from './mixins'

interface GeneralForumTopicHiddenContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

/** This object represents a service message about General forum topic hidden in the chat. Currently holds no information. */
class GeneralForumTopicHiddenContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor (options: GeneralForumTopicHiddenContextOptions) {
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

interface GeneralForumTopicHiddenContext extends Constructor<GeneralForumTopicHiddenContext>, Message, TargetMixin, SendMixin, NodeMixin, CloneMixin<GeneralForumTopicHiddenContext, GeneralForumTopicHiddenContextOptions> { }
applyMixins(GeneralForumTopicHiddenContext, [Message, TargetMixin, SendMixin, NodeMixin, CloneMixin])

inspectable(GeneralForumTopicHiddenContext, {
  serialize (context) {
    return {}
  }
})

export { GeneralForumTopicHiddenContext }
