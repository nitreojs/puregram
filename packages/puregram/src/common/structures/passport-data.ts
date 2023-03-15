import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

import { EncryptedPassportElement } from './encrypted-passport-element'
import { EncryptedCredentials } from './encrypted-credentials'

/**
 * Contains information about Telegram Passport data shared with the bot by the
 * user.
 */
@Inspectable()
export class PassportData implements Structure {
  constructor (public payload: Interfaces.TelegramPassportData) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /**
   * Array with information about documents and other Telegram Passport
   * elements that was shared with the bot
   */
  @Inspect({ nullable: false })
  get data () {
    const { data } = this.payload

    if (!data) {
      return
    }

    return data.map(element => new EncryptedPassportElement(element))
  }

  /** Encrypted credentials required to decrypt the data */
  @Inspect()
  get credentials () {
    return new EncryptedCredentials(this.payload.credentials)
  }

  toJSON () {
    return this.payload
  }
}
