import { inspectable } from 'inspectable';

import { Message } from './message';

import { TelegramCallbackQuery } from '../interfaces';
import { User } from '../common/structures/user';
import { filterPayload } from '../utils/helpers';

/**
 * This object represents an incoming callback query from a callback button in
 * an inline keyboard. If the button that originated the query was attached to
 * a message sent by the bot, the field message will be present.
 * If the button was attached to a message sent via the bot (in inline mode),
 * the field inline_message_id will be present.
 * Exactly one of the fields `data` or `game_short_name` will be present.
 */
export class CallbackQuery {
  public payload: TelegramCallbackQuery;

  constructor(payload: TelegramCallbackQuery) {
    this.payload = payload;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /** Unique identifier for this query */
  public get id(): string {
    return this.payload.id;
  }

  /** Sender */
  public get from(): User {
    return new User(this.payload.from);
  }

  /** Sender ID */
  public get senderId(): number {
    return this.from.id;
  }

  /**
   * Message with the callback button that originated the query.
   * Note that message content and message date will not be available
   * if the message is too old
   */
  public get message(): Message | undefined {
    const { message } = this.payload;

    if (!message) return undefined;

    return new Message(message);
  }

  /**
   * Identifier of the message sent via the bot in inline mode,
   * that originated the query.
   */
  public get inlineMessageId(): string | undefined {
    return this.payload.inline_message_id;
  }

  /**
   * Global identifier, uniquely corresponding to the chat to which the message
   * with the callback button was sent. Useful for high scores in games.
   */
  public get chatInstance(): string {
    return this.payload.chat_instance;
  }

  /**
   * Data associated with the callback button.
   * Be aware that a bad client can send arbitrary data in this field.
   */
  public get data(): string | undefined {
    return this.payload.data;
  }

  /**
   * Short name of a Game to be returned,
   * serves as the unique identifier for the game
   */
  public get gameShortName(): string | undefined {
    return this.payload.game_short_name;
  }
}

inspectable(CallbackQuery, {
  serialize(query: CallbackQuery) {
    const payload = {
      id: query.id,
      senderId: query.senderId,
      from: query.from,
      message: query.message,
      inlineMessageId: query.inlineMessageId,
      chatInstance: query.chatInstance,
      data: query.data,
      gameShortName: query.gameShortName
    };

    return filterPayload(payload);
  }
});
