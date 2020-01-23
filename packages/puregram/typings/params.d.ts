import Types from './types';
import { Interface } from 'readline';
import { Agent } from 'https';

type AllowArray<T> = T | Array<T>;

export interface ITelegramParams {
  token: string;

  apiUrl?: string;

  agent?: Agent;
}

export interface IGetUpdatesParams {
  /**
   * Identifier of the first update to be returned.
   * Must be greater by one than the highest among
   * the identifiers of previously received updates.
   * By default, updates starting with the earliest
   * unconfirmed update are returned.
   * An update is considered confirmed as soon as
   * getUpdates is called with an offset higher than
   * its update_id. The negative offset can be specified
   * to retrieve updates starting from -offset update
   * from the end of the updates queue.
   * All previous updates will forgotten.
   */
  offset?: number;

  /**
   * Limits the number of updates to be retrieved.
   * Values between 1—100 are accepted.
   * Defaults to 100.
   */
  limit?: number;

  /**
   * Timeout in seconds for long polling.
   * Defaults to 0, i.e. usual short polling
   * Should be positive,
   * short polling should be used for
   * testing purposes only.
   */
  timeout?: number;

  /**
   * List the types of updates you want your bot to receive.
   * For example, specify [`message`, `edited_channel_post`, `callback_query`]
   * to only receive updates of these types.
   * See [Update](https://core.telegram.org/bots/api#update)
   * for a complete list of available update types.
   * Specify an empty list to receive all updates regardless of type (default).
   * If not specified, the previous setting will be used.
   *
   * Please note that this parameter doesn't affect updates created before the call
   * to the getUpdates, so unwanted updates may be received for a short period of time.
   */
  allowed_updates?: AllowArray<Types.ContextPossibleTypes>;
}

export interface ISendMessageParams {
  /**
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: string | number;

  /**
   * Text of the message to be sent
   */
  text: string;

  /**
   * Send [Markdown](https://core.telegram.org/bots/api#markdown-style)
   * or [HTML](https://core.telegram.org/bots/api#html-style),
   * if you want Telegram apps to show **bold**, _italic_,
   * `fixed-width text` or [inline URLs](https://core.telegram.org/bots/api#sendmessage)
   * in your bot's message.
   */
  parse_mode?: Types.ParseModes;

  /**
   * Disables link previews for links in this message
   */
  disable_web_page_preview?: boolean;

  /**
   * Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages).
   * Users will receive a notification with no sound.
   */
  disable_notification?: boolean;

  /**
   * If the message is a reply,
   * ID of the original message
   */
  reply_to_message_id?: number;

  /**
   * Additional interface options.
   * A JSON-serialized object for
   * an [inline keyboard](https://core.telegram.org/bots#inline-keyboards-and-on-the-fly-updating),
   * [custom reply keyboard](https://core.telegram.org/bots#keyboards),
   * instructions to remove reply keyboard or to force a reply from the user.
   */
  reply_markup?: Types.ReplyMarkup;
}
