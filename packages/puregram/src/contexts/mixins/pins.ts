import * as Methods from '../../generated/methods'

import { Optional } from '../../types/types'

import { Context } from '../context'
import { NodeMixin } from './node'
import { TargetMixin } from './target'

/** This object represents a mixin that ensures you have methods to pin/unpin messages in the chat */
class PinsMixin {
  /** Adds message to the list of pinned messages */
  pinChatMessage (params?: Optional<Methods.PinChatMessageParams, 'chat_id' | 'message_id'>) {
    return this.telegram.api.pinChatMessage({
      chat_id: this.chatId,
      message_id: this.id,
      ...params
    })
  }

  /** Removes message from the list of pinned messages  */
  unpinChatMessage (params?: Optional<Methods.UnpinChatMessageParams, 'chat_id' | 'message_id'>) {
    return this.telegram.api.unpinChatMessage({
      chat_id: this.chatId,
      message_id: this.id,
      ...params
    })
  }

  /** Clears the list of pinned messages */
  unpinAllChatMessages (params?: Optional<Methods.UnpinAllChatMessagesParams, 'chat_id'>) {
    return this.telegram.api.unpinAllChatMessages({
      chat_id: this.chatId,
      ...params
    })
  }
}

interface PinsMixin extends Context, TargetMixin, NodeMixin { }

export { PinsMixin }
