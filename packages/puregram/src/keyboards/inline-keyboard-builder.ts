import type * as Interfaces from '@puregram/api'

import type { ButtonStyleParams, CallbackData } from './types'
import { normalizeCallbackData } from './types'

interface TextButtonParams {
  text: string
  payload: CallbackData
}

interface UrlButtonParams {
  text: string
  url: string

  payload?: CallbackData
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
  private rows: Interfaces.TelegramInlineKeyboardButton[][] = []
  private currentRow: Interfaces.TelegramInlineKeyboardButton[] = []

  /** whether the builder has no buttons (committed rows + current row) */
  get isEmpty () {
    return this.rows.length === 0 && this.currentRow.length === 0
  }

  /** number of rows that will be emitted (committed rows + current row if non-empty) */
  get rowCount () {
    return this.rows.length + (this.currentRow.length === 0 ? 0 : 1)
  }

  /** total number of buttons across all rows including the in-progress row */
  get length () {
    let count = this.currentRow.length

    for (const row of this.rows) {
      count += row.length
    }

    return count
  }

  /** construct an `InlineKeyboardBuilder` from an existing `InlineKeyboardMarkup` JSON */
  static from (markup: Interfaces.TelegramInlineKeyboardMarkup) {
    const builder = new InlineKeyboardBuilder()

    builder.rows = structuredClone(markup.inline_keyboard)

    return builder
  }

  /** generate text button */
  textButton (params: TextButtonParamsWithStyle) {
    const button: Interfaces.TelegramInlineKeyboardButton = {
      text: params.text,
      callback_data: normalizeCallbackData(params.payload)
    }

    if (params.style) {
      button.style = params.style
    }

    if (params.iconCustomEmojiId) {
      button.icon_custom_emoji_id = params.iconCustomEmojiId
    }

    return this.addButton(button)
  }

  /** generate URL button */
  urlButton (params: UrlButtonParamsWithStyle) {
    const button: Interfaces.TelegramInlineKeyboardButton = {
      text: params.text,
      url: params.url
    }

    if (params.payload !== undefined) {
      button.callback_data = normalizeCallbackData(params.payload)
    }

    if (params.style) {
      button.style = params.style
    }

    if (params.iconCustomEmojiId) {
      button.icon_custom_emoji_id = params.iconCustomEmojiId
    }

    return this.addButton(button)
  }

  /** generate Web App button */
  webAppButton (params: WebAppButtonParamsWithStyle) {
    const button: Interfaces.TelegramInlineKeyboardButton = {
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

  /** generate button that will switch to current chat and type the query */
  switchToCurrentChatButton (params: SwitchToCurrentChatButtonParamsWithStyle) {
    const button: Interfaces.TelegramInlineKeyboardButton = {
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

  /** generate button that will prompt user to select one of their chats */
  switchToChatButton (params: SwitchToChatButtonParamsWithStyle) {
    const button: Interfaces.TelegramInlineKeyboardButton = {
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
   * generate button that will prompt user to select one of their chats of the
   * specified type, open that chat and insert the bot's username and the
   * specified inline query in the input field
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

    const button: Interfaces.TelegramInlineKeyboardButton = {
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

  /** generate game button */
  gameButton (params: GameButtonParamsWithStyle) {
    const button: Interfaces.TelegramInlineKeyboardButton = {
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

  /** generate pay button */
  payButton (params: PayButtonParamsWithStyle) {
    const button: Interfaces.TelegramInlineKeyboardButton = {
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

  /** generate login button */
  loginButton (params: LoginButtonParamsWithStyle) {
    const button: Interfaces.TelegramInlineKeyboardButton = {
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

  /** save current row of buttons in the general rows */
  row () {
    if (this.currentRow.length === 0) {
      return this
    }

    this.rows.push(this.currentRow)
    this.currentRow = []

    return this
  }

  /** conditionally apply a chain of mutations to the builder */
  if (condition: boolean, then: (builder: this) => void, otherwise?: (builder: this) => void) {
    if (condition) {
      then(this)
    } else if (otherwise) {
      otherwise(this)
    }

    return this
  }

  /** clone current builder to new instance */
  clone () {
    const builder = new InlineKeyboardBuilder()

    builder.rows = structuredClone(this.rows)
    builder.currentRow = structuredClone(this.currentRow)

    return builder
  }

  /** returns JSON which is compatible with Telegram's `InlineKeyboardMarkup` interface */
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
}
