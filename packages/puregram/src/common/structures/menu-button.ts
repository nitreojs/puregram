import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

import { Structure } from '../../types/interfaces'

import { WebAppInfo } from './web-app-info'

/** This object describes the bot's menu button in a private chat. */
export class MenuButton implements Structure {
  constructor (public payload: Interfaces.TelegramMenuButton) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Type of the button */
  get type () {
    return this.payload.type
  }

  /** Text on the button */
  get text () {
    return this.payload.text
  }

  /**
   * Description of the Web App that will be launched when the user presses the button.
   * The Web App will be able to send an arbitrary message on behalf of the user
   * using the method `answerWebAppQuery`.
   */
  get webApp () {
    const { web_app } = this.payload

    if (!web_app) {
      return
    }

    return new WebAppInfo(web_app)
  }

  toJSON () {
    return this.payload
  }
}

inspectable(MenuButton, {
  serialize (struct) {
    const payload = {
      type: struct.type,
      text: struct.text,
      webApp: struct.webApp
    }

    return filterPayload(payload)
  }
})
