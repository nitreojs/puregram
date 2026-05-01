export interface WebhookOptions {
  /**
   * shared secret echoed by telegram via the `x-telegram-bot-api-secret-token`
   * header. mismatched requests get a 401, missing headers also 401 when set
   */
  secretToken?: string

  /**
   * automatic webhook-reply optimization. when on (default), api calls that
   * return `true` (chat actions, message reactions, deletions, pins, …) are
   * piped into the webhook 200 body, saving an http round-trip. methods that
   * return data (sendMessage, getChat, …) always round-trip — the optimization
   * is invisible to userland: `await tg.api.X(...)` resolves to the same value
   * either way, so handlers written for polling work unchanged
   *
   * set `false` only if your infrastructure has a reason to never piggyback on
   * the webhook response (e.g. firewalls / proxies that strip non-empty 200 bodies)
   */
  webhookReply?: boolean

  /**
   * cap the wait between request arrival and our 200. only meaningful when
   * `webhookReply` is on — the handler waits until either the slot is claimed,
   * dispatch finishes, or this timer fires. dispatch keeps running after the
   * response and is awaited by `tg.shutdown()`
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
    webhookReply: input?.webhookReply ?? true,
    timeoutMilliseconds: input?.timeoutMilliseconds ?? 0
  }
}
