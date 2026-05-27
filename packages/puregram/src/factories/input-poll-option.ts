import type { TelegramInputPollOption } from '@puregram/api'

interface PollOptionExtras {
  /** mode for parsing entities in the option text — currently only custom emoji entities are allowed */
  parseMode?: TelegramInputPollOption['text_parse_mode']
  /** special entities in the option text — can be specified instead of `parseMode` */
  entities?: TelegramInputPollOption['text_entities']
  /** media added to the poll option */
  media?: TelegramInputPollOption['media']
}

/**
 * static factories for `InputPollOption` — passed in `sendPoll(options)`
 *
 * @example
 * ```ts
 * tg.api.sendPoll({
 *   chat_id, question: 'pick one',
 *   options: [
 *     InputPollOption.text('first'),
 *     InputPollOption.text('<b>second</b>', { parseMode: 'HTML' })
 *   ]
 * })
 * ```
 */
export class InputPollOption {
  /** plain-text option */
  static text (text: TelegramInputPollOption['text'], extras: PollOptionExtras = {}): TelegramInputPollOption {
    const option: TelegramInputPollOption = { text }

    if (extras.parseMode !== undefined) {
      option.text_parse_mode = extras.parseMode
    }

    if (extras.entities !== undefined) {
      option.text_entities = extras.entities
    }

    if (extras.media !== undefined) {
      option.media = extras.media
    }

    return option
  }
}
