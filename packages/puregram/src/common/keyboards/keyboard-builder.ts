import { inspectable } from 'inspectable';

import { PollType } from '../../types';

import {
  KeyboardOptions,
  KeyboardJSON
} from '../../interfaces';

/** Keyboard builder */
export class KeyboardBuilder {
  private rows: KeyboardOptions[][] = [];

  private currentRow: KeyboardOptions[] = [];

  private isOneTime: boolean = false;

  private isResized: boolean = false;

  private isSelective: boolean = false;

  public get [Symbol.toStringTag]() {
    return this.constructor.name;
  }

  /**
   * Generates text button.
   * If none of the optional fields are used,
   * it will be sent as a message when the button is pressed
   */
  public textButton(text: string): this {
    return this.addButton({ text });
  }

  /**
   * The user's current location will be sent when the button is pressed.
   *
   * Available in private chats only
   */
  public requestLocationButton(text: string): this {
    return this.addWideButton({
      text,
      request_location: true
    });
  }

  /**
   * The user will be asked to create a poll and send it to the bot
   * when the button is pressed.
   *
   * Available in private chats only
   */
  public requestPollButton(text: string, type?: PollType): this {
    return this.addWideButton({
      text,
      request_poll: { type }
    });
  }

  /**
   * The user's phone number will be sent as a contact when
   * the button is pressed.
   *
   * Available in private chats only
   */
  public requestContactButton(text: string): this {
    return this.addWideButton({
      text,
      request_contact: true
    });
  }

  /** Saves the current row of buttons in the general rows */
  public row(): this {
    if (this.currentRow.length === 0) {
      return this;
    }

    this.rows.push(this.currentRow);
    this.currentRow = [];

    return this;
  }

  /** When pressed, the keyboard will disappear */
  public oneTime(oneTime: boolean = true): this {
    this.isOneTime = oneTime;

    return this;
  }

  /** Resize the keyboard */
  public resize(resize: boolean = true): this {
    this.isResized = resize;

    return this;
  }

  /** Use this parameter if you want to show the keyboard to specific users only */
  public selective(selective: boolean = true): this {
    this.isSelective = selective;

    return this;
  }

  private addButton(button: KeyboardOptions): this {
    this.currentRow.push(button);

    return this;
  }

  private addWideButton(button: KeyboardOptions): this {
    if (this.currentRow.length !== 0) this.row();

    this.addButton(button);

    return this.row();
  }

  public toJSON(): KeyboardJSON {
    const buttons = this.currentRow.length !== 0
      ? [...this.rows, this.currentRow]
      : this.rows;

    return {
      keyboard: buttons,
      one_time_keyboard: this.isOneTime,
      resize_keyboard: this.isResized,
      selective: this.isSelective
    };
  }

  public toString(): string {
    return JSON.stringify(this);
  }
}

inspectable(KeyboardBuilder, {
  serialize(builder: KeyboardBuilder) {
    return builder.toJSON();
  }
});
