import { inspectable } from 'inspectable';
import { SendDiceParams } from '../../methods';

import { TelegramDice } from '../../telegram-interfaces';

/** This object represents an animated emoji that displays a random value. */
export class Dice {
  private payload: TelegramDice;

  constructor(payload: TelegramDice) {
    this.payload = payload;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /** Emoji on which the dice throw animation is based */
  public get emoji(): SendDiceParams['emoji'] {
    return this.payload.emoji! as SendDiceParams['emoji'];
  }

  /**
   * Value of the dice,
   * `1-6` for `🎲`, `🎯` and `🎳` base emoji,
   * `1-5` for `🏀` and `⚽️` base emoji,
   * `1-64` for `🎰` base emoji
   */
  public get value(): number {
    return this.payload.value;
  }
}

inspectable(Dice, {
  serialize(dice: Dice) {
    return {
      emoji: dice.emoji,
      value: dice.value
    };
  }
});
