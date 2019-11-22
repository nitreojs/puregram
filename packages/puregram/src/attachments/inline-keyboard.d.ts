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

interface ITextButton {
  text: string;

  callback_data?: string;
}

interface IUrlButton {
  text: string;

  url: string;

  callback_data?: string;
}

interface ISwitchToCurrentChatButton {
  text: string;

  switch_inline_query_current_chat: string;
}

interface ISwitchToChatButton {
  text: string;

  switch_inline_query: string;
}

interface IGameButton {
  text: string;

  game: ICallbackGame;
}

interface IPayButton {
  text: string;

  pay: true;
}

interface ILoginButton {
  text: string;

  login_url: ILoginUrl;
}

declare class InlineKeyboard {
  public constructor();

  public get [Symbol.toStringTag](): 'InlineKeyboard';

  public static keyboard(rows: Array<Array<IInlineKeyboardOptions>>): InlineKeyboard;

  public static textButton(params: ITextButtonParams): ITextButton;

  public static urlButton(params: IUrlButtonParams): IUrlButton;

  public static switchToCurrentChatButton(params: ISwitchToCurrentChatButtonParams): ISwitchToCurrentChatButton;

  public static switchToChatButton(params: ISwitchToChatButtonParams): ISwitchToChatButton;

  public static gameButton(params: IGameButtonParams): IGameButton;

  public static payButton(text: string): IPayButton;

  public static loginButton(params: ILoginButtonParams): ILoginButton;
}

export = InlineKeyboard;
