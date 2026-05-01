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
   * cap the wait between request arrival and our 200. the handler waits until
   * either the slot is claimed, dispatch finishes, or this timer fires; dispatch
   * keeps running after the response and is awaited by `tg.shutdown()`
   *
   * default 25_000ms — sits under telegram's ~60s retry threshold so a slow
   * handler doesn't trigger duplicate deliveries. only active when
   * `webhookReply` is on (otherwise we respond immediately)
   */
  timeoutMilliseconds?: number

  /**
   * cap the request body size accepted by `nodeAdapter`. requests over the
   * limit are rejected with 413 before json parsing. default 1MB — telegram
   * updates are typically <100KB; the cap exists to bound memory under abuse
   *
   * other adapters (express, koa, fastify, hono, h3, elysia) defer to their
   * framework's own body-size limits
   */
  maxBodyBytes?: number
}

export interface ResolvedWebhookOptions {
  secretToken: string | undefined
  webhookReply: boolean
  timeoutMilliseconds: number
  maxBodyBytes: number
}

export const DEFAULT_MAX_BODY_BYTES = 1_048_576
export const DEFAULT_TIMEOUT_MS = 25_000

export function resolveWebhookOptions (input?: WebhookOptions) {
  return {
    secretToken: input?.secretToken,
    webhookReply: input?.webhookReply ?? true,
    timeoutMilliseconds: input?.timeoutMilliseconds ?? DEFAULT_TIMEOUT_MS,
    maxBodyBytes: input?.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES
  }
}
