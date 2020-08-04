import { DiceEmoji } from '../types';

import {
  TelegramMessage,
  ReplyMarkupUnion
} from '../interfaces';

export interface SendDiceParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * Emoji on which the dice throw animation is based.
   * Currently, must be one of `🎲`, `🎯`, or `🏀`.
   * Dice can have values `1-6` for `🎲` and `🎯`,
   * and values `1-5` for `🏀`.
   * Defaults to `🎲`
   */
  emoji: DiceEmoji;

  /**
   * Sends the message silently. Users will receive a notification with
   * no sound.
   */
  disable_notification?: boolean;

  /** If the message is a reply, ID of the original message */
  reply_to_message_id?: number;

  /**
   * Additional interface options.
   * A JSON-serialized object for an inline keyboard, custom reply keyboard,
   * instructions to remove reply keyboard or to force a reply from the user.
   */
  reply_markup?: ReplyMarkupUnion;
}

/**
 * Use this method to send an animated emoji that will display a random value.
 *
 * On success, the sent `Message` is returned.
 */
export type sendDice = (params: SendDiceParams) => Promise<TelegramMessage>;
