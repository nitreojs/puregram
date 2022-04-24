import { Middleware } from 'middleware-io'
import { inspectable } from 'inspectable'
import { CallbackQueryContext, MessageContext } from 'puregram'

import * as Types from './types'
import { PromptQuestion } from './prompt-question'
import { PromptAnswer } from './prompt-answer'

export class PromptManager {
  questions: Map<number, PromptQuestion> = new Map();

  get middleware(): Middleware<Types.PromptMessageContext> {
    return async (context: Types.PromptMessageContext, next) => {
      if (!context.is(['message', 'edited_message', 'channel_post', 'edited_channel_post', 'callback_query'])) {
        return next()
      }

      const id: number = context.senderId!
      const now: number = Date.now()

      if (this.questions.has(id)) {
        const question: PromptQuestion = this.questions.get(id)!

        const answer: PromptAnswer = new PromptAnswer(context, {
          promptedAt: question.promptedAt,
          promptedWithin: now - question.promptedAt,
          answeredAt: now
        })

        const validate: Types.PromptValidate = question.validate ?? (() => true)

        if (!validate(answer)) {
          if (question.onValidationFail) {
            await question.onValidationFail(context, answer)
          } else {
            if (context instanceof MessageContext) {
              await context.send(question.requestText, question.requestParams)
            } else {
              await context.message!.send(question.requestText, question.requestParams)
            }
          }

          return
        }

        question.resolve(answer)
        this.questions.delete(id)

        return
      }

      context.prompt = async (text: string, params: Types.PromptParamsType = {}) => {
        if (!text) {
          throw new TypeError('Missing `text` parameter')
        }

        const { validate, onValidationFail, ...sendParams } = params

        if (context instanceof MessageContext) {
          await context.send(text, sendParams)
        } else {
          await context.message!.send(text, sendParams)
        }

        return new Promise((resolve) => {
          const question: PromptQuestion = new PromptQuestion({
            resolve,
            promptedAt: Date.now(),
            request: {
              text,
              params
            },

            validate,
            onValidationFail
          })

          this.questions.set(id, question)
        })
      }

      context.promptReply = (text: string, params: Types.PromptParamsType = {}) => (
        context.prompt(text, {
          ...params,
          reply_to_message_id: context.is('callback_query')
            ? (context as CallbackQueryContext).message!.id
            : (context as MessageContext).id
        })
      )

      return next()
    }
  }
}

inspectable(PromptManager, {
  serialize(manager: PromptManager) {
    return {}
  }
})
