import type { WebhookHandler } from '../handler'

import { webAdapter } from './web'

interface HonoContextLike {
  req: { raw: Request }
}

export type HonoHandler = (c: HonoContextLike) => Promise<Response>

/**
 * `app.post('/webhook', honoAdapter(tg.webhookHandler()))`
 */
export function honoAdapter (handler: WebhookHandler) {
  const fn: HonoHandler = c => webAdapter(handler, c.req.raw)

  return fn
}
