import { inspectable } from 'inspectable';

interface ForceReplyKeyboard {
  force_reply: true;

  selective: boolean;
}

/** Force reply keyboard */
export class ForceReply {
  private isSelective: boolean = false;

  public selective(selective: boolean = true): this {
    this.isSelective = selective;

    return this;
  }

  public toJSON(): ForceReplyKeyboard {
    return {
      force_reply: true,
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
