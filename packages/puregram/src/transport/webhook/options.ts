export interface WebhookOptions {
  /** shared secret echoed in `x-telegram-bot-api-secret-token`. mismatched/missing requests get 401 when set */
  secretToken?: string

  /**
   * webhook-reply optimization (default on) — api calls returning `true` (chat
   * actions, reactions, deletions, …) ride the 200 body, saving a round-trip.
   * data-returning methods (sendMessage, getChat, …) still round-trip. invisible
   * to userland: `await tg.api.X(...)` resolves the same either way.
   * disable only when proxies/firewalls strip non-empty 200 bodies
   */
  webhookReply?: boolean

  /**
   * max wait between request arrival and the 200 response. dispatch keeps
   * running after — awaited by `tg.shutdown()`. default 25_000ms sits under
   * telegram's ~60s retry threshold. only active with `webhookReply`
   */
  timeoutMilliseconds?: number

  /**
   * what to do when `timeoutMilliseconds` elapses before dispatch settles.
   * `'return'` (default) answers 200 — telegram considers the update delivered
   * and releases its per-chat queue, so the next update for that chat may
   * arrive while this one is still running. `'throw'` answers 500 instead, so
   * telegram redelivers; pair it with `dedupeUpdates`, or the still-running
   * dispatch and the redelivered one both process the same update. a function
   * receives the raw update and then answers 200
   */
  onTimeout?: 'return' | 'throw' | ((raw: Record<string, unknown>) => void)

  /**
   * `nodeAdapter` body-size cap; requests over the limit return 413. default
   * 1MB (telegram updates are typically <100KB). other adapters use their
   * framework's own limits
   */
  maxBodyBytes?: number
}

export interface ResolvedWebhookOptions {
  secretToken: string | undefined
  webhookReply: boolean
  timeoutMilliseconds: number
  onTimeout: NonNullable<WebhookOptions['onTimeout']>
  maxBodyBytes: number
}

export const DEFAULT_MAX_BODY_BYTES = 1_048_576
export const DEFAULT_TIMEOUT_MS = 25_000

export function resolveWebhookOptions (input?: WebhookOptions) {
  return {
    secretToken: input?.secretToken,
    webhookReply: input?.webhookReply ?? true,
    timeoutMilliseconds: input?.timeoutMilliseconds ?? DEFAULT_TIMEOUT_MS,
    onTimeout: input?.onTimeout ?? 'return',
    maxBodyBytes: input?.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES
  }
}
