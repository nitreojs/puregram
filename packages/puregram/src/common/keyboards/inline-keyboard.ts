import { inspectable } from 'inspectable'

import {
  TelegramInlineKeyboardButton,
  TelegramCallbackGame,
  TelegramLoginUrl,
  TelegramInlineKeyboardMarkup
} from '../../telegram-interfaces'

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
  game: TelegramCallbackGame
}

interface PayButtonParams {
  text: string
}

interface LoginButtonParams {
  text: string
  loginUrl: TelegramLoginUrl
}

/** Inline keyboard */
export class InlineKeyboard {
  private buttons: TelegramInlineKeyboardButton[][] = []

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /** Assemble a builder of buttons */
  static keyboard(
    rows: (TelegramInlineKeyboardButton | TelegramInlineKeyboardButton[])[]
  ): InlineKeyboard {
    const inlineKeyboard = new InlineKeyboard()

    for (const row of rows) {
      inlineKeyboard.addRow(row)
    }

    return inlineKeyboard
  }

  /** Generate text button */
  static textButton(params: TextButtonParams): TelegramInlineKeyboardButton {
    if (typeof params.payload === 'object') {
      params.payload = JSON.stringify(params.payload)
    }

    return {
      text: params.text,
      callback_data: params.payload || ''
    }
  }

  /** Generate URL button */
  static urlButton(params: UrlButtonParams): TelegramInlineKeyboardButton {
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
  static webAppButton(params: WebAppButtonParams): TelegramInlineKeyboardButton {
    return {
      text: params.text,
      web_app: { url: params.url }
    }
  }

  /** Generate button that will switch to current chat and type the query */
  static switchToCurrentChatButton(
    params: SwitchToCurrentChatButtonParams
  ): TelegramInlineKeyboardButton {
    return {
      text: params.text,
      switch_inline_query_current_chat: params.query
    }
  }

  /** Generate button that will prompt user to select one of their chats */
  static switchToChatButton(
    params: SwitchToChatButtonParams
  ): TelegramInlineKeyboardButton {
    return {
      text: params.text,
      switch_inline_query: params.query
    }
  }

  /** Generate game button */
  static gameButton(params: GameButtonParams): TelegramInlineKeyboardButton {
    return {
      text: params.text,
      callback_game: params.game
    }
  }

  /** Generate pay button */
  static payButton(params: PayButtonParams): TelegramInlineKeyboardButton {
    return {
      pay: true,
      text: params.text
    }
  }

  /** Generate login button */
  static loginButton(params: LoginButtonParams): TelegramInlineKeyboardButton {
    return {
      login_url: params.loginUrl,
      text: params.text
    }
  }

  private addRow(row: TelegramInlineKeyboardButton[] | TelegramInlineKeyboardButton): this {
    if (!Array.isArray(row)) row = [row]

    this.buttons.push(row)

    return this
  }

  toJSON(): TelegramInlineKeyboardMarkup {
    return {
      inline_keyboard: this.buttons
    }
  }

  toString() {
    return JSON.stringify(this)
  }
}

inspectable(InlineKeyboard, {
  serialize(keyboard: InlineKeyboard) {
    return keyboard.toJSON()
  }
})
