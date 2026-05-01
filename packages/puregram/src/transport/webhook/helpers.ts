import type { TelegramInputFile, TelegramWebhookInfo } from '@puregram/api'

import type { Telegram } from '../../telegram'

export interface SetWebhookOptions {
  /** HTTPS url telegram will POST updates to. empty string clears the webhook */
  url: string
  /** public-key cert for self-signed setups */
  certificate?: TelegramInputFile
  /** fixed ip address bypassing dns resolution for outgoing requests */
  ipAddress?: string
  /** simultaneous connections cap, 1-100. default 40 */
  maxConnections?: number
  /** explicit list of update types to subscribe to. empty array = default minus opt-in kinds */
  allowedUpdates?: string[]
  /** drop the queued backlog before subscribing */
  dropPendingUpdates?: boolean
  /** echoed in `x-telegram-bot-api-secret-token` on every webhook delivery */
  secretToken?: string
}

export interface DeleteWebhookOptions {
  /** drop the queued backlog when unsubscribing */
  dropPendingUpdates?: boolean
}

export async function setWebhook (tg: Telegram, options: SetWebhookOptions): Promise<true> {
  return tg.api.setWebhook({
    url: options.url,
    ...(options.certificate !== undefined && { certificate: options.certificate }),
    ...(options.ipAddress !== undefined && { ip_address: options.ipAddress }),
    ...(options.maxConnections !== undefined && { max_connections: options.maxConnections }),
    ...(options.allowedUpdates !== undefined && { allowed_updates: options.allowedUpdates }),
    ...(options.dropPendingUpdates !== undefined && { drop_pending_updates: options.dropPendingUpdates }),
    ...(options.secretToken !== undefined && { secret_token: options.secretToken })
  })
}

export async function deleteWebhook (tg: Telegram, options: DeleteWebhookOptions = {}): Promise<true> {
  return tg.api.deleteWebhook({
    ...(options.dropPendingUpdates !== undefined && { drop_pending_updates: options.dropPendingUpdates })
  })
}

export async function getWebhookInfo (tg: Telegram): Promise<TelegramWebhookInfo> {
  return tg.api.getWebhookInfo()
}
