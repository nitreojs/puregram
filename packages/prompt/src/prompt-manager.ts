import { Middleware } from 'middleware-io';
import { MessageContext } from 'puregram';
import { Optional } from 'puregram/lib/types';
import { inspectable } from 'inspectable';

import * as Types from './types';
import { PromptQuestion } from './prompt-question';
import { PromptAnswer } from './prompt-answer';

export class PromptManager {
  private questions: Map<number, PromptQuestion> = new Map();

  public get middleware(): Middleware<MessageContext & Types.PromptContext> {
    return async (context: MessageContext & Types.PromptContext, next) => {
      if (!context.is('message')) {
        return;
      }

      const id: number = context.senderId!;

      if (this.questions.has(id)) {
        const question: PromptQuestion = this.questions.get(id)!;
        const answer: PromptAnswer = new PromptAnswer(context, { time: Date.now() - question.start });

        question.resolve(answer);
        this.questions.delete(id);

        return;
      }

      context.prompt = async (text: string, params: Optional<Types.PromptParamsType, 'chat_id' | 'text'> = {}) => {
        if (!text) {
          throw new TypeError('Missing `text` parameter');
        }

        await context.send(text, params);

        return new Promise((resolve) => {
          const question: PromptQuestion = new PromptQuestion({
            resolve,
            start: Date.now()
          });

          this.questions.set(id, question);
        });
      };

      context.promptReply = (text: string, params: Optional<Types.PromptParamsType, 'chat_id' | 'text'> = {}) => (
        context.prompt(text, { ...params, reply_to_message_id: context.id })
      );

      await next();
    };
  }
}

inspectable(PromptManager, {
  serialize(manager: PromptManager) {
    return {};
  }
});
