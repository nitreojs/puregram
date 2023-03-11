import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

/** Keyboard builder */
export class KeyboardBuilder {
  private rows: Interfaces.TelegramKeyboardButton[][] = []
  private currentRow: Interfaces.TelegramKeyboardButton[] = []

  private isOneTime = false
  private isResized = false
  private isSelective = false
  private isPersistent = false
  private placeholder?: string

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /**
   * Generate text button.
   * If none of the optional fields are used,
   * it will be sent as a message when the button is pressed
   */
  textButton (text: string) {
    return this.addButton({ text })
  }

  /** If specified, pressing the button will open a list of suitable users. Tapping on any user will send their identifier to the bot in a “user_shared” service message. Available in private chats only. */
  requestUserButton (text: string, params: Interfaces.TelegramKeyboardButtonRequestUser) {
    return this.addWideButton({
      text,
      request_user: params
    })
  }

  /** If specified, pressing the button will open a list of suitable chats. Tapping on a chat will send its identifier to the bot in a “chat_shared” service message. Available in private chats only. */
  requestChatButton (text: string, params: Interfaces.TelegramKeyboardButtonRequestChat) {
    return this.addWideButton({
      text,
      request_chat: params
    })
  }

  /**
   * The user's current location will be sent when the button is pressed.
   *
   * Available in private chats only
   */
  requestLocationButton (text: string) {
    return this.addWideButton({
      text,
      request_location: true
    })
  }

  /**
   * The user will be asked to create a poll and send it to the bot
   * when the button is pressed.
   *
   * Available in private chats only
   */
  requestPollButton (text: string, type?: Interfaces.TelegramPoll['type']) {
    return this.addWideButton({
      text,
      request_poll: { type }
    })
  }

  /**
   * The user's phone number will be sent as a contact when
   * the button is pressed.
   *
   * Available in private chats only
   */
  requestContactButton (text: string) {
    return this.addWideButton({
      text,
      request_contact: true
    })
  }

  /**
   * The described Web App will be launched when the button is pressed.
   * The Web App will be able to send a `web_app_data` service message.
   *
   * Available in private chats only.
   */
  webAppButton (text: string, url: string) {
    return this.addWideButton({
      text,
      web_app: { url }
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

  /** Requests clients to hide the keyboard as soon as it's been used. The keyboard will still be available, but clients will automatically display the usual letter-keyboard in the chat - the user can press a special button in the input field to see the custom keyboard again. Defaults to `false` */
  oneTime (oneTime = true) {
    this.isOneTime = oneTime

    return this
  }

  /** Requests clients to resize the keyboard vertically for optimal fit (e.g., make the keyboard smaller if there are just two rows of buttons). Defaults to `false`, in which case the custom keyboard is always of the same height as the app's standard keyboard */
  resize (resize = true) {
    this.isResized = resize

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

  private addButton (button: Interfaces.TelegramKeyboardButton) {
    this.currentRow.push(button)

    return this
  }

  private addWideButton (button: Interfaces.TelegramKeyboardButton) {
    if (this.currentRow.length !== 0) this.row()

    this.addButton(button)

    return this.row()
  }

  /** Clone current builder to new instance */
  clone (): KeyboardBuilder {
    const builder = new KeyboardBuilder()

    builder.oneTime(this.isOneTime)
    builder.resize(this.isResized)
    builder.selective(this.isSelective)

    if (this.placeholder) {
      builder.setPlaceholder(this.placeholder)
    }

    builder.rows = [...this.rows]
    builder.currentRow = [...this.currentRow]

    return builder
  }

  /** Returns JSON which is compatible with Telegram's `ReplyKeyboardMarkup` interface */
  toJSON (): Interfaces.TelegramReplyKeyboardMarkup {
    const buttons = this.currentRow.length !== 0
      ? [...this.rows, this.currentRow]
      : this.rows

    return {
      keyboard: buttons,
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

inspectable(KeyboardBuilder, {
  serialize (builder) {
    return builder.toJSON()
  }
})
