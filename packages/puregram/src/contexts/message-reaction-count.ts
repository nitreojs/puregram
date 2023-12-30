import { MessageReactionCountUpdated } from '../common/structures/message-reaction-count-updated'
import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { Constructor } from '../types/types'
import { applyMixins } from '../utils/helpers'
import { Context } from './context'
import { CloneMixin, NodeMixin, SendMixin } from './mixins'

interface MessageReactionCountContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessageReactionCountUpdated
  updateId: number
}

/** This object represents reaction changes on a message with anonymous reactions. */
class MessageReactionCountContext extends Context {
  payload: Interfaces.TelegramMessageReactionCountUpdated

  constructor (options: MessageReactionCountContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'message_reaction_count',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }
}

interface MessageReactionCountContext extends Constructor<MessageReactionCountContext>, MessageReactionCountUpdated, SendMixin, NodeMixin, CloneMixin<MessageReactionCountContext, MessageReactionCountContextOptions> { }
applyMixins(MessageReactionCountContext, [MessageReactionCountUpdated, SendMixin, NodeMixin, CloneMixin])

export { MessageReactionCountContext }
