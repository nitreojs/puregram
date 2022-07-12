import { SendMessageParams } from 'puregram/generated'
import { inspectable } from 'inspectable'

import * as Types from './types'
import { filterPayload } from './utils'

export class PromptQuestion {
  constructor (private params: Types.PromptQuestionParams) { }

  get requestText () {
    return this.params.request.text
  }

  get requestParams (): Types.Optional<SendMessageParams, 'chat_id' | 'text'> {
    return this.params.request.params ?? {}
  }

  get resolve () {
    return this.params.resolve
  }

  get promptedAt () {
    return this.params.promptedAt
  }

  get validate () {
    return this.params.validate
  }

  get onValidationFail () {
    return this.params.onValidationFail
  }
}

inspectable(PromptQuestion, {
  serialize (question) {
    return filterPayload({
      promptedAt: question.promptedAt,
      text: question.requestText,
      params: question.requestParams
    })
  }
})
