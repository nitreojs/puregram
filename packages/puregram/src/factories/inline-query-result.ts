import type {
  TelegramInlineQueryResultArticle,
  TelegramInlineQueryResultAudio,
  TelegramInlineQueryResultCachedAudio,
  TelegramInlineQueryResultCachedDocument,
  TelegramInlineQueryResultCachedGif,
  TelegramInlineQueryResultCachedMpeg4Gif,
  TelegramInlineQueryResultCachedPhoto,
  TelegramInlineQueryResultCachedSticker,
  TelegramInlineQueryResultCachedVideo,
  TelegramInlineQueryResultCachedVoice,
  TelegramInlineQueryResultContact,
  TelegramInlineQueryResultDocument,
  TelegramInlineQueryResultGame,
  TelegramInlineQueryResultGif,
  TelegramInlineQueryResultLocation,
  TelegramInlineQueryResultMpeg4Gif,
  TelegramInlineQueryResultPhoto,
  TelegramInlineQueryResultVenue,
  TelegramInlineQueryResultVideo,
  TelegramInlineQueryResultVoice,
  TelegramInlineQueryResultsButton
} from '@puregram/api'

// detect whether K is a required key in T — the `{}` here is the canonical
// "is K optional" marker on the LHS of `extends`; replacing it with `object`
// or `Record<string, never>` breaks the optionality detection
// eslint-disable-next-line @typescript-eslint/ban-types -- see comment above
type RequiredKey<T, K extends keyof T> = {} extends Pick<T, K> ? false : true

// content field translation — preserves required vs optional from the source bot-api type
type FriendlyContent<T> = 'input_message_content' extends keyof T
  ? RequiredKey<T, 'input_message_content' & keyof T> extends true
    ? { content: NonNullable<T['input_message_content' & keyof T]> }
    : { content?: NonNullable<T['input_message_content' & keyof T]> }
  : object

// reply_markup is always optional in bot api inline query results.
// widened to also accept a `{ toJSON: () => Markup }` builder, mirroring the
// codegen widening in methods.ts so callers can pass `InlineKeyboard.keyboard(...)`
// directly without a manual .toJSON() / cast
type FriendlyReplyMarkup<T> = 'reply_markup' extends keyof T
  ? {
      replyMarkup?:
        | NonNullable<T['reply_markup' & keyof T]>
        | { toJSON: () => NonNullable<T['reply_markup' & keyof T]> }
    }
  : object

type ThumbnailMime = 'image/jpeg' | 'image/gif' | 'video/mp4'

type ThumbnailShape<T> = { url: string }
  & ('thumbnail_width' extends keyof T ? { width?: number } : object)
  & ('thumbnail_height' extends keyof T ? { height?: number } : object)
  & ('thumbnail_mime_type' extends keyof T ? { mimeType?: ThumbnailMime } : object)

type FriendlyThumbnail<T> = 'thumbnail_url' extends keyof T
  ? RequiredKey<T, 'thumbnail_url' & keyof T> extends true
    ? { thumbnail: ThumbnailShape<T> }
    : { thumbnail?: ThumbnailShape<T> }
  : object

import { type Camelize, unCamelize } from './camelize'

/** strip bot-api snake_case fields, camelize the rest, then re-add the renamed-shape ones */
type Friendly<T> = Camelize<Omit<
  T,
  'input_message_content' | 'reply_markup' | 'thumbnail_url' | 'thumbnail_width' | 'thumbnail_height' | 'thumbnail_mime_type'
>> & FriendlyContent<T> & FriendlyReplyMarkup<T> & FriendlyThumbnail<T>

interface FriendlyShared {
  content?: unknown
  replyMarkup?: unknown
  thumbnail?: { url?: string, width?: number, height?: number, mimeType?: ThumbnailMime }
}

function translate (params: Record<string, unknown>) {
  const { content, replyMarkup, thumbnail, ...rest } = params as Record<string, unknown> & FriendlyShared
  const out: Record<string, unknown> = unCamelize(rest)

  if (content !== undefined) {
    out.input_message_content = content
  }

  if (replyMarkup !== undefined) {
    out.reply_markup = replyMarkup
  }

  if (thumbnail !== undefined) {
    if (thumbnail.url !== undefined) {
      out.thumbnail_url = thumbnail.url
    }

    if (thumbnail.width !== undefined) {
      out.thumbnail_width = thumbnail.width
    }

    if (thumbnail.height !== undefined) {
      out.thumbnail_height = thumbnail.height
    }

    if (thumbnail.mimeType !== undefined) {
      out.thumbnail_mime_type = thumbnail.mimeType
    }
  }

  return out
}

function build<T extends { type: string }> (type: T['type'], params: unknown) {
  return { type, ...translate(params as Record<string, unknown>) } as T
}

/** factories for `InlineQueryResultCached*` payloads — no thumbnails (cached items reference an existing file) */
export class InlineQueryResultCached {
  /** cached audio file */
  static audio (params: Friendly<Omit<TelegramInlineQueryResultCachedAudio, 'type'>>) {
    return build<TelegramInlineQueryResultCachedAudio>('audio', params)
  }

  /** cached document file */
  static document (params: Friendly<Omit<TelegramInlineQueryResultCachedDocument, 'type'>>) {
    return build<TelegramInlineQueryResultCachedDocument>('document', params)
  }

