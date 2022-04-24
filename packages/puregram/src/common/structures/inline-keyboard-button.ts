import { inspectable } from 'inspectable'

import { TelegramInlineKeyboardButton } from '../../telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

import { LoginUrl } from './login-url'
import { CallbackGame } from './callback-game'

export class InlineKeyboardButton {
  constructor(private payload: TelegramInlineKeyboardButton) { }

  get [Symbol.toStringTag](): string {
    return this.constructor.name
  }

  /** Label text on the button */
  get text(): string {
    return this.payload.text
  }

  /** HTTP or tg:// url to be opened when button is pressed */
  get url(): string | undefined {
    return this.payload.url
  }

  /**
   * An HTTP URL used to automatically authorize the user.
   * Can be used as a replacement for the Telegram Login Widget.
   */
  get loginUrl(): LoginUrl | undefined {
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
  get callbackData(): string | undefined {
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
  get switchInlineQuery(): string | undefined {
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
  get switchInlineQueryCurrentChat(): string | undefined {
    return this.payload.switch_inline_query_current_chat
  }

  /**
   * Description of the game that will be launched when the user presses the
   * button.
   *
   * **NOTE**: This type of button **must** always be the first button in the
   * first row.
   */
  get callbackGame(): CallbackGame | undefined {
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
  get pay(): boolean | undefined {
    return this.payload.pay
  }
}

inspectable(InlineKeyboardButton, {
  serialize(button: InlineKeyboardButton) {
    const payload = {
      text: button.text,
      url: button.url,
      loginUrl: button.loginUrl,
      callbackData: button.callbackData,
      switchInlineQuery: button.switchInlineQuery,
      switchInlineQueryCurrentChat: button.switchInlineQueryCurrentChat,
      callbackGame: button.callbackGame,
      pay: button.pay
    }

    return filterPayload(payload)
  }
})
