import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

interface TextButtonParams {
  text: string

  payload?: Record<string, any> | string
}

interface UrlButtonParams {
  text: string
  url: string

  payload?: Record<string, any> | string
}

interface WebAppButtonParams {
  text: string
  url: string
}

interface SwitchToCurrentChatButtonParams {
  text: string
  query: string
}

interface SwitchToChatButtonParams {
  text: string
  query: string
}

interface GameButtonParams {
  text: string
  game: Interfaces.TelegramCallbackGame
}

interface PayButtonParams {
  text: string
}

interface LoginButtonParams {
  text: string
  loginUrl: Interfaces.TelegramLoginUrl
}

/** Inline keyboard */
export class InlineKeyboard {
  private buttons: Interfaces.TelegramInlineKeyboardButton[][] = []

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /** Assemble a builder of buttons */
  static keyboard(
    rows: (Interfaces.TelegramInlineKeyboardButton | Interfaces.TelegramInlineKeyboardButton[])[]
  ): InlineKeyboard {
    const inlineKeyboard = new InlineKeyboard()

    for (const row of rows) {
      inlineKeyboard.addRow(row)
    }

    return inlineKeyboard
  }

  /** Generate text button */
  static textButton(params: TextButtonParams): Interfaces.TelegramInlineKeyboardButton {
    if (typeof params.payload === 'object') {
      params.payload = JSON.stringify(params.payload)
    }

    return {
      text: params.text,
      callback_data: params.payload || ''
    }
  }

  /** Generate URL button */
  static urlButton(params: UrlButtonParams): Interfaces.TelegramInlineKeyboardButton {
    if (typeof params.payload === 'object') {
      params.payload = JSON.stringify(params.payload)
    }

    return {
      text: params.text,
      url: params.url,
      callback_data: params.payload || ''
    }
  }

  /** Generate Web App button */
  static webAppButton(params: WebAppButtonParams): Interfaces.TelegramInlineKeyboardButton {
    return {
      text: params.text,
      web_app: { url: params.url }
    }
  }

  /** Generate button that will switch to current chat and type the query */
  static switchToCurrentChatButton(
    params: SwitchToCurrentChatButtonParams
  ): Interfaces.TelegramInlineKeyboardButton {
    return {
      text: params.text,
      switch_inline_query_current_chat: params.query
    }
  }

  /** Generate button that will prompt user to select one of their chats */
  static switchToChatButton(
    params: SwitchToChatButtonParams
  ): Interfaces.TelegramInlineKeyboardButton {
    return {
      text: params.text,
      switch_inline_query: params.query
    }
  }

  /** Generate game button */
  static gameButton(params: GameButtonParams): Interfaces.TelegramInlineKeyboardButton {
    return {
      text: params.text,
      callback_game: params.game
    }
  }

  /** Generate pay button */
  static payButton(params: PayButtonParams): Interfaces.TelegramInlineKeyboardButton {
    return {
      pay: true,
      text: params.text
    }
  }

  /** Generate login button */
  static loginButton(params: LoginButtonParams): Interfaces.TelegramInlineKeyboardButton {
    return {
      login_url: params.loginUrl,
      text: params.text
    }
  }

  private addRow(row: Interfaces.TelegramInlineKeyboardButton[] | Interfaces.TelegramInlineKeyboardButton) {
    if (!Array.isArray(row)) row = [row]

    this.buttons.push(row)

    return this
  }

  /** Returns JSON which is compatible with Telegram's `InlineKeyboardMarkup` interface */
  toJSON(): Interfaces.TelegramInlineKeyboardMarkup {
    return {
      inline_keyboard: this.buttons
    }
  }

  toString() {
    return JSON.stringify(this)
  }
}

inspectable(InlineKeyboard, {
  serialize(keyboard) {
    return keyboard.toJSON()
  }
})
