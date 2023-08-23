import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

interface TextButtonParams {
  text: string
  payload: Record<string, any> | string
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

@Inspectable()
export class InlineKeyboardBuilder {
  // TODO: rows + currentRow
  @Inspect({ as: 'inline_keyboard' })
  private rows: Interfaces.TelegramInlineKeyboardButton[][] = []

  private currentRow: Interfaces.TelegramInlineKeyboardButton[] = []

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Generate text button */
  textButton (params: TextButtonParams) {
    if (typeof params.payload === 'object') {
      params.payload = JSON.stringify(params.payload)
    }

    return this.addButton({
      text: params.text,
      callback_data: params.payload
    })
  }

  /** Generate URL button */
  urlButton (params: UrlButtonParams) {
    if (typeof params.payload === 'object') {
      params.payload = JSON.stringify(params.payload)
    }

    return this.addButton({
      text: params.text,
      url: params.url,
      callback_data: params.payload || ''
    })
  }

  /** Generate Web App button */
  webAppButton (params: WebAppButtonParams) {
    return this.addButton({
      text: params.text,
      web_app: { url: params.url }
    })
  }

  /** Generate button that will switch to current chat and type the query */
  switchToCurrentChatButton (params: SwitchToCurrentChatButtonParams) {
    return this.addButton({
      text: params.text,
      switch_inline_query_current_chat: params.query
    })
  }

  /** Generate button that will prompt user to select one of their chats */
  switchToChatButton (params: SwitchToChatButtonParams) {
    return this.addButton({
      text: params.text,
      switch_inline_query: params.query
    })
  }

  /** Generate button that will prompt user to select one of their chats of the specified type, open that chat and insert the bot's username and the specified inline query in the input field */
  switchToChosenChatButton (params: SwitchToChosenChatButtonParams) {
    return this.addButton({
      text: params.text,
      switch_inline_query_chosen_chat: {
        query: params.query,
        allow_bot_chats: params.allowBotChats,
        allow_channel_chats: params.allowChannelChats,
        allow_group_chats: params.allowGroupChats,
        allow_user_chats: params.allowUserChats
      }
    })
  }

  /** Generate game button */
  gameButton (params: GameButtonParams) {
    return this.addWideButton({
      text: params.text,
      callback_game: params.game
    })
  }

  /** Generate pay button */
  payButton (params: PayButtonParams) {
    return this.addWideButton({
      pay: true,
      text: params.text
    })
  }

  /** Generate login button */
  loginButton (params: LoginButtonParams) {
    return this.addButton({
      login_url: params.loginUrl,
      text: params.text
    })
  }

  /** Save current row of buttons in the general rows */
  row () {
    if (this.currentRow.length === 0) {
      return this
    }

    this.rows.push(this.currentRow)
    this.currentRow = []

    return this
  }

  private addButton (button: Interfaces.TelegramInlineKeyboardButton) {
    this.currentRow.push(button)

    return this
  }

  private addWideButton (button: Interfaces.TelegramInlineKeyboardButton) {
    if (this.currentRow.length !== 0) {
      this.row()
    }

    this.addButton(button)

    return this.row()
  }

  /** Clone current builder to new instance */
  clone (): InlineKeyboardBuilder {
    const builder = new InlineKeyboardBuilder()

    builder.rows = [...this.rows]
    builder.currentRow = [...this.currentRow]

    return builder
  }

  /** Returns JSON which is compatible with Telegram's `InlineKeyboardMarkup` interface */
  toJSON (): Interfaces.TelegramInlineKeyboardMarkup {
    const buttons = this.currentRow.length !== 0
      ? [...this.rows, this.currentRow]
      : this.rows

    return {
      inline_keyboard: buttons
    }
  }

  toString () {
    return JSON.stringify(this)
  }
}
