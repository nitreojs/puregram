import { Message } from '../common/structures'
import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { applyMixins } from '../utils/helpers'
import { Constructor } from '../types/types'

import { Context } from './context'
import { inspectable } from 'inspectable'
import { CloneMixin, NodeMixin, PinsMixin, SendMixin, ChatActionMixin, TargetMixin } from './mixins'

interface UsersSharedContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

/** This object contains information about the users whose identifiers were shared with the bot using a `KeyboardButtonRequestUsers` button. */
class UsersSharedContext extends Context {
  payload: Interfaces.TelegramMessage

  private event: Interfaces.TelegramUsersShared

  constructor (options: UsersSharedContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'users_shared',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
    this.event = this.payload.user_shared as Interfaces.TelegramUsersShared
  }

  /** Identifier of the request */
  get requestId () {
    return this.event.request_id
  }

  /** Identifier of the shared user. This number may have more than 32 significant bits and some programming languages may have difficulty/silent defects in interpreting it. But it has at most 52 significant bits, so a 64-bit integer or double-precision float type are safe for storing this identifier. The bot may not have access to the user and could be unable to use this identifier, unless the user is already known to the bot by some other means. */
  get sharedUserIds () {
    return this.event.user_ids
  }
}

interface UsersSharedContext extends Constructor<UsersSharedContext>, Message, TargetMixin, SendMixin, ChatActionMixin, NodeMixin, PinsMixin, CloneMixin<UsersSharedContext, UsersSharedContextOptions> { }
applyMixins(UsersSharedContext, [Message, TargetMixin, SendMixin, ChatActionMixin, NodeMixin, PinsMixin, CloneMixin])

inspectable(UsersSharedContext, {
  serialize (context) {
    return {
      requestId: context.requestId,
      sharedUserIds: context.sharedUserIds
    }
  }
})

export { UsersSharedContext }
