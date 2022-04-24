import { inspectable } from 'inspectable'
import { MessageContext } from 'puregram'

import * as Types from './types'
import { filterPayload } from './utils'

export class PromptAnswer {
  constructor(
    public context: Types.PromptMessageContext,
    private params: Types.PromptAnswerParams = {}
  ) { }

  get promptedAt(): number | undefined {
    return this.params.promptedAt
  }

  get promptedWithin(): number | undefined {
    return this.params.promptedWithin
  }

  get answeredAt(): number | undefined {
    return this.params.answeredAt
  }

  get text(): string | undefined {
    return this.context instanceof MessageContext
      ? this.context.text
      : this.context.message!.text
  }

  get caption(): string | undefined {
    return this.context instanceof MessageContext
      ? this.context.caption
      : this.context.message!.caption
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
      caption: answer.caption
    })
  }
})
