import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

/** Contains data sent from a Web App to the bot. */
export class WebAppData {
  constructor(private payload: Interfaces.TelegramWebAppData) { }

  /** The data. Be aware that a bad client can send arbitrary data in this field. */
  get data() {
    return this.payload.data
  }

  /**
   * Text of the `web_app` keyboard button, from which the Web App was opened.
   * Be aware that a bad client can send arbitrary data in this field.
   */
  get buttonText() {
    return this.payload.button_text
  }
}

inspectable(WebAppData, {
  serialize(struct) {
    return {
      data: struct.data,
      buttonText: struct.buttonText
    }
  }
})
