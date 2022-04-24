import { inspectable } from 'inspectable'
import { MessageContext } from 'puregram'

import * as Types from './types'
import { filterPayload } from './utils'

export class PromptAnswer {
  constructor(
    public context: Types.PromptMessageContext,
    private params: Types.PromptAnswerParams = {}
  ) { }

  get promptedAt() {
    return this.params.promptedAt
  }

  get promptedWithin() {
    return this.params.promptedWithin
  }

  get answeredAt() {
    return this.params.answeredAt
  }

  get text() {
    return this.context instanceof MessageContext
      ? this.context.text
      : this.context.message!.text
  }

  get caption() {
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
