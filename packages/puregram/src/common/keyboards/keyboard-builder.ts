import { inspectable } from 'inspectable'

import {
  TelegramKeyboardButton,
  TelegramPoll,
  TelegramReplyKeyboardMarkup
} from '../../telegram-interfaces'

/** Keyboard builder */
export class KeyboardBuilder {
  private rows: TelegramKeyboardButton[][] = []
  private currentRow: TelegramKeyboardButton[] = []

  private isOneTime: boolean = false
  private isResized: boolean = false
  private isSelective: boolean = false
  private placeholder?: string

  public get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /**
   * Generate text button.
   * If none of the optional fields are used,
   * it will be sent as a message when the button is pressed
   */
  public textButton(text: string): this {
    return this.addButton({ text })
  }

  /**
   * The user's current location will be sent when the button is pressed.
   *
   * Available in private chats only
   */
  public requestLocationButton(text: string): this {
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
  public requestPollButton(text: string, type?: TelegramPoll['type']): this {
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
  public requestContactButton(text: string): this {
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
  public webAppButton(text: string, url: string): this {
    return this.addWideButton({
      text,
      web_app: { url }
    })
  }

  /** Save current row of buttons in the general rows */
  public row(): this {
    if (this.currentRow.length === 0) {
      return this
    }

    this.rows.push(this.currentRow)
    this.currentRow = []

    return this
  }

  /** When pressed, the keyboard will disappear */
  public oneTime(oneTime: boolean = true): this {
    this.isOneTime = oneTime

    return this
  }

  /** Resize the keyboard */
  public resize(resize: boolean = true): this {
    this.isResized = resize

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

  private addButton(button: TelegramKeyboardButton): this {
    this.currentRow.push(button)

    return this
  }

  private addWideButton(button: TelegramKeyboardButton): this {
    if (this.currentRow.length !== 0) this.row()

    this.addButton(button)

    return this.row()
  }

  /** Clone current builder to new instance */
  public clone(): KeyboardBuilder {
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

  public toJSON(): TelegramReplyKeyboardMarkup {
    const buttons = this.currentRow.length !== 0
      ? [...this.rows, this.currentRow]
      : this.rows

    return {
      keyboard: buttons,
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

inspectable(KeyboardBuilder, {
  serialize(builder: KeyboardBuilder) {
    return builder.toJSON()
  }
})
