import type { TelegramInputPollOption } from '@puregram/api'

/**
 * static factories for `InputPollOption` — passed in `sendPoll(options)`
 *
 * @example
 * ```ts
 * tg.api.sendPoll({
 *   chat_id, question: 'pick one',
 *   options: [InputPollOption.text('first'), InputPollOption.text('second')]
 * })
 * ```
 */
export class InputPollOption {
  /** plain-text option */
  static text (
    text: TelegramInputPollOption['text'],
    params: Omit<TelegramInputPollOption, 'text'> = {}
  ): TelegramInputPollOption {
    return { text, ...params }
  }
}
