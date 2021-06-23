import { Attachment, MessageContext } from 'puregram';
import { inspectable } from 'inspectable';

import * as Types from './types';
import { filterPayload } from './utils';

export class PromptAnswer {
  constructor(
    public context: Types.PromptMessageContext,
    private params: Types.PromptAnswerParams = {}
  ) {}

  public get promptedAt(): number | undefined {
    return this.params.promptedAt;
  }

  public get promptedWithin(): number | undefined {
    return this.params.promptedWithin;
  }

  public get answeredAt(): number | undefined {
    return this.params.answeredAt;
  }

  public get text(): string | undefined {
    return this.context.text;
  }

  public get caption(): string | undefined {
    return this.context.caption;
  }

  public get attachments(): Attachment[] {
    return this.context.attachments;
  }
}

inspectable(PromptAnswer, {
  serialize(answer: PromptAnswer) {
    return filterPayload({
      context: answer.context,
      promptedAt: answer.promptedAt,
      promptedWithin: answer.promptedWithin,
      answeredAt: answer.answeredAt,
      text: answer.text,
      caption: answer.caption,
      attachments: answer.attachments
    });
  }
});
