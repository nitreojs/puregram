export interface WebhookOptions {
  /**
   * shared secret echoed by telegram via the `x-telegram-bot-api-secret-token`
   * header. mismatched requests get a 401, missing headers also 401 when set
   */
  secretToken?: string

  /**
   * enables the webhook-reply slot. handlers can call `tg.replyViaWebhook(method, params)`
   * to pipe a single api call into the webhook 200 body, skipping the round-trip
   *
   * default `false`. plain `tg.api.X(...)` always round-trips regardless of this flag —
   * webhook reply is opt-in *per call*, never automatic
   */
  webhookReply?: boolean

  /**
   * cap the wait between request arrival and our 200. only meaningful when
   * `webhookReply` is enabled — the handler waits until either the slot is
   * claimed, dispatch finishes, or this timer fires. dispatch keeps running
   * after the response and is awaited by `tg.shutdown()`
   *
   * `0` (default) means no cap
   */
  timeoutMilliseconds?: number
}

export interface ResolvedWebhookOptions {
  secretToken: string | undefined
  webhookReply: boolean
  timeoutMilliseconds: number
}

export function resolveWebhookOptions (input?: WebhookOptions) {
  return {
    secretToken: input?.secretToken,
    webhookReply: input?.webhookReply ?? false,
    timeoutMilliseconds: input?.timeoutMilliseconds ?? 0
  }
}