  /** cached animated gif */
  static gif (params: Friendly<Omit<TelegramInlineQueryResultCachedGif, 'type'>>) {
    return build<TelegramInlineQueryResultCachedGif>('gif', params)
  }

  /** cached mpeg4 animation */
  static mpeg4Gif (params: Friendly<Omit<TelegramInlineQueryResultCachedMpeg4Gif, 'type'>>) {
    return build<TelegramInlineQueryResultCachedMpeg4Gif>('mpeg4_gif', params)
  }

  /** cached photo */
  static photo (params: Friendly<Omit<TelegramInlineQueryResultCachedPhoto, 'type'>>) {
    return build<TelegramInlineQueryResultCachedPhoto>('photo', params)
  }

  /** cached sticker */
  static sticker (params: Friendly<Omit<TelegramInlineQueryResultCachedSticker, 'type'>>) {
    return build<TelegramInlineQueryResultCachedSticker>('sticker', params)
  }

  /** cached video */
  static video (params: Friendly<Omit<TelegramInlineQueryResultCachedVideo, 'type'>>) {
    return build<TelegramInlineQueryResultCachedVideo>('video', params)
  }

  /** cached voice */
  static voice (params: Friendly<Omit<TelegramInlineQueryResultCachedVoice, 'type'>>) {
    return build<TelegramInlineQueryResultCachedVoice>('voice', params)
  }
}

/**
 * static factories for `InlineQueryResult*` payloads passed to `answerInlineQuery`
 *
 * the bot-api fields `input_message_content`, `reply_markup`, and the
 * `thumbnail_*` quartet are renamed for ergonomics:
 * - `input_message_content` → `content`
 * - `reply_markup` → `replyMarkup`

 * - `thumbnail_url` / `thumbnail_width` / `thumbnail_height` /
 *   `thumbnail_mime_type` → `thumbnail: { url, width?, height?, mimeType? }`
 *
 * cached variants live under `InlineQueryResult.cached.X(...)`; the standalone
 * `InlineQueryResultCached` class is also re-exported
 *
 * @example
 * ```ts
 * tg.api.answerInlineQuery({
 *   inline_query_id: q.id,
 *   results: [
 *     InlineQueryResult.article({
 *       id: '1',
 *       title: 'hello',
 *       content: InputMessageContent.text('hi there'),
 *       thumbnail: { url: 'https://example.com/icon.png', width: 100, height: 100 }
 *     })
 *   ],
 *   button: InlineQueryResult.button('open web app', { web_app: { url: 'https://example.com' } })
 * })
 * ```
 */
export class InlineQueryResult {
  /** factories for `InlineQueryResultCached*` payloads */
  static cached = InlineQueryResultCached

  /** build an `InlineQueryResultsButton` shown above results */
  static button (
    text: string,
    params: Camelize<Omit<TelegramInlineQueryResultsButton, 'text'>> = {} as Camelize<Omit<TelegramInlineQueryResultsButton, 'text'>>
  ) {
    return { text, ...unCamelize(params) }
  }

  /** article — link to a web page or arbitrary content body */
  static article (params: Friendly<Omit<TelegramInlineQueryResultArticle, 'type'>>) {
    return build<TelegramInlineQueryResultArticle>('article', params)
  }

  /** mp3 audio file */
  static audio (params: Friendly<Omit<TelegramInlineQueryResultAudio, 'type'>>) {
    return build<TelegramInlineQueryResultAudio>('audio', params)
  }

  /** contact card */
  static contact (params: Friendly<Omit<TelegramInlineQueryResultContact, 'type'>>) {
    return build<TelegramInlineQueryResultContact>('contact', params)
  }

  /** generic file (pdf, zip) */
  static document (params: Friendly<Omit<TelegramInlineQueryResultDocument, 'type'>>) {
    return build<TelegramInlineQueryResultDocument>('document', params)
  }

  /** game shortcut */
  static game (params: Friendly<Omit<TelegramInlineQueryResultGame, 'type'>>) {
    return build<TelegramInlineQueryResultGame>('game', params)
  }

  /** animated gif */
  static gif (params: Friendly<Omit<TelegramInlineQueryResultGif, 'type'>>) {
    return build<TelegramInlineQueryResultGif>('gif', params)
  }

  /** location pin */
  static location (params: Friendly<Omit<TelegramInlineQueryResultLocation, 'type'>>) {
    return build<TelegramInlineQueryResultLocation>('location', params)
  }

  /** mpeg4 animation (silent video) */
  static mpeg4Gif (params: Friendly<Omit<TelegramInlineQueryResultMpeg4Gif, 'type'>>) {
    return build<TelegramInlineQueryResultMpeg4Gif>('mpeg4_gif', params)
  }

  /** photo */
  static photo (params: Friendly<Omit<TelegramInlineQueryResultPhoto, 'type'>>) {
    return build<TelegramInlineQueryResultPhoto>('photo', params)
  }

  /** venue */
  static venue (params: Friendly<Omit<TelegramInlineQueryResultVenue, 'type'>>) {
    return build<TelegramInlineQueryResultVenue>('venue', params)
  }

  /** video (or page with embedded video player) */
  static video (params: Friendly<Omit<TelegramInlineQueryResultVideo, 'type'>>) {
    return build<TelegramInlineQueryResultVideo>('video', params)
  }

  /** ogg/opus voice recording */
  static voice (params: Friendly<Omit<TelegramInlineQueryResultVoice, 'type'>>) {
    return build<TelegramInlineQueryResultVoice>('voice', params)
  }
}
