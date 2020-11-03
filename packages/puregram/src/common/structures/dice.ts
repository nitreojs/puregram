import { inspectable } from 'inspectable';

import { TelegramDice } from '../../interfaces';
import { DiceEmoji } from '../../types';

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
  public get emoji(): DiceEmoji {
    return this.payload.emoji;
  }

  /**
   * Value of the dice,
   * `1-6` for `🎲` and `🎯` base emoji,
   * `1-5` for `🏀` base emoji,
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
