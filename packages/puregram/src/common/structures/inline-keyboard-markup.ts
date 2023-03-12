import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

import { InlineKeyboardButton } from './inline-keyboard-button'

export class InlineKeyboardMarkup implements Structure {
  constructor (public payload: Interfaces.TelegramInlineKeyboardMarkup) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Array of button rows */
  get inlineKeyboard () {
    const { inline_keyboard } = this.payload

    return inline_keyboard.map(row => row.map(element => new InlineKeyboardButton(element)))
  }

  toJSON (): Interfaces.TelegramInlineKeyboardMarkup {
    return {
      inline_keyboard: this.inlineKeyboard
    }
  }
}

inspectable(InlineKeyboardMarkup, {
  serialize (struct) {
    return {
      inlineKeyboard: struct.inlineKeyboard
    }
  }
})
