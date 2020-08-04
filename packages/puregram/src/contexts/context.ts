import { inspectable } from 'inspectable';

import { Telegram } from '../telegram';
import { UpdateName } from '../types';

type AllowArray<T> = T | T[];

export class Context {
  public telegram: Telegram;

  protected updateType: UpdateName;

  constructor(telegram: Telegram, updateType: UpdateName) {
    this.telegram = telegram;
    this.updateType = updateType;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  public is(rawTypes: AllowArray<UpdateName>): boolean {
    const types = Array.isArray(rawTypes)
      ? rawTypes
      : [rawTypes];

    return types.includes(this.updateType);
  }
}

inspectable(Context, {
  serialize(context: Context) {
    return {};
  }
});
