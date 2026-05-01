import type { WebhookHandler } from '../handler'

import { webAdapter } from './web'

interface ElysiaContextLike {
  request: Request
}

export type ElysiaHandler = (ctx: ElysiaContextLike) => Promise<Response>

/**
 * `app.post('/webhook', elysiaAdapter(tg.webhookHandler()))`
 */
export function elysiaAdapter (handler: WebhookHandler) {
  const fn: ElysiaHandler = ctx => webAdapter(handler, ctx.request)

  return fn
}
