import { inspectable } from 'inspectable';

import {
  TelegramMessageEntityUnion,
  TelegramMessageEntityTextLink,
  TelegramMessageEntityTextMention,
  TelegramMessageEntityPre
} from '../../interfaces';

import { EntityType } from '../../types';
import { User } from './user';
import { filterPayload } from '../../utils/helpers';
import { TelegramUser } from '../../interfaces';

interface MessageEntityJSON {
  type: EntityType;

  offset: number;

  length: number;

  url?: string;

  user?: TelegramUser;

  language?: string;
}

/**
 * This object represents one special entity in a text message.
 * For example, hashtags, usernames, URLs, etc.
 */
export class MessageEntity {
  private payload: TelegramMessageEntityUnion;

  constructor(payload: TelegramMessageEntityUnion) {
    this.payload = payload;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /**
   * Type of the entity.
   *
   * Can be `mention` (`@username`), `hashtag` (`#hashtag`), `cashtag`
   * (`$USD`), `bot_command` (`/start@jobs_bot`), `url`
   * (`https://telegram.org`), `email` (`do-not-reply@telegram.org`),
   * `phone_number` (`+1-212-555-0123`), `bold` (**bold text**), `italic`
   * (_italic text_), `underline` (underlined text), `strikethrough`
   * (~~strikethrough text~~), `code` (`monowidth string`), `pre` (`monowidth
   * block`), `text_link` (for clickable text URLs), `text_mention`
   * (for users without usernames)
   */
  public get type(): EntityType {
    return this.payload.type;
  }

  /** Offset in UTF-16 code units to the start of the entity */
  public get offset(): number {
    return this.payload.offset;
  }

  /** Length of the entity in UTF-16 code units */
  public get length(): number {
    return this.payload.length;
  }

  /**
   * For `text_link` only, url that will be opened after user taps on the text
   */
  public get url(): string | undefined {
    return (this.payload as TelegramMessageEntityTextLink).url;
  }

  /** For `text_mention` only, the mentioned user */
  public get user(): User | undefined {
    const { user } = this.payload as TelegramMessageEntityTextMention;

    if (!user) return undefined;

    return new User(user);
  }

  /** For `pre` only, the programming language of the entity text */
  public get language(): string | undefined {
    return (this.payload as TelegramMessageEntityPre).language;
  }

  public toJSON(): MessageEntityJSON {
    return {
      type: this.type,
      offset: this.offset,
      length: this.length,
      url: this.url,
      user: this.user ? this.user.toJSON() : undefined,
      language: this.language
    };
  }
}

inspectable(MessageEntity, {
  serialize(entity: MessageEntity) {
    const payload = {
      type: entity.type,
      offset: entity.offset,
      length: entity.length,
      url: entity.url,
      user: entity.user,
      language: entity.language
    };

    return filterPayload(payload);
  }
});
