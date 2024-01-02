import { Inspect, Inspectable } from 'inspectable'

import * as Contexts from '../contexts'
import * as Methods from '../generated/methods'

import { Telegram } from '../telegram'
import { Optional } from '../types/types'

interface MediaGroupOptions {
  id: string
  contexts: Contexts.MessageContext[]
  telegram: Telegram
}

/** This object represents a media group: a group of contexts with some attachments in it */
@Inspectable()
export class MediaGroup {
  constructor (private options: MediaGroupOptions) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Returns media group's ID */
  @Inspect()
  get id () {
    return this.options.id
  }

  /** Returns a list of contexts (constructed earlier) every single of which contains an attachment */
  @Inspect()
  get contexts () {
    return this.options.contexts
  }

  /** Returns a list of attachments (mapped through `contexts`) */
  @Inspect()
  get attachments () {
    const attachments = this.contexts.map(context => context.attachment)

    return attachments
  }

  /** Forwards a whole media group to `chatId` */
  forward (
    chatId: string | number = this.contexts[0].chatId!,
    params: Optional<Methods.ForwardMessagesParams, 'chat_id' | 'from_chat_id' | 'message_ids'> = {}
  ) {
    return this.options.telegram.api.forwardMessages({
      chat_id: chatId,
      from_chat_id: this.contexts[0].chatId!,
      message_ids: this.contexts.map(c => c.id),
      ...params
    })
  }

  /** Copies a whole media group to `chatId` */
  copy (
    chatId: string | number = this.contexts[0].chatId!,
    params: Optional<Methods.CopyMessagesParams, 'chat_id' | 'from_chat_id' | 'message_ids'> = {}
  ) {
    return this.options.telegram.api.copyMessages({
      chat_id: chatId,
      from_chat_id: this.contexts[0].chatId!,
      message_ids: this.contexts.map(c => c.id),
      ...params
    })
  }

  /** Deletes whole media group */
  delete (params: Optional<Methods.DeleteMessagesParams, 'chat_id' | 'message_ids'> = {}) {
    return this.options.telegram.api.deleteMessages({
      chat_id: this.contexts[0].chatId!,
      message_ids: this.contexts.map(c => c.id),
      ...params
    })
  }
}
