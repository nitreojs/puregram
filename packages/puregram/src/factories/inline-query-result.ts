import {
  InlineQueryResult as GeneratedInlineQueryResult,
  InlineQueryResultCached
} from '@puregram/api'
import type { TelegramInlineQueryResultsButton } from '@puregram/api'

/**
 * static factories for `InlineQueryResult*` payloads passed to `answerInlineQuery`
 *
 * cached-file variants live under `InlineQueryResult.cached.X(...)` for parity
 * with v2; the standalone `InlineQueryResultCached` class is also re-exported
 *
 * @example
 * ```ts
 * tg.api.answerInlineQuery({
 *   inline_query_id: q.id,
 *   results: [
 *     InlineQueryResult.article({
 *       id: '1',
 *       title: 'hello',
 *       input_message_content: InputMessageContent.text('hi there')
 *     })
 *   ],
 *   button: InlineQueryResult.button('open web app', { web_app: { url: 'https://example.com' } })
 * })
 * ```
 */
export class InlineQueryResult extends GeneratedInlineQueryResult {
  /** factories for `InlineQueryResultCached*` payloads */
  static cached = InlineQueryResultCached

  /** build an `InlineQueryResultsButton` shown above results */
  static button (
    text: string,
    params: Omit<TelegramInlineQueryResultsButton, 'text'> = {}
  ) {
    return { text, ...params }
  }
}
