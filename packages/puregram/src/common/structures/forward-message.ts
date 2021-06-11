import { inspectable } from 'inspectable';

import { User } from './user';
import { Chat } from './chat';

import { TelegramMessage } from '../../telegram-interfaces';
import { filterPayload } from '../../utils/helpers';

/** This object represents a forwarded message. */
export class ForwardMessage {
  private payload: TelegramMessage;

  constructor(payload: TelegramMessage) {
    this.payload = payload;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /**
   * For messages forwarded from channels, identifier of the original message
   * in the channel
   */
  public get id(): number | undefined {
    return this.payload.forward_from_message_id;
  }

  /** For forwarded messages, sender of the original message */
  public get from(): User | undefined {
    const { forward_from } = this.payload;

    if (!forward_from) return undefined;

    return new User(forward_from);
  }

  /**
   * For messages forwarded from channels, information about the original
   * channel
   */
  public get chat(): Chat | undefined {
    const { forward_from_chat } = this.payload;

    if (!forward_from_chat) return undefined;

    return new Chat(forward_from_chat);
  }

  /**
   * For messages forwarded from channels, signature of the post author
   * if present
   */
  public get signature(): string | undefined {
    return this.payload.forward_signature;
  }

  /**
   * Sender's name for messages forwarded from users who disallow adding a link
   * to their account in forwarded messages
   */
  public get senderName(): string | undefined {
    return this.payload.forward_sender_name;
  }

  /**
   * For forwarded messages, date the original message was sent in Unix time
   */
  public get createdAt(): number {
    return this.payload.forward_date!;
  }
}

inspectable(ForwardMessage, {
  serialize(message: ForwardMessage) {
    const payload = {
      id: message.id,
      from: message.from,
      chat: message.chat,
      signature: message.signature,
      senderName: message.senderName,
      createdAt: message.createdAt
    };

    return filterPayload(payload);
  }
});
