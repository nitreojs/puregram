import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

interface TextButtonParams {
  text: string
  payload: Record<string, any> | string
}

interface UrlButtonParams {
  text: string
  url: string
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

interface SwitchToChosenChatButtonParams {
  text: string
  query?: string
  allowUserChats?: boolean
  allowBotChats?: boolean
  allowGroupChats?: boolean
  allowChannelChats?: boolean
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
@Inspectable()
export class InlineKeyboard {
  @Inspect({ as: 'inline_keyboard' })
  private buttons: Interfaces.TelegramInlineKeyboardButton[][] = []

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  constructor (rows: (Interfaces.TelegramInlineKeyboardButton | Interfaces.TelegramInlineKeyboardButton[])[] = []) {
    for (const row of rows) {
      this.addRow(row)
    }
  }

  /** Empty inline keyboard. That's literally it. */
  static empty = InlineKeyboard.keyboard([])

  /** Assemble a builder of buttons */
  static keyboard (
    rows: (Interfaces.TelegramInlineKeyboardButton | Interfaces.TelegramInlineKeyboardButton[])[]
  ): InlineKeyboard {
    return new InlineKeyboard(rows)
  }

  /** Generate text button */
  static textButton (params: TextButtonParams): Interfaces.TelegramInlineKeyboardButton {
    if (typeof params.payload === 'object') {
      params.payload = JSON.stringify(params.payload)
    }

    return {
      text: params.text,
      callback_data: params.payload
    }
  }

  /**
   * Generate text button
   *
   * An alias for `textButton`.
   */
  static text (params: TextButtonParams): Interfaces.TelegramInlineKeyboardButton {
    return InlineKeyboard.textButton(params)
  }

  /** Generate URL button */
  static urlButton (params: UrlButtonParams): Interfaces.TelegramInlineKeyboardButton {
    return {
      text: params.text,
      url: params.url
    }
  }

  /**
   * Generate URL button
   *
   * An alias for `urlButton`.
   */
  static url (params: UrlButtonParams): Interfaces.TelegramInlineKeyboardButton {
    return InlineKeyboard.urlButton(params)
  }

  /** Generate Web App button */
  static webAppButton (params: WebAppButtonParams): Interfaces.TelegramInlineKeyboardButton {
    return {
      text: params.text,
      web_app: { url: params.url }
    }
  }

  /**
   * Generate Web App button
   *
   * An alias for `webAppButton`.
   */
  static webApp (params: WebAppButtonParams): Interfaces.TelegramInlineKeyboardButton {
    return InlineKeyboard.webAppButton(params)
  }

  /** Generate button that will switch to current chat and type the query */
  static switchToCurrentChatButton (
    params: SwitchToCurrentChatButtonParams
  ): Interfaces.TelegramInlineKeyboardButton {
    return {
      text: params.text,
      switch_inline_query_current_chat: params.query
    }
  }

  /**
   * Generate button that will switch to current chat and type the query
   *
   * An alias for `switchToCurrentChatButton`.
   */
  static switchToCurrentChat (params: SwitchToCurrentChatButtonParams): Interfaces.TelegramInlineKeyboardButton {
    return InlineKeyboard.switchToCurrentChatButton(params)
  }

  /** Generate button that will prompt user to select one of their chats */
  static switchToChatButton (
    params: SwitchToChatButtonParams
  ): Interfaces.TelegramInlineKeyboardButton {
    return {
      text: params.text,
      switch_inline_query: params.query
    }
  }

  /**
   * Generate button that will prompt user to select one of their chats
   *
   * An alias for `switchToChatButton`.
   */
  static switchToChat (params: SwitchToChatButtonParams): Interfaces.TelegramInlineKeyboardButton {
    return InlineKeyboard.switchToChatButton(params)
  }

  /** Generate button that will prompt user to select one of their chats of the specified type, open that chat and insert the bot's username and the specified inline query in the input field */
  static switchToChosenChatButton (
    params: SwitchToChosenChatButtonParams
  ): Interfaces.TelegramInlineKeyboardButton {
    return {
      text: params.text,
      switch_inline_query_chosen_chat: {
        query: params.query,
        allow_bot_chats: params.allowBotChats,
        allow_channel_chats: params.allowChannelChats,
        allow_group_chats: params.allowGroupChats,
        allow_user_chats: params.allowUserChats
      }
    }
  }

  /**
   * Generate button that will prompt user to select one of their chats of the specified type, open that chat and insert the bot's username and the specified inline query in the input field
   *
   * An alias for `switchToChosenChatButton`.
   */
  static switchToChosenChat (params: SwitchToChosenChatButtonParams): Interfaces.TelegramInlineKeyboardButton {
    return InlineKeyboard.switchToChosenChatButton(params)
  }

  /** Generate game button */
  static gameButton (params: GameButtonParams): Interfaces.TelegramInlineKeyboardButton {
    return {
      text: params.text,
      callback_game: params.game
    }
  }

  /**
   * Generate game button
   *
   * An alias for `gameButton`.
   */
  static game (params: GameButtonParams): Interfaces.TelegramInlineKeyboardButton {
    return InlineKeyboard.gameButton(params)
  }

  /** Generate pay button */
  static payButton (params: PayButtonParams): Interfaces.TelegramInlineKeyboardButton {
    return {
      pay: true,
      text: params.text
    }
  }

  /**
   * Generate pay button
   *
   * An alias for `payButton`.
   */
  static pay (params: PayButtonParams): Interfaces.TelegramInlineKeyboardButton {
    return InlineKeyboard.payButton(params)
  }

  /** Generate login button */
  static loginButton (params: LoginButtonParams): Interfaces.TelegramInlineKeyboardButton {
    return {
      login_url: params.loginUrl,
      text: params.text
    }
  }

  /**
   * Generate login button
   *
   * An alias for `loginButton`.
   */
  static login (params: LoginButtonParams): Interfaces.TelegramInlineKeyboardButton {
    return InlineKeyboard.loginButton(params)
  }

  private addRow (row: Interfaces.TelegramInlineKeyboardButton[] | Interfaces.TelegramInlineKeyboardButton) {
    if (!Array.isArray(row)) row = [row]

    this.buttons.push(row)

    return this
  }

  /** Returns JSON which is compatible with Telegram's `InlineKeyboardMarkup` interface */
  toJSON (): Interfaces.TelegramInlineKeyboardMarkup {
    return {
      inline_keyboard: this.buttons
    }
  }

  toString () {
    return JSON.stringify(this)
  }
}
