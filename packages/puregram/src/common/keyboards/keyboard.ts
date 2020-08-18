import { inspectable } from 'inspectable';

import { PollType } from '../../types';

import {
  KeyboardOptions,
  KeyboardTextButton,
  KeyboardRequestContactButton,
  KeyboardRequestLocationButton,
  KeyboardRequestPollButton,
  KeyboardJSON
} from '../../interfaces';

/** Keyboard */
export class Keyboard {
  private buttons: KeyboardOptions[][] = [];

  private isResized: boolean = false;

  private isOneTime: boolean = false;

  private isSelective: boolean = false;

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /** Assembles a builder of buttons */
  public static keyboard(rows: (KeyboardOptions | KeyboardOptions[])[]): Keyboard {
    const keyboard: Keyboard = new Keyboard();

    for (const row of rows) {
      keyboard.addRow(row);
    }

    return keyboard;
  }

  /** Resize the keyboard */
  public resize(resize: boolean = true): this {
    this.isResized = resize;

    return this;
  }

  /** When pressed, the keyboard will disappear */
  public oneTime(oneTime: boolean = true): this {
    this.isOneTime = oneTime;

    return this;
  }

  /** Use this parameter if you want to show the keyboard to specific users only */
  public selective(selective: boolean = true): this {
    this.isSelective = selective;

    return this;
  }

  /**
   * Generates text button.
   * If none of the optional fields are used,
   * it will be sent as a message when the button is pressed
   */
  public static textButton(text: string): KeyboardTextButton {
    return { text };
  }

  /**
   * The user's phone number will be sent as a contact when
   * the button is pressed.
   *
   * Available in private chats only
   */
  public static requestContactButton(text: string): KeyboardRequestContactButton {
    return {
      text,
      request_contact: true
    };
  }

  /**
   * The user's current location will be sent when the button is pressed.
   *
   * Available in private chats only
   */
  public static requestLocationButton(text: string): KeyboardRequestLocationButton {
    return {
      text,
      request_location: true
    };
  }

  /**
   * The user will be asked to create a poll and send it to the bot
   * when the button is pressed.
   *
   * Available in private chats only
   */
  public static requestPollButton(text: string, type?: PollType): KeyboardRequestPollButton {
    return {
      text,
      request_poll: { type }
    };
  }

  private addRow(row: KeyboardOptions[] | KeyboardOptions): this {
    if (!Array.isArray(row)) row = [row];

    this.buttons.push(row);

    return this;
  }

  public toJSON(): KeyboardJSON {
    return {
      keyboard: this.buttons,
      resize_keyboard: this.isResized,
      one_time_keyboard: this.isOneTime,
      selective: this.isSelective
    };
  }

  public toString(): string {
    return JSON.stringify(this);
  }
}

inspectable(Keyboard, {
  serialize(keyboard: Keyboard) {
    return keyboard.toJSON();
  }
});
