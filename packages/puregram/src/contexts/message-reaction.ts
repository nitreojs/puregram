import { Require, Constructor } from '../types/types'
import { MessageReactionUpdated } from '../common/structures/message-reaction-updated'
import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { applyMixins, filterPayload } from '../utils/helpers'
import { Context } from './context'
import { CloneMixin, NodeMixin, SendMixin } from './mixins'
import { inspectable } from 'inspectable'

interface MessageReactionContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessageReactionUpdated
  updateId: number
}

/** This object represents a change of a reaction on a message performed by a user. */
class MessageReactionContext extends Context {
  payload: Interfaces.TelegramMessageReactionUpdated

  constructor (options: MessageReactionContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'message_reaction',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Checks if context has the `user` property */
  hasUser (): this is Require<this, 'user'> {
    return this.user !== undefined
  }

  /** Checks if context has the `actorChat` property */
  hasActorChat (): this is Require<this, 'actorChat'> {
    return this.actorChat !== undefined
  }
}

interface MessageReactionContext extends Constructor<MessageReactionContext>, MessageReactionUpdated, SendMixin, NodeMixin, CloneMixin<MessageReactionContext, MessageReactionContextOptions> { }
applyMixins(MessageReactionContext, [MessageReactionUpdated, SendMixin, NodeMixin, CloneMixin])

export { MessageReactionContext }

inspectable(MessageReactionContext, {
  serialize (context: MessageReactionContext) {
    const payload = {
      id: context.id,
      chat: context.chat,
      user: context.user,
      actorChat: context.actorChat,
      date: context.date,
      oldReactions: context.oldReactions,
      newReactions: context.newReactions
    }

    return filterPayload(payload)
  }
})
