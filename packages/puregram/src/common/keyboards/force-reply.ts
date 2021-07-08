import { inspectable } from 'inspectable';

import { TelegramForceReply } from '../../telegram-interfaces';

/** Force reply keyboard */
export class ForceReply {
  private isSelective: boolean = false;
  private placeholder?: string;

  /** Use this parameter if you want to show the keyboard to specific users only */
  public selective(selective: boolean = true): this {
    this.isSelective = selective;

    return this;
  }

  /** The placeholder to be shown in the input field when the keyboard is active */
  public setPlaceholder(placeholder: string): this {
    this.placeholder = placeholder;

    return this;
  }

  public toJSON(): TelegramForceReply {
    return {
      force_reply: true,
      input_field_placeholder: this.placeholder,
      selective: this.isSelective
    };
  }

  public toString(): string {
    return JSON.stringify(this);
  }
}

inspectable(ForceReply, {
  serialize(forceReply: ForceReply) {
    return forceReply.toJSON();
  }
});
