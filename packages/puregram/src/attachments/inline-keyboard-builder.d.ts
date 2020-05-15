import { ILoginUrl, ICallbackGame } from '../../typings/interfaces';

interface IInlineKeyboardOptions {
  /**
   * Label text on the button
   */
  text: string;

  /**
   * HTTP or tg:// url to be opened when button is pressed
   */
  url?: string;

  /**
   * An HTTP URL used to automatically authorize the user.
   */
  login_url?: ILoginUrl;

  /**
   * Data to be sent in a callback query to the bot when button is pressed, 1-64 bytes
   */
  callback_data?: string;

  /**
   * If set, pressing the button will prompt the user to select one of their chats,
   * open that chat and insert the bot‘s username and the specified inline query
   * in the input field. Can be empty, in which case just the bot’s username
   * will be inserted.
   */
  switch_inline_query?: string;

  /**
   * If set, pressing the button will insert the bot‘s username and the specified
   * inline query in the current chat's input field. Can be empty, in which case
   * only the bot’s username will be inserted.
   */
  switch_inline_query_current_chat?: string;

  /**
   * Description of the game that will be launched when the user presses the button.
   */
  callback_game?: ICallbackGame;

  /**
   * Specify `true`, to send a Pay button.
   */
  pay?: boolean;
}

interface ITextButtonParams {
  text: string;

  params?: object;
}

interface IUrlButtonParams {
  text: string;

  url: string;

  payload?: object;
}

interface ISwitchToCurrentChatButtonParams {
  text: string;

  query: string;
}

interface ISwitchToChatButtonParams {
  text: string;

  query: string;
}

interface IGameButtonParams {
  game: ICallbackGame;

  text: string;
}

interface ILoginButtonParams {
  text: string;

  loginUrl: ILoginUrl;
}

/**
 * This object represents an inline keyboard that
 * appears right next to the message it belongs to.
 */
declare class InlineKeyboardBuilder {
  public constructor();

  public get [Symbol.toStringTag](): 'InlineKeyboardBuilder';

  /**
   * Saves the current row of buttons in the general rows
   */
  public row(): this;

  /**
   * Label text on the button
   */
  public textButton(params: ITextButtonParams): this;

  /**
   * HTTP or tg:// url to be opened when button is pressed
   */
  public urlButton(params: IUrlButtonParams): this;

  /**
   * If set, pressing the button will insert the bot‘s
   * username and the specified inline query in the
   * current chat's input field. Can be empty,
   * in which case only the bot’s username will
   * be inserted.
   */
  public switchToCurrentChatButton(params: ISwitchToCurrentChatButtonParams): this;

  /**
   * If set, pressing the button will prompt the user
   * to select one of their chats, open that chat and
   * insert the bot‘s username and the specified
   * inline query in the input field. Can be empty,
   * in which case just the bot’s username will
   * be inserted.
   */
  public switchToChatButton(params: ISwitchToChatButtonParams): this;

  /**
   * Description of the game that will be launched
   * when the user presses the button.
   */
  public gameButton(params: IGameButtonParams): this;

  /**
   * Pay button
   */
  public payButton(text: string): this;

  /**
   * An HTTP URL used to automatically authorize the user
   */
  public loginButton(params: ILoginButtonParams): this;
}

export = InlineKeyboardBuilder;
