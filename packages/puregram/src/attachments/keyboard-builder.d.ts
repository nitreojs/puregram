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
}

/**
 * This object represents a custom keyboard with reply options
 */
declare class KeyboardBuilder {
  public get [Symbol.toStringTag](): 'KeyboardBuilder';

  public constructor();

  /**
   * Requests clients to resize the keyboard
   * vertically for optimal fit (e.g., make
   * the keyboard smaller if there are just
   * two rows of buttons)
   */
  public resize(resize?: boolean): this;

  /**
   * Requests clients to hide the keyboard as soon
   * as it's been used. The keyboard will still be
   * available, but clients will automatically
   * display the usual letter-keyboard in the chat
   * – the user can press a special button in the
   * input field to see the custom keyboard again.
   */
  public oneTime(oneTime?: boolean): this;

  /**
   * Use this parameter if you want to show the
   * keyboard to specific users only.
   * 
   * Targets:
   * 
   * 1) users that are `@mentioned`
   * in the text of the Message object;
   * 
   * 2) if the bot's message is a reply (has reply_to_message_id),
   * sender of the original message.
   */
  public selective(selective?: boolean): this;

  /**
	 * Saves the current row of buttons in the general rows
	 */
  public row(): this;

  /**
   * Text of the button.
   * If none of the optional fields are used,
   * it will be sent as a message
   * when the button is pressed
   */
  public textButton(text: string): this;

  /**
   * If `true`, the user's phone number will
   * be sent as a contact when the button is pressed
   */
  public contactRequestButton(text: string): this;

  /**
   * If `true`, the user's current location will be sent when the button is pressed
   */
  public locationRequestButton(text: string): this;
}

export = KeyboardBuilder;
