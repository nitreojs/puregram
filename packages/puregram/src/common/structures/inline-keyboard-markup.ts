import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { InlineKeyboardButton } from './inline-keyboard-button'

export class InlineKeyboardMarkup {
  constructor(private payload: Interfaces.TelegramInlineKeyboardMarkup) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /** Array of button rows */
  get inlineKeyboard() {
    const { inline_keyboard } = this.payload

    return inline_keyboard.map(
      (row: Interfaces.TelegramInlineKeyboardButton[]) => row.map(
        (element: Interfaces.TelegramInlineKeyboardButton) => new InlineKeyboardButton(element)
      )
    )
  }
}

inspectable(InlineKeyboardMarkup, {
  serialize(markup) {
    return {
      inlineKeyboard: markup.inlineKeyboard
    }
  }
})
