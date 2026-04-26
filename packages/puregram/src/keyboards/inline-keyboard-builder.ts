import type * as Interfaces from '@puregram/api'

import type { ButtonStyleParams, PuregramInlineKeyboardButton } from './types'

interface TextButtonParams {
  text: string
  payload: Record<string, unknown> | string
}

interface UrlButtonParams {
  text: string
  url: string

  payload?: Record<string, unknown> | string
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

type TextButtonParamsWithStyle = TextButtonParams & ButtonStyleParams
type UrlButtonParamsWithStyle = UrlButtonParams & ButtonStyleParams
type WebAppButtonParamsWithStyle = WebAppButtonParams & ButtonStyleParams
type SwitchToCurrentChatButtonParamsWithStyle = SwitchToCurrentChatButtonParams & ButtonStyleParams
type SwitchToChatButtonParamsWithStyle = SwitchToChatButtonParams & ButtonStyleParams
type SwitchToChosenChatButtonParamsWithStyle = SwitchToChosenChatButtonParams & ButtonStyleParams
type GameButtonParamsWithStyle = GameButtonParams & ButtonStyleParams
type PayButtonParamsWithStyle = PayButtonParams & ButtonStyleParams
type LoginButtonParamsWithStyle = LoginButtonParams & ButtonStyleParams

export class InlineKeyboardBuilder {
  private rows: PuregramInlineKeyboardButton[][] = []
  private currentRow: PuregramInlineKeyboardButton[] = []

  /** Generate text button */
  textButton (params: TextButtonParamsWithStyle) {
    if (typeof params.payload === 'object') {
      params.payload = JSON.stringify(params.payload)
    }

    const button: PuregramInlineKeyboardButton = {
      text: params.text,
      callback_data: params.payload
    }

    if (params.style) {
      button.style = params.style
    }

    if (params.iconCustomEmojiId) {
      button.icon_custom_emoji_id = params.iconCustomEmojiId
    }

    return this.addButton(button)
  }

  /** Generate URL button */
  urlButton (params: UrlButtonParamsWithStyle) {
    if (typeof params.payload === 'object') {
      params.payload = JSON.stringify(params.payload)
    }

    const button: PuregramInlineKeyboardButton = {
      text: params.text,
      url: params.url,
      callback_data: params.payload ?? ''
    }

    if (params.style) {
      button.style = params.style
    }

    if (params.iconCustomEmojiId) {
      button.icon_custom_emoji_id = params.iconCustomEmojiId
    }

    return this.addButton(button)
  }

  /** Generate Web App button */
  webAppButton (params: WebAppButtonParamsWithStyle) {
    const button: PuregramInlineKeyboardButton = {
      text: params.text,
      web_app: { url: params.url }
    }

    if (params.style) {
      button.style = params.style
    }

    if (params.iconCustomEmojiId) {
      button.icon_custom_emoji_id = params.iconCustomEmojiId
    }

    return this.addButton(button)
  }

  /** Generate button that will switch to current chat and type the query */
  switchToCurrentChatButton (params: SwitchToCurrentChatButtonParamsWithStyle) {
    const button: PuregramInlineKeyboardButton = {
      text: params.text,
      switch_inline_query_current_chat: params.query
    }

    if (params.style) {
      button.style = params.style
    }

    if (params.iconCustomEmojiId) {
      button.icon_custom_emoji_id = params.iconCustomEmojiId
    }

    return this.addButton(button)
  }

  /** Generate button that will prompt user to select one of their chats */
  switchToChatButton (params: SwitchToChatButtonParamsWithStyle) {
    const button: PuregramInlineKeyboardButton = {
      text: params.text,
      switch_inline_query: params.query
    }

    if (params.style) {
      button.style = params.style
    }

    if (params.iconCustomEmojiId) {
      button.icon_custom_emoji_id = params.iconCustomEmojiId
    }

    return this.addButton(button)
  }

  /**
   * Generate button that will prompt user to select one of their chats of the
   * specified type, open that chat and insert the bot's username and the
   * specified inline query in the input field.
   */
  switchToChosenChatButton (params: SwitchToChosenChatButtonParamsWithStyle) {
    const chosenChat: Interfaces.TelegramSwitchInlineQueryChosenChat = {}

    if (params.query !== undefined) {
      chosenChat.query = params.query
    }

    if (params.allowBotChats !== undefined) {
      chosenChat.allow_bot_chats = params.allowBotChats
    }

    if (params.allowChannelChats !== undefined) {
      chosenChat.allow_channel_chats = params.allowChannelChats
    }

    if (params.allowGroupChats !== undefined) {
      chosenChat.allow_group_chats = params.allowGroupChats
    }

    if (params.allowUserChats !== undefined) {
      chosenChat.allow_user_chats = params.allowUserChats
    }

    const button: PuregramInlineKeyboardButton = {
      text: params.text,
      switch_inline_query_chosen_chat: chosenChat
    }

    if (params.style) {
      button.style = params.style
    }

    if (params.iconCustomEmojiId) {
      button.icon_custom_emoji_id = params.iconCustomEmojiId
    }

    return this.addButton(button)
  }

  /** Generate game button */
  gameButton (params: GameButtonParamsWithStyle) {
    const button: PuregramInlineKeyboardButton = {
      text: params.text,
      callback_game: params.game
    }

    if (params.style) {
      button.style = params.style
    }

    if (params.iconCustomEmojiId) {
      button.icon_custom_emoji_id = params.iconCustomEmojiId
    }

    return this.addWideButton(button)
  }

  /** Generate pay button */
  payButton (params: PayButtonParamsWithStyle) {
    const button: PuregramInlineKeyboardButton = {
      pay: true,
      text: params.text
    }

    if (params.style) {
      button.style = params.style
    }

    if (params.iconCustomEmojiId) {
      button.icon_custom_emoji_id = params.iconCustomEmojiId
    }

    return this.addWideButton(button)
  }

  /** Generate login button */
  loginButton (params: LoginButtonParamsWithStyle) {
    const button: PuregramInlineKeyboardButton = {
      login_url: params.loginUrl,
      text: params.text
    }

    if (params.style) {
      button.style = params.style
    }

    if (params.iconCustomEmojiId) {
      button.icon_custom_emoji_id = params.iconCustomEmojiId
    }

    return this.addButton(button)
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

  /** Clone current builder to new instance */
  clone () {
    const builder = new InlineKeyboardBuilder()

    builder.rows = [...this.rows]
    builder.currentRow = [...this.currentRow]

    return builder
  }

  /** Returns JSON which is compatible with Telegram's `InlineKeyboardMarkup` interface */
  toJSON () {
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

  private addButton (button: PuregramInlineKeyboardButton) {
    this.currentRow.push(button)

    return this
  }

  private addWideButton (button: PuregramInlineKeyboardButton) {
    if (this.currentRow.length !== 0) {
      this.row()
    }

    this.addButton(button)

    return this.row()
  }
}
