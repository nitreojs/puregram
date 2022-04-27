import { MessageContext, CallbackQueryContext } from 'puregram'
import { SendMessageParams } from 'puregram/generated'

import { PromptAnswer } from './prompt-answer'

export type PromptMessageContext = (MessageContext & PromptContext) | (CallbackQueryContext & PromptContext)

export type PromptParamsType = Id<PromptParams & Optional<SendMessageParams, 'chat_id' | 'text'>>
export type PromptValidate = (answer: PromptAnswer) => boolean
export type PromptOnValidation = (context: MessageContext | CallbackQueryContext, answer: PromptAnswer) => any
export type Prompt = (text: string, params?: PromptParamsType) => Promise<PromptAnswer>

export interface PromptParams {
  validate?: PromptValidate
  onValidationFail?: PromptOnValidation
}

export interface PromptQuestionRequest {
  text: string
  params?: PromptParamsType
}

export interface PromptQuestionParams extends PromptParams {
  resolve: (value: PromptAnswer | PromiseLike<PromptAnswer>) => void
  promptedAt: number
  request: PromptQuestionRequest
}

export interface PromptAnswerParams {
  promptedAt?: number
  promptedWithin?: number
  answeredAt?: number
}

/** Might be used to reveal actual object's type */
export type Id<T> = T extends infer O
  ? { [K in keyof O]: O[K] }
  : never

export interface PromptContext {
  /** Sends message with provided `text` and waits the answer */
  prompt: Prompt
  /** Same as `prompt`, but it replies to current message */
  promptReply: Prompt
}

/** Removes `[key: string]: any;` from interface */
export type Known<T> = {
  [K in keyof T as (string extends K ? never : number extends K ? never : K)]: T[K]
}

export type Optional<T, K extends keyof Known<T>> =
  /** We pick every field but `K` and leave them as is */
  & Pick<Known<T>, Exclude<keyof Known<T>, K>>
  /** Then, we take our `K` fields and mark them as optional */
  & { [P in K]?: Known<T>[P] }
  /** Lastly, we add `[key: string]: any;` */
  & { [key: string]: any }
