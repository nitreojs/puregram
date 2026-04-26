import type * as Interfaces from '@puregram/api/types'

import type { MaybeArray, ButtonStyleParams } from './types'

import { RemoveKeyboard } from './remove'

/** Keyboard */
export class Keyboard {
  private buttons: Interfaces.TelegramKeyboardButton[][] = []
  private isResized = false
  private isOneTime = false
  private isSelective = false
  private isPersistent = false
  private placeholder?: string

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  constructor (rows: MaybeArray<Interfaces.TelegramKeyboardButton | string>[] = []) {
    for (const row of rows) {
      this.addRow(row)
    }
  }

  /** Returns an "empty" keyboard (literally a `RemoveKeyboard` alias) */
  static empty = new RemoveKeyboard()

  /** "Removes" a keyboard (literally a `RemoveKeyboard` alias) */
  static remove () {
    return Keyboard.empty
  }

  /** Assemble a builder of buttons */
  static keyboard (rows: MaybeArray<Interfaces.TelegramKeyboardButton | string>[]) {
    return new Keyboard(rows)
  }

  /** Requests clients to resize the keyboard vertically for optimal fit (e.g., make the keyboard smaller if there are just two rows of buttons). Defaults to `false`, in which case the custom keyboard is always of the same height as the app's standard keyboard */
  resize (resize = true) {
    this.isResized = resize

    return this
  }

  /** Requests clients to hide the keyboard as soon as it's been used. The keyboard will still be available, but clients will automatically display the usual letter-keyboard in the chat - the user can press a special button in the input field to see the custom keyboard again. Defaults to `false` */
  oneTime (oneTime = true) {
    this.isOneTime = oneTime

    return this
  }

  /** Use this parameter if you want to show the keyboard to specific users only */
  selective (selective = true) {
    this.isSelective = selective

    return this
  }

  /** Requests clients to always show the keyboard when the regular keyboard is hidden. Defaults to `false`, in which case the custom keyboard can be hidden and opened with a keyboard icon */
  persistent (persistent = true) {
    this.isPersistent = persistent

    return this
  }

  /** The placeholder to be shown in the input field when the keyboard is active */
  setPlaceholder (placeholder: string) {
    this.placeholder = placeholder

    return this
  }

  /**
   * Generates text button.
   * If none of the optional fields are used,
   * it will be sent as a message when the button is pressed
   */
  static textButton (text: string, params?: ButtonStyleParams): Interfaces.TelegramKeyboardButton {
    const button: Interfaces.TelegramKeyboardButton = { text }

    if (params?.style) button.style = params.style
    if (params?.iconCustomEmojiId) button.icon_custom_emoji_id = params.iconCustomEmojiId

    return button
  }

  /**
   * Generates text button.
   * If none of the optional fields are used,
   * it will be sent as a message when the button is pressed
   *
   * An alias for `textButton`.
   */
  static text (text: string, params?: ButtonStyleParams): Interfaces.TelegramKeyboardButton {
    return Keyboard.textButton(text, params)
  }

  /** If specified, pressing the button will open a list of suitable users. Tapping on any user will send their identifier to the bot in a "user_shared" service message. Available in private chats only. */
  static requestUsersButton (text: string, params: Interfaces.TelegramKeyboardButtonRequestUsers & ButtonStyleParams): Interfaces.TelegramKeyboardButton {
    const button: Interfaces.TelegramKeyboardButton = {
      text,
      request_users: params
    }

    if (params.style) button.style = params.style
    if (params.iconCustomEmojiId) button.icon_custom_emoji_id = params.iconCustomEmojiId

    return button
  }

  /**
   * If specified, pressing the button will open a list of suitable users. Tapping on any user will send their identifier to the bot in a "user_shared" service message. Available in private chats only.
   *
   * An alias for `requestUsersButton`.
   */
  static requestUsers (text: string, params: Interfaces.TelegramKeyboardButtonRequestUsers & ButtonStyleParams): Interfaces.TelegramKeyboardButton {
    return Keyboard.requestUsersButton(text, params)
  }

  /** If specified, pressing the button will open a list of suitable chats. Tapping on a chat will send its identifier to the bot in a "chat_shared" service message. Available in private chats only. */
  static requestChatButton (text: string, params: Interfaces.TelegramKeyboardButtonRequestChat & ButtonStyleParams): Interfaces.TelegramKeyboardButton {
    const button: Interfaces.TelegramKeyboardButton = {
      text,
      request_chat: params
    }

    if (params.style) button.style = params.style
    if (params.iconCustomEmojiId) button.icon_custom_emoji_id = params.iconCustomEmojiId

    return button
  }

  /**
   * If specified, pressing the button will open a list of suitable chats. Tapping on a chat will send its identifier to the bot in a "chat_shared" service message. Available in private chats only.
   *
   * An alias for `requestChatButton`.
   */
  static requestChat (text: string, params: Interfaces.TelegramKeyboardButtonRequestChat & ButtonStyleParams): Interfaces.TelegramKeyboardButton {
    return Keyboard.requestChatButton(text, params)
  }

