import { inspectable } from 'inspectable';
import { TelegramMessageId } from '../../interfaces';

/** This object represents a unique message identifier. */
export class MessageId {
  private payload: TelegramMessageId;

  constructor(payload: TelegramMessageId) {
    this.payload = payload;
  }

  /** Unique message identifier */
  public get id(): number {
    return this.payload.message_id;
  }
}

inspectable(MessageId, {
  serialize(messageId: MessageId) {
    return {
      id: messageId.id
    };
  }
});
