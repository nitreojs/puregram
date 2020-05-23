import Interfaces from '../../typings/interfaces';

declare class ForwardMessage {
  public constructor(update: object);

  /**
   * Sender of the original message
   */
  public from?: Interfaces.IUser;

  /**
   * Information about the original channel
   */
  public chat?: Interfaces.IChat;

  /**
   * Identifier of the original message in the channel
   */
  public messageId?: number;

  /**
   * Signature of the post author if present
   */
  public signature?: string;

  /**
   * Sender's name for messages forwarded from users
   * who disallow adding a link to their account in forwarded messages
   */
  public senderName?: string;

  /**
   * Date the original message was sent in Unix time
   */
  public createdAt: number;
}

export = ForwardMessage;