  /**
   * The user's phone number will be sent as a contact when
   * the button is pressed.
   *
   * Available in private chats only
   */
  static requestContactButton (text: string, params?: ButtonStyleParams): Interfaces.TelegramKeyboardButton {
    const button: Interfaces.TelegramKeyboardButton = {
      text,
      request_contact: true
    }

    if (params?.style) button.style = params.style
    if (params?.iconCustomEmojiId) button.icon_custom_emoji_id = params.iconCustomEmojiId

    return button
  }

  /**
   * The user's phone number will be sent as a contact when
   * the button is pressed.
   *
   * Available in private chats only
   *
   * An alias for `requestContactButton`.
   */
  static requestContact (text: string, params?: ButtonStyleParams): Interfaces.TelegramKeyboardButton {
    return Keyboard.requestContactButton(text, params)
  }

  /**
   * The user's current location will be sent when the button is pressed.
   *
   * Available in private chats only
   */
  static requestLocationButton (text: string, params?: ButtonStyleParams): Interfaces.TelegramKeyboardButton {
    const button: Interfaces.TelegramKeyboardButton = {
      text,
      request_location: true
    }

    if (params?.style) button.style = params.style
    if (params?.iconCustomEmojiId) button.icon_custom_emoji_id = params.iconCustomEmojiId

    return button
  }

  /**
   * The user's current location will be sent when the button is pressed.
   *
   * Available in private chats only
   *
   * An alias for `requestLocationButton`.
   */
  static requestLocation (text: string, params?: ButtonStyleParams): Interfaces.TelegramKeyboardButton {
    return Keyboard.requestLocationButton(text, params)
  }

  /**
   * The user will be asked to create a poll and send it to the bot
   * when the button is pressed.
   *
   * Available in private chats only
   */
  static requestPollButton (text: string, params?: (Interfaces.TelegramPoll['type'] | { type?: Interfaces.TelegramPoll['type'] } & ButtonStyleParams)): Interfaces.TelegramKeyboardButton {
    let type: Interfaces.TelegramPoll['type'] | undefined
    let styleParams: ButtonStyleParams | undefined

    if (typeof params === 'string') {
      type = params
    } else if (params) {
      type = params.type
      styleParams = params
    }

    const button: Interfaces.TelegramKeyboardButton = {
      text,
      request_poll: type === undefined ? {} : { type }
    }

    if (styleParams?.style) button.style = styleParams.style
    if (styleParams?.iconCustomEmojiId) button.icon_custom_emoji_id = styleParams.iconCustomEmojiId

    return button
  }

  /**
   * The user will be asked to create a poll and send it to the bot
   * when the button is pressed.
   *
   * Available in private chats only
   *
   * An alias for `requestPollButton`.
   */
  static requestPoll (text: string, params?: (Interfaces.TelegramPoll['type'] | { type?: Interfaces.TelegramPoll['type'] } & ButtonStyleParams)): Interfaces.TelegramKeyboardButton {
    return Keyboard.requestPollButton(text, params)
  }

  /**
   * The described Web App will be launched when the button is pressed.
   * The Web App will be able to send a `web_app_data` service message.
   *
   * Available in private chats only.
   */
  static webAppButton (text: string, url: string, params?: ButtonStyleParams): Interfaces.TelegramKeyboardButton {
    const button: Interfaces.TelegramKeyboardButton = {
      text,
      web_app: { url }
    }

    if (params?.style) button.style = params.style
    if (params?.iconCustomEmojiId) button.icon_custom_emoji_id = params.iconCustomEmojiId

    return button
  }

  /**
   * The described Web App will be launched when the button is pressed.
   * The Web App will be able to send a `web_app_data` service message.
   *
   * Available in private chats only.
   *
   * An alias for `webAppButton`.
   */
  static webApp (text: string, url: string, params?: ButtonStyleParams): Interfaces.TelegramKeyboardButton {
    return Keyboard.webAppButton(text, url, params)
  }

  private addRow (row: MaybeArray<Interfaces.TelegramKeyboardButton | string>) {
    if (!Array.isArray(row)) row = [row]

    this.buttons.push(row.map(e => typeof e === 'string' ? Keyboard.textButton(e) : e))

    return this
  }

  /** Returns JSON which is compatible with Telegram's `ReplyKeyboardMarkup` interface */
  toJSON (): Interfaces.TelegramReplyKeyboardMarkup {
    const json: Interfaces.TelegramReplyKeyboardMarkup = {
      keyboard: this.buttons,
      is_persistent: this.isPersistent,
      resize_keyboard: this.isResized,
      one_time_keyboard: this.isOneTime,
      selective: this.isSelective
    }
    if (this.placeholder !== undefined) json.input_field_placeholder = this.placeholder
    return json
  }

  /** Deletes a button with the specified payload */
  delete (text: string) {
    const rowIndex = this.buttons.findIndex(row => row.findIndex(button => button.text === text) !== -1)
    if (rowIndex === -1) return this

    const row = this.buttons[rowIndex]!
    const buttonIndex = row.findIndex(button => button.text === text)

    row.splice(buttonIndex, 1)

    if (row.length === 0) {
      this.buttons.splice(rowIndex, 1)
    }

    return this
  }

  /** Clones the keyboard (creates a new one with the same set of buttons) */
  clone () {
    return Keyboard.keyboard(this.buttons)
  }

  toString () {
    return JSON.stringify(this)
  }
}
