import type { TelegramLinkPreviewOptions } from '@puregram/api'

/**
 * static factories for `LinkPreviewOptions` — passed as `link_preview_options`
 * in `sendMessage`, `editMessageText`, and `InputMessageContent.text`
 *
 * @example
 * ```ts
 * tg.send(chat, 'no preview here', { link_preview_options: LinkPreview.disabled() })
 * tg.send(chat, 'check this',  { link_preview_options: LinkPreview.large('https://example.com') })
 * tg.send(chat, 'minimal',     { link_preview_options: LinkPreview.small('https://example.com', { show_above_text: true }) })
 * ```
 */
export class LinkPreview {
  /** disable link preview entirely */
  static disabled (): TelegramLinkPreviewOptions {
    return { is_disabled: true }
  }

  /** explicit url for the preview, no size hint */
  static url (
    url: string,
    params: Omit<TelegramLinkPreviewOptions, 'url' | 'is_disabled'> = {}
  ) {
    return { url, ...params }
  }

  /** explicit url, prefer the large-media preview */
  static large (
    url: string,
    params: Omit<TelegramLinkPreviewOptions, 'url' | 'is_disabled' | 'prefer_large_media' | 'prefer_small_media'> = {}
  ) {
    return { url, prefer_large_media: true, ...params }
  }

  /** explicit url, prefer the small-media preview */
  static small (
    url: string,
    params: Omit<TelegramLinkPreviewOptions, 'url' | 'is_disabled' | 'prefer_large_media' | 'prefer_small_media'> = {}
  ) {
    return { url, prefer_small_media: true, ...params }
  }
}
