import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

import { LoginUrl } from './login-url'
import { CallbackGame } from './callback-game'

export class InlineKeyboardButton {
  constructor(private payload: Interfaces.TelegramInlineKeyboardButton) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /** Label text on the button */
  get text() {
    return this.payload.text
  }

  /** HTTP or tg:// url to be opened when button is pressed */
  get url() {
    return this.payload.url
  }

  /**
   * An HTTP URL used to automatically authorize the user.
   * Can be used as a replacement for the Telegram Login Widget.
   */
  get loginUrl() {
    const { login_url } = this.payload

    if (!login_url) {
      return
    }

    return new LoginUrl(login_url)
  }

  /**
   * Data to be sent in a callback query to the bot when button is pressed,
   * 1-64 bytes
   */
  get callbackData() {
    return this.payload.callback_data
  }

  /**
   * If set, pressing the button will prompt the user to select one of their
   * chats, open that chat and insert the bot's username and the specified
   * inline query in the input field. Can be empty, in which case just the
   * bot's username will be inserted.
   *
   * **Note**: This offers an easy way for users to start using your bot in
   * inline mode when they are currently in a private chat with it. Especially
   * useful when combined with `switch_pm…` actions – in this case the user will
   * be automatically returned to the chat they switched from, skipping the
   * chat selection screen.
   */
  get switchInlineQuery() {
    return this.payload.switch_inline_query
  }

  /**
   * If set, pressing the button will insert the bot's username and the
   * specified inline query in the current chat's input field. Can be empty, in
   * which case only the bot's username will be inserted.
   *
   * This offers a quick way for the user to open your bot in inline mode in
   * the same chat – good for selecting something from multiple options.
   */
  get switchInlineQueryCurrentChat() {
    return this.payload.switch_inline_query_current_chat
  }

  /**
   * Description of the game that will be launched when the user presses the
   * button.
   *
   * **NOTE**: This type of button **must** always be the first button in the
   * first row.
   */
  get callbackGame() {
    const { callback_game } = this.payload

    if (!callback_game) {
      return
    }

    return new CallbackGame(callback_game)
  }

  /**
   * Specify `true`, to send a Pay button.
   *
   * **NOTE**: This type of button **must** always be the first button in the first row.
   */
  get pay() {
    return this.payload.pay
  }
}

inspectable(InlineKeyboardButton, {
  serialize(struct) {
    const payload = {
      text: struct.text,
      url: struct.url,
      loginUrl: struct.loginUrl,
      callbackData: struct.callbackData,
      switchInlineQuery: struct.switchInlineQuery,
      switchInlineQueryCurrentChat: struct.switchInlineQueryCurrentChat,
      callbackGame: struct.callbackGame,
      pay: struct.pay
    }

    return filterPayload(payload)
  }
})
