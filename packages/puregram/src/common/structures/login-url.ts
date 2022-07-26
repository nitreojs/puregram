import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

import { Structure } from '../../types/interfaces'

/**
 * This object represents a parameter of the inline keyboard button used to
 * automatically authorize a user.
 */
export class LoginUrl implements Structure {
  constructor (private payload: Interfaces.TelegramLoginUrl) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /**
   * An HTTP URL to be opened with user authorization data added to the query
   * string when the button is pressed. If the user refuses to provid
   * authorization data, the original URL without information about the user
   * will be opened. The data added is the same as described in Receiving
   * authorization data.
   *
   * **NOTE**: You **must** always check the hash of the received data to
   * verify the authentication and the integrity of the data as described in
   * Checking authorization.
   */
  get url () {
    return this.payload.url
  }

  /** New text of the button in forwarded messages. */
  get forwardText () {
    return this.payload.forward_text
  }

  /**
   * Username of a bot, which will be used for user authorization.
   * See Setting up a bot for more details. If not specified, the current
   * bot's username will be assumed. The url's domain must be the same as the
   * domain linked with the bot. See Linking your domain to the bot for more
   * details.
   */
  get botUsername () {
    return this.payload.bot_username
  }

  /**
   * Pass `true` to request the permission for your bot to send messages to the
   * user.
   */
  get requestWriteAccess () {
    return this.payload.request_write_access
  }

  toJSON (): Interfaces.TelegramLoginUrl {
    return {
      url: this.url,
      forward_text: this.forwardText,
      bot_username: this.botUsername,
      request_write_access: this.requestWriteAccess
    }
  }
}

inspectable(LoginUrl, {
  serialize (struct) {
    const payload = {
      url: struct.url,
      forwardText: struct.forwardText,
      botUsername: struct.botUsername,
      requestWriteAccess: struct.requestWriteAccess
    }

    return filterPayload(payload)
  }
})
