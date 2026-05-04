import type { TelegramInputPollOption } from '@puregram/api'

import { type Camelize, unCamelize } from './camelize'

type PollOptionExtras = Camelize<Omit<TelegramInputPollOption, 'text'>>

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
  static text (text: TelegramInputPollOption['text'], params: PollOptionExtras = {} as PollOptionExtras) {
    return { text, ...unCamelize(params) } as TelegramInputPollOption
  }
}
