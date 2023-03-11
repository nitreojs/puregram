import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

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

  /** Assemble a builder of buttons */
  static keyboard (rows: (Interfaces.TelegramKeyboardButton | Interfaces.TelegramKeyboardButton[])[]): Keyboard {
    const keyboard = new Keyboard()

    for (const row of rows) {
      keyboard.addRow(row)
    }

    return keyboard
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
  static textButton (text: string): Interfaces.TelegramKeyboardButton {
    return { text }
  }

  /** If specified, pressing the button will open a list of suitable users. Tapping on any user will send their identifier to the bot in a “user_shared” service message. Available in private chats only. */
  static requestUserButton (text: string, params: Interfaces.TelegramKeyboardButtonRequestUser): Interfaces.TelegramKeyboardButton {
    return {
      text,
      request_user: params
    }
  }

  /** If specified, pressing the button will open a list of suitable chats. Tapping on a chat will send its identifier to the bot in a “chat_shared” service message. Available in private chats only. */
  static requestChatButton (text: string, params: Interfaces.TelegramKeyboardButtonRequestChat): Interfaces.TelegramKeyboardButton {
    return {
      text,
      request_chat: params
    }
  }

  /**
   * The user's phone number will be sent as a contact when
   * the button is pressed.
   *
   * Available in private chats only
   */
  static requestContactButton (text: string): Interfaces.TelegramKeyboardButton {
    return {
      text,
      request_contact: true
    }
  }

  /**
   * The user's current location will be sent when the button is pressed.
   *
   * Available in private chats only
   */
  static requestLocationButton (text: string): Interfaces.TelegramKeyboardButton {
    return {
      text,
      request_location: true
    }
  }

  /**
   * The user will be asked to create a poll and send it to the bot
   * when the button is pressed.
   *
   * Available in private chats only
   */
  static requestPollButton (text: string, type?: Interfaces.TelegramPoll['type']): Interfaces.TelegramKeyboardButton {
    return {
      text,
      request_poll: { type }
    }
  }

  /**
   * The described Web App will be launched when the button is pressed.
   * The Web App will be able to send a `web_app_data` service message.
   *
   * Available in private chats only.
   */
  static webAppButton (text: string, url: string): Interfaces.TelegramKeyboardButton {
    return {
      text,
      web_app: { url }
    }
  }

  private addRow (row: Interfaces.TelegramKeyboardButton[] | Interfaces.TelegramKeyboardButton) {
    if (!Array.isArray(row)) row = [row]

    this.buttons.push(row)

    return this
  }

  /** Returns JSON which is compatible with Telegram's `ReplyKeyboardMarkup` interface */
  toJSON (): Interfaces.TelegramReplyKeyboardMarkup {
    return {
      keyboard: this.buttons,
      is_persistent: this.isPersistent,
      resize_keyboard: this.isResized,
      one_time_keyboard: this.isOneTime,
      input_field_placeholder: this.placeholder,
      selective: this.isSelective
    }
  }

  toString () {
    return JSON.stringify(this)
  }
}

inspectable(Keyboard, {
  serialize (keyboard) {
    return keyboard.toJSON()
  }
})
