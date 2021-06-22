import { Id, Optional } from 'puregram/lib/types';
import { SendMessageParams } from 'puregram/lib/methods';

import { PromptAnswer } from './prompt-answer';

export type PromptParamsType = Id<PromptParams & Optional<SendMessageParams, 'chat_id' | 'text'>>;

export interface PromptParams { }

export interface PromptQuestionParams {
  resolve: (value: PromptAnswer | PromiseLike<PromptAnswer>) => void;
  start: number;
}

export interface PromptAnswerParams {
  time?: number;
}

export interface PromptContext {
  /** Sends message with provided `text` and waits the answer */
  prompt: (text: string, params?: PromptParamsType) => Promise<PromptAnswer>;
  /** Same as `prompt`, but it replies to current message */
  promptReply: (text: string, params?: PromptParamsType) => Promise<PromptAnswer>;
}