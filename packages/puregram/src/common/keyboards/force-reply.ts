import { inspectable } from 'inspectable';

import { TelegramForceReply } from '../../telegram-interfaces';

/** Force reply keyboard */
export class ForceReply {
  private isSelective: boolean = false;
  private placeholder?: string;

  public selective(selective: boolean = true): this {
    this.isSelective = selective;

    return this;
  }

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
