import { Optional } from 'puregram/lib/types'
import { SendMessageParams } from 'puregram/lib/methods'
import { inspectable } from 'inspectable'

import * as Types from './types'
import { filterPayload } from './utils'

export class PromptQuestion {
  constructor(private params: Types.PromptQuestionParams) { }

  public get requestText(): string {
    return this.params.request.text
  }

  public get requestParams(): Optional<SendMessageParams, 'chat_id' | 'text'> {
    return this.params.request.params ?? {}
  }

  public get resolve(): Types.PromptQuestionParams['resolve'] {
    return this.params.resolve
  }

  public get promptedAt(): number {
    return this.params.promptedAt
  }

  public get validate(): Types.PromptValidate | undefined {
    return this.params.validate
  }

  public get onValidationFail(): Types.PromptOnValidation | undefined {
    return this.params.onValidationFail
  }
}

inspectable(PromptQuestion, {
  serialize(question: PromptQuestion) {
    return filterPayload({
      promptedAt: question.promptedAt,
      text: question.requestText,
      params: question.requestParams
    })
  }
})
