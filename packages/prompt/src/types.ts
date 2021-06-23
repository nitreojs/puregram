import { MessageContext } from 'puregram';
import { Id, Optional } from 'puregram/lib/types';
import { SendMessageParams } from 'puregram/lib/methods';

import { PromptAnswer } from './prompt-answer';

export type PromptMessageContext = MessageContext & PromptContext;

export type PromptParamsType = Id<PromptParams & Optional<SendMessageParams, 'chat_id' | 'text'>>;
export type PromptValidate = (answer: PromptAnswer) => boolean;
export type PromptOnValidation = (context: MessageContext, answer: PromptAnswer) => any;

export interface PromptParams {
  validate?: PromptValidate;
  onValidationFail?: PromptOnValidation;
}

export interface PromptQuestionRequest {
  text: string;
  params?: PromptParamsType;
}

export interface PromptQuestionParams extends PromptParams {
  resolve: (value: PromptAnswer | PromiseLike<PromptAnswer>) => void;
  promptedAt: number;
  request: PromptQuestionRequest;
}

export interface PromptAnswerParams {
  promptedAt?: number;
  promptedWithin?: number;
  answeredAt?: number;
}

export interface PromptContext {
  /** Sends message with provided `text` and waits the answer */
  prompt: (text: string, params?: PromptParamsType) => Promise<PromptAnswer>;
  /** Same as `prompt`, but it replies to current message */
  promptReply: (text: string, params?: PromptParamsType) => Promise<PromptAnswer>;
}