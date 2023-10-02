import { Message } from '../common/structures'
import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { applyMixins, filterPayload } from '../utils/helpers'
import { Constructor, Require, RequireValue } from '../types/types'

import { Context } from './context'
import { inspectable } from 'inspectable'
import { CloneMixin, NodeMixin, SendMixin, TargetMixin } from './mixins'

interface ForumTopicCreatedContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

/** This object represents a service message about a new forum topic created in the chat. */
class ForumTopicCreatedContext extends Context {
  payload: Interfaces.TelegramMessage

  private event: Interfaces.TelegramForumTopicCreated

  constructor (options: ForumTopicCreatedContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'forum_topic_created',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
    this.event = this.payload.forum_topic_created as Interfaces.TelegramForumTopicCreated
  }

  /** Checks whether this topic is actually a 'General' one */
  isGeneralTopic (): this is RequireValue<this, 'threadId', undefined> {
    return this.threadId === undefined
  }

  /** Name of the topic */
  get name () {
    return this.event.name
  }

  /** Color of the topic icon in RGB format */
  get iconColor () {
    return this.event.icon_color
  }

  /** Unique identifier of the custom emoji shown as the topic icon */
  get iconCustomEmojiId () {
    return this.event.icon_custom_emoji_id
  }

  /** Checks whether the event has `iconCustomEmojiId` property */
  hasIconCustomEmojiId (): this is Require<this, 'iconCustomEmojiId'> {
    return this.iconCustomEmojiId !== undefined
  }
}

interface ForumTopicCreatedContext extends Constructor<ForumTopicCreatedContext>, Message, TargetMixin, SendMixin, NodeMixin, CloneMixin<ForumTopicCreatedContext, ForumTopicCreatedContextOptions> { }
applyMixins(ForumTopicCreatedContext, [Message, TargetMixin, SendMixin, NodeMixin, CloneMixin])

inspectable(ForumTopicCreatedContext, {
  serialize (context) {
    const payload = {
      name: context.name,
      iconColor: context.iconColor,
      iconCustomEmojiId: context.iconCustomEmojiId
    }

    return filterPayload(payload)
  }
})

export { ForumTopicCreatedContext }
