import { Attachment, MessageContext } from 'puregram';
import { inspectable } from 'inspectable';

import * as Types from './types';
import { filterPayload } from './utils';

export class PromptAnswer {
  constructor(
    public context: MessageContext & Types.PromptContext,
    private params: Types.PromptAnswerParams = {}
  ) {}

  public get time(): number | undefined {
    return this.params.time;
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
      time: answer.time,
      text: answer.text,
      caption: answer.caption,
      attachments: answer.attachments
    });
  }
});
