import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

import { InlineKeyboardButton } from './inline-keyboard-button'

/** This object represents an inline keyboard that appears right next to the message it belongs to. */
@Inspectable()
export class InlineKeyboardMarkup implements Structure {
  constructor (public payload: Interfaces.TelegramInlineKeyboardMarkup) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Array of button rows */
  @Inspect()
  get inlineKeyboard () {
    const { inline_keyboard } = this.payload

    return inline_keyboard.map(row => row.map(element => new InlineKeyboardButton(element)))
  }

  toJSON () {
    return this.payload
  }
}
