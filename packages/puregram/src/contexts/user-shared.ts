import { Message } from '../common/structures'
import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { applyMixins } from '../utils/helpers'
import { Constructor } from '../types/types'

import { Context } from './context'
import { inspectable } from 'inspectable'
import { CloneMixin, NodeMixin, PinsMixin, SendMixin, ChatActionMixin, TargetMixin } from './mixins'

interface UserSharedContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

/** This object contains information about the user whose identifier was shared with the bot using a `KeyboardButtonRequestUser` button. */
class UserSharedContext extends Context {
  payload: Interfaces.TelegramMessage

  private event: Interfaces.TelegramUserShared

  constructor (options: UserSharedContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'user_shared',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
    this.event = this.payload.user_shared as Interfaces.TelegramUserShared
  }

  /** Identifier of the request */
  get requestId () {
    return this.event.request_id
  }

  /** Identifier of the shared user. This number may have more than 32 significant bits and some programming languages may have difficulty/silent defects in interpreting it. But it has at most 52 significant bits, so a 64-bit integer or double-precision float type are safe for storing this identifier. The bot may not have access to the user and could be unable to use this identifier, unless the user is already known to the bot by some other means. */
  get sharedUserId () {
    return this.event.user_id
  }
}

interface UserSharedContext extends Constructor<UserSharedContext>, Message, TargetMixin, SendMixin, ChatActionMixin, NodeMixin, PinsMixin, CloneMixin<UserSharedContext, UserSharedContextOptions> { }
applyMixins(UserSharedContext, [Message, TargetMixin, SendMixin, ChatActionMixin, NodeMixin, PinsMixin, CloneMixin])

inspectable(UserSharedContext, {
  serialize (context) {
    return {
      requestId: context.requestId,
      sharedUserId: context.sharedUserId
    }
  }
})

export { UserSharedContext }
