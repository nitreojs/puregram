export type WebhookReplyMode = 'auto' | 'always' | false

export interface WebhookOptions {
  /**
   * shared secret echoed by telegram via the `x-telegram-bot-api-secret-token`
   * header. mismatched requests get a 401, missing headers also 401 when set
   */
  secretToken?: string

  /**
   * pipe the first non-multipart api call inside a handler into the webhook
   * 200 body, skipping the round-trip
   *
   * - `false` (default) — never; respond 200 immediately, dispatch in background
   * - `'auto'` — use webhook reply if claimed before timeout; otherwise respond `{}`
   * - `'always'` — same as `'auto'` runtime-wise; semantically reserves the slot
   *
   * the claimed call returns `undefined` to its caller, so prefer it for fire-and-forget
   * methods that return `true` (chat actions, settings, edits)
   */
  webhookReply?: WebhookReplyMode

  /**
   * cap the wait between request arrival and our 200. hits when webhook reply
   * is enabled and the handler is slow to claim. dispatch keeps running after
   * the response and is awaited by `tg.shutdown()`
   *
   * `0` (default) means no cap — wait until dispatch ends or the slot is claimed
   */
  timeoutMilliseconds?: number
}

export interface ResolvedWebhookOptions {
  secretToken: string | undefined
  webhookReply: WebhookReplyMode
  timeoutMilliseconds: number
}

export function resolveWebhookOptions (input?: WebhookOptions) {
  return {
    secretToken: input?.secretToken,
    webhookReply: input?.webhookReply ?? false,
    timeoutMilliseconds: input?.timeoutMilliseconds ?? 0
  }
}
