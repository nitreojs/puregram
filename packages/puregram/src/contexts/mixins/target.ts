import { Chat, User } from '../../common/structures'
import { ChatType } from '../../types/enums'
import { Require, RequireValue } from '../../types/types'
import { memoizeGetters } from '../../utils/helpers'

/** This object represents a mixin which has sender data (e.g. `senderId`, `from` etc.) */
class TargetMixin {
  payload!: Record<string, any>

  /** Checks if the instance has `from` and `senderId` properties */
  hasFrom (): this is Require<this, 'from' | 'senderId'> {
    return this.payload.from !== undefined
  }

  /** Sender, empty for messages sent to channels */
  get from () {
    const { from } = this.payload

    if (!from) {
      return
    }

    return new User(from)
  }

  /** Checks if the instance has `senderChat` property */
  hasSenderChat (): this is Require<this, 'senderChat'> {
    return this.payload.sender_chat !== undefined
  }

  /**
   * Sender of the message, sent on behalf of a chat.
   * The channel itself for channel messages.
   * The supergroup itself for messages from anonymous group administrators.
   * The linked channel for messages automatically forwarded to the discussion group
   */
  get senderChat () {
    const { sender_chat } = this.payload

    if (!sender_chat) {
      return
    }

    return new Chat(sender_chat)
  }

  /** Conversation the message belongs to */
  get chat () {
    return new Chat(this.payload.chat)
  }

  /** Sender's ID */
  get senderId () {
    return this.from?.id
  }

  /** Chat ID */
  get chatId () {
    return this.chat.id
  }

  /** Chat type */
  get chatType () {
    return this.chat.type
  }

  /** Is this chat a private one? */
  isPM (): this is RequireValue<this, 'chatType', ChatType.Private> {
    return this.chatType === ChatType.Private
  }

  /** Is this chat a group? */
  isGroup (): this is RequireValue<this, 'chatType', ChatType.Group> {
    return this.chatType === ChatType.Group
  }

  /** Is this chat a supergroup? */
  isSupergroup (): this is RequireValue<this, 'chatType', ChatType.Supergroup> {
    return this.chatType === ChatType.Supergroup
  }

  /** Is this chat a channel? */
  isChannel (): this is RequireValue<this, 'chatType', ChatType.Channel> {
    return this.chatType === ChatType.Channel
  }
}

interface TargetMixin { }
memoizeGetters(TargetMixin, ['from', 'senderChat', 'chat'])

export { TargetMixin }
