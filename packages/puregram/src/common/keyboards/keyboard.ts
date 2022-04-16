import { inspectable } from 'inspectable'

import {
  TelegramKeyboardButton,
  TelegramPoll,
  TelegramReplyKeyboardMarkup
} from '../../telegram-interfaces'

/** Keyboard */
export class Keyboard {
  private buttons: TelegramKeyboardButton[][] = []

  private isResized: boolean = false
  private isOneTime: boolean = false
  private isSelective: boolean = false
  private placeholder?: string

  public get [Symbol.toStringTag](): string {
    return this.constructor.name
  }

  /** Assemble a builder of buttons */
  public static keyboard(rows: (TelegramKeyboardButton | TelegramKeyboardButton[])[]): Keyboard {
    const keyboard: Keyboard = new Keyboard()

    for (const row of rows) {
      keyboard.addRow(row)
    }

    return keyboard
  }

  /** Resize the keyboard */
  public resize(resize: boolean = true): this {
    this.isResized = resize

    return this
  }

  /** When pressed, the keyboard will disappear */
  public oneTime(oneTime: boolean = true): this {
    this.isOneTime = oneTime

    return this
  }

  /** Use this parameter if you want to show the keyboard to specific users only */
  public selective(selective: boolean = true): this {
    this.isSelective = selective

    return this
  }

  /** The placeholder to be shown in the input field when the keyboard is active */
  public setPlaceholder(placeholder: string): this {
    this.placeholder = placeholder

    return this
  }

  /**
   * Generates text button.
   * If none of the optional fields are used,
   * it will be sent as a message when the button is pressed
   */
  public static textButton(text: string): TelegramKeyboardButton {
    return { text }
  }

  /**
   * The user's phone number will be sent as a contact when
   * the button is pressed.
   *
   * Available in private chats only
   */
  public static requestContactButton(text: string): TelegramKeyboardButton {
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
  public static requestLocationButton(text: string): TelegramKeyboardButton {
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
  public static requestPollButton(text: string, type?: TelegramPoll['type']): TelegramKeyboardButton {
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
  public static webAppButton(text: string, url: string): TelegramKeyboardButton {
    return {
      text,
      web_app: { url }
    }
  }

  private addRow(row: TelegramKeyboardButton[] | TelegramKeyboardButton): this {
    if (!Array.isArray(row)) row = [row]

    this.buttons.push(row)

    return this
  }

  public toJSON(): TelegramReplyKeyboardMarkup {
    return {
      keyboard: this.buttons,
      resize_keyboard: this.isResized,
      one_time_keyboard: this.isOneTime,
      input_field_placeholder: this.placeholder,
      selective: this.isSelective
    }
  }

  public toString(): string {
    return JSON.stringify(this)
  }
}

inspectable(Keyboard, {
  serialize(keyboard: Keyboard) {
    return keyboard.toJSON()
  }
})
