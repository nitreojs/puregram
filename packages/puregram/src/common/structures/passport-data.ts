import { inspectable } from 'inspectable'

import { TelegramPassportData, TelegramEncryptedPassportElement } from '../../generated/telegram-interfaces'

import { EncryptedPassportElement } from './encrypted-passport-element'
import { EncryptedCredentials } from './encrypted-credentials'

/**
 * Contains information about Telegram Passport data shared with the bot by the
 * user.
 */
export class PassportData {
  constructor(private payload: TelegramPassportData) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /**
   * Array with information about documents and other Telegram Passport
   * elements that was shared with the bot
   */
  get data() {
    const { data } = this.payload

    if (!data) {
      return []
    }

    return data.map(
      (element: TelegramEncryptedPassportElement) => (
        new EncryptedPassportElement(element)
      )
    )
  }

  /** Encrypted credentials required to decrypt the data */
  get credentials() {
    return new EncryptedCredentials(this.payload.credentials)
  }
}

inspectable(PassportData, {
  serialize(passport: PassportData) {
    return {
      data: passport.data,
      credentials: passport.credentials
    }
  }
})
