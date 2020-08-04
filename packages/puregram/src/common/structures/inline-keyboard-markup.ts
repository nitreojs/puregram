import { inspectable } from 'inspectable';

import { TelegramInlineKeyboardMarkup, TelegramInlineKeyboardButton } from '../../interfaces';
import { InlineKeyboardButton } from './inline-keyboard-button';

export class InlineKeyboardMarkup {
  private payload: TelegramInlineKeyboardMarkup;

  constructor(payload: TelegramInlineKeyboardMarkup) {
    this.payload = payload;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /** Array of button rows */
  public get inlineKeyboard(): InlineKeyboardButton[][] {
    const { inline_keyboard } = this.payload;

    return inline_keyboard.map(
      (row: TelegramInlineKeyboardButton[]) => row.map(
        (element: TelegramInlineKeyboardButton) => new InlineKeyboardButton(element)
      )
    );
  }
}

inspectable(InlineKeyboardMarkup, {
  serialize(markup: InlineKeyboardMarkup) {
    return {
      inlineKeyboard: markup.inlineKeyboard
    };
  }
});
