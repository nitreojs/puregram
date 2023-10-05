import * as Methods from '../../generated/methods'

import { Optional, RequireValue } from '../../types/types'

import { Context } from '../context'
import { NodeMixin } from './node'

interface ForumMixinMetadata {
  get threadId(): number | undefined
}

// TODO: there probably is a way to hide all irrelevant methods unless type guard said so
/** This object represents a mixin that's used in all topic-related updates  */
class ForumMixin {
  /** Checks whether this topic is actually a 'General' one */
  isGeneralTopic (): this is RequireValue<this, 'threadId', undefined> {
    return this.threadId === undefined
  }

  /** Returns custom emoji stickers, which can be used as a forum topic icon by any user */
  getTopicIcons () {
    return this.telegram.api.getForumTopicIconStickers()
  }

  /** Creates a topic */
  createTopic (name: string, params?: Optional<Methods.CreateForumTopicParams, 'chat_id' | 'name'>) {
    return this.telegram.api.createForumTopic({
      chat_id: this.chatId,
      name,
      ...params
    })
  }

  /** Edits topic info */
  editTopic (params: Optional<Methods.EditForumTopicParams, 'chat_id' | 'message_thread_id'>) {
    if (this.isGeneralTopic()) {
      throw new TypeError('called `editTopic` on a General topic; use `editGeneralTopic` instead')
    }

    return this.telegram.api.editForumTopic({
      chat_id: this.chatId,
      message_thread_id: this.threadId!,
      ...params
    })
  }

  /** Edits General topic info */
  editGeneralTopic (params: Optional<Methods.EditGeneralForumTopicParams, 'chat_id'>) {
    return this.telegram.api.editGeneralForumTopic({
      chat_id: this.chatId,
      ...params
    })
  }

  /** Closes topic */
  closeTopic () {
    if (this.isGeneralTopic()) {
      throw new TypeError('called `closeTopic` on a General topic; use `closeGeneralTopic` instead')
    }

    return this.telegram.api.closeForumTopic({
      chat_id: this.chatId,
      message_thread_id: this.threadId!
    })
  }

  /** Closes General topic */
  closeGeneralTopic () {
    return this.telegram.api.closeGeneralForumTopic({
      chat_id: this.chatId
    })
  }

  /** Reopens topic */
  reopenTopic () {
    if (this.isGeneralTopic()) {
      throw new TypeError('called `reopenTopic` on a General topic; use `reopenGeneralTopic` instead')
    }

    return this.telegram.api.reopenForumTopic({
      chat_id: this.chatId,
      message_thread_id: this.threadId!
    })
  }

  /** Reopens General topic */
  reopenGeneralTopic () {
    return this.telegram.api.reopenGeneralForumTopic({
      chat_id: this.chatId
    })
  }

  /** Deletes topic along with all its messages */
  deleteTopic () {
    if (this.isGeneralTopic()) {
      throw new TypeError('called `deleteTopic` on a General topic')
    }

    return this.telegram.api.deleteForumTopic({
      chat_id: this.chatId,
      message_thread_id: this.threadId!
    })
  }

  /** Clears the list of pinned messages */
  unpinAllTopicMessages () {
    if (this.isGeneralTopic()) {
      throw new TypeError('called `unpinAllTopicMessages` on a General topic; use `unpinAllGeneralTopicMessages` instead')
    }

    return this.telegram.api.unpinAllForumTopicMessages({
      chat_id: this.chatId,
      message_thread_id: this.threadId!
    })
  }

  /** Clears the list of pinned messages in a General topic */
  unpinAllGeneralTopicMessages () {
    return this.telegram.api.unpinAllGeneralForumTopicMessages({
      chat_id: this.chatId
    })
  }

  /** Hides General topic */
  hideGeneralTopic () {
    return this.telegram.api.hideGeneralForumTopic({
      chat_id: this.chatId
    })
  }

  /** Unhides General topic */
  unhideGeneralTopic () {
    return this.telegram.api.unhideGeneralForumTopic({
      chat_id: this.chatId
    })
  }
}

interface ForumMixin extends Context, ForumMixinMetadata, NodeMixin { }

export { ForumMixin }
