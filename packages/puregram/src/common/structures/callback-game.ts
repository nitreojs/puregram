import { inspectable } from 'inspectable';

import { TelegramCallbackGame } from '../../telegram-interfaces';

/** A placeholder, currently holds no information. */
export class CallbackGame {
  private payload: TelegramCallbackGame;

  constructor(payload: TelegramCallbackGame) {
    this.payload = payload;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }
}

inspectable(CallbackGame, {
  serialize(game: CallbackGame) {
    return {};
  }
});
