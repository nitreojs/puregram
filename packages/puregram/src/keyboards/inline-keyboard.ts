import type * as Interfaces from '@puregram/api'

import type { ButtonStyleParams, PuregramInlineKeyboardButton } from './types'

interface TextButtonParams {
  text: string
  payload: Record<string, unknown> | string
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

interface CopyButtonParams {
  text: string
  copy: string
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
type CopyButtonParamsWithStyle = CopyButtonParams & ButtonStyleParams
type GameButtonParamsWithStyle = GameButtonParams & ButtonStyleParams
type PayButtonParamsWithStyle = PayButtonParams & ButtonStyleParams
type LoginButtonParamsWithStyle = LoginButtonParams & ButtonStyleParams

/** Inline keyboard */
export class InlineKeyboard {
  /** Empty inline keyboard. That's literally it. */
  static empty = new InlineKeyboard()

  private buttons: PuregramInlineKeyboardButton[][] = []

  constructor (rows: (PuregramInlineKeyboardButton | PuregramInlineKeyboardButton[])[] = []) {
    for (const row of rows) {
      this.addRow(row)
    }
  }

  /** Assemble a builder of buttons */
  static keyboard (
    rows: (PuregramInlineKeyboardButton | PuregramInlineKeyboardButton[])[]
  ) {
    return new InlineKeyboard(rows)
  }

  /** Generate text button */
  static textButton (params: TextButtonParamsWithStyle) {
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

    return button
  }

  /** An alias for `textButton`. */
  static text (params: TextButtonParamsWithStyle) {
    return InlineKeyboard.textButton(params)
  }

  /** Generate URL button */
  static urlButton (params: UrlButtonParamsWithStyle) {
    const button: PuregramInlineKeyboardButton = {
      text: params.text,
      url: params.url
    }

    if (params.style) {
      button.style = params.style
    }

    if (params.iconCustomEmojiId) {
      button.icon_custom_emoji_id = params.iconCustomEmojiId
    }

    return button
  }

  /** An alias for `urlButton`. */
  static url (params: UrlButtonParamsWithStyle) {
    return InlineKeyboard.urlButton(params)
  }

  /** Generate Web App button */
  static webAppButton (params: WebAppButtonParamsWithStyle) {
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

    return button
  }

  /** An alias for `webAppButton`. */
  static webApp (params: WebAppButtonParamsWithStyle) {
    return InlineKeyboard.webAppButton(params)
  }

  /** Generate button that will switch to current chat and type the query */
  static switchToCurrentChatButton (
    params: SwitchToCurrentChatButtonParamsWithStyle
  ) {
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

    return button
  }

  /** An alias for `switchToCurrentChatButton`. */
  static switchToCurrentChat (params: SwitchToCurrentChatButtonParamsWithStyle) {
    return InlineKeyboard.switchToCurrentChatButton(params)
  }

  /** Generate button that will prompt user to select one of their chats */
  static switchToChatButton (
    params: SwitchToChatButtonParamsWithStyle
  ) {
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

    return button
  }

  /** An alias for `switchToChatButton`. */
  static switchToChat (params: SwitchToChatButtonParamsWithStyle) {
    return InlineKeyboard.switchToChatButton(params)
  }

  /**
   * Generate button that will prompt user to select one of their chats of the
   * specified type, open that chat and insert the bot's username and the
   * specified inline query in the input field.
   */
  static switchToChosenChatButton (
    params: SwitchToChosenChatButtonParamsWithStyle
  ) {
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

    return button
  }

  /** An alias for `switchToChosenChatButton`. */
  static switchToChosenChat (params: SwitchToChosenChatButtonParamsWithStyle) {
    return InlineKeyboard.switchToChosenChatButton(params)
  }

  /** Description of the button that copies the specified text to the clipboard. */
  static copyButton (params: CopyButtonParamsWithStyle) {
    const button: PuregramInlineKeyboardButton = {
      text: params.text,
      copy_text: {
        text: params.copy
      }
    }

    if (params.style) {
      button.style = params.style
    }

    if (params.iconCustomEmojiId) {
      button.icon_custom_emoji_id = params.iconCustomEmojiId
    }

    return button
  }

  /** An alias for `copyButton`. */
  static copy (params: CopyButtonParamsWithStyle) {
    return InlineKeyboard.copyButton(params)
  }

  /** Generate game button */
  static gameButton (params: GameButtonParamsWithStyle) {
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

    return button
  }

  /** An alias for `gameButton`. */
  static game (params: GameButtonParamsWithStyle) {
    return InlineKeyboard.gameButton(params)
  }

  /** Generate pay button */
  static payButton (params: PayButtonParamsWithStyle) {
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

    return button
  }

  /** An alias for `payButton`. */
  static pay (params: PayButtonParamsWithStyle) {
    return InlineKeyboard.payButton(params)
  }

  /** Generate login button */
  static loginButton (params: LoginButtonParamsWithStyle) {
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

    return button
  }

  /** An alias for `loginButton`. */
  static login (params: LoginButtonParamsWithStyle) {
    return InlineKeyboard.loginButton(params)
  }

  /** Returns JSON which is compatible with Telegram's `InlineKeyboardMarkup` interface */
  toJSON () {
    return {
      inline_keyboard: this.buttons
    }
  }

  /** Clones the keyboard (creates a new one with the same set of buttons) */
  clone () {
    return InlineKeyboard.keyboard(this.buttons)
  }

  /** Deletes a button with the specified payload */
  delete (payload: string) {
    const rowIndex = this.buttons.findIndex(row => row.findIndex(button => button.callback_data === payload) !== -1)

    if (rowIndex === -1) {
      return this
    }

    const row = this.buttons[rowIndex]

    if (!row) {
      return this
    }

    const buttonIndex = row.findIndex(button => button.callback_data === payload)

    row.splice(buttonIndex, 1)

    if (row.length === 0) {
      this.buttons.splice(rowIndex, 1)
    }

    return this
  }

  toString () {
    return JSON.stringify(this)
  }

  private addRow (row: PuregramInlineKeyboardButton[] | PuregramInlineKeyboardButton) {
    if (!Array.isArray(row)) {
      row = [row]
    }

    this.buttons.push(row)

    return this
  }
}
