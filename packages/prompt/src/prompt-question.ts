import { inspectable } from 'inspectable';

import * as Types from './types';

export class PromptQuestion {
  constructor(private params: Types.PromptQuestionParams) { }

  public get resolve(): Types.PromptQuestionParams['resolve'] {
    return this.params.resolve;
  }

  public get start(): number {
    return this.params.start;
  }
}

inspectable(PromptQuestion, {
  serialize(question: PromptQuestion) {
    return {
      start: question.start
    };
  }
});
