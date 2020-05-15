import Types from '../../typings/types';

interface IKeyboardOptions {
  /**
   * Text of the button.
   * If none of the optional fields are used,
   * it will be sent as a message when
   * the button is pressed
   */
  text: string;

  /**
   * If `true`, the user's phone number will be
   * sent as a contact when the button is pressed.
   * Available in private chats only
   */
  request_contact?: boolean;

  /**
   * If `true`, the user's current location will be
   * sent when the button is pressed.
   * Available in private chats only
   */
  request_location?: boolean;

  /**
   * If specified, the user will be asked to create
   * a poll and send it to the bot when the button
   * is pressed. Available in private chats only
   */
  request_poll?: IKeyboardButtonPollType;
}

interface IKeyboardButtonPollType {
  /**
   * If `quiz` is passed, the user will be allowed to
   * create only polls in the quiz mode.
   *
   * If `regular` is passed, only regular polls will be allowed.
   *
   * Otherwise, the user will be allowed to create a poll of any type.
   */
  type?: Types.KeyboardButtonPollTypes;
}

interface ITextButton {
  text: string;
}

interface IContactRequestButton {
  text: string;

  request_contact: true;
}

interface ILocationRequestButton {
  text: string;

  request_location: true;
}

interface IPollRequestButton {
  text: string;

  request_poll: true;
}

declare class Keyboard {
  public get [Symbol.toStringTag](): 'Keyboard';

  public constructor();

  public static keyboard(rows: Array<Array<IKeyboardOptions>>): Keyboard;

  public static resize(resize?: boolean): Keyboard;

  public static oneTime(oneTime?: boolean): Keyboard;

  public static selective(selective?: boolean): Keyboard;

  public static textButton(text: string): ITextButton;

  public static contactRequestButton(text: string): IContactRequestButton;

  public static locationRequestButton(text: string): ILocationRequestButton;

  public static pollRequestButton(text: string, type?: Types.KeyboardButtonPollTypes): IPollRequestButton;
}

export = Keyboard;
