import type { WebhookHandler } from '../handler'

import { webAdapter } from './web'

interface H3EventLike {
  web?: { request: Request }
  node: { req: unknown, res: unknown }
}

export type H3Handler = (event: H3EventLike) => Promise<Response>

/**
 * `eventHandler(h3Adapter(tg.webhookHandler()))`. requires h3 v2 (`event.web.request`)
 */
export function h3Adapter (handler: WebhookHandler) {
  const fn: H3Handler = async (event) => {
    if (event.web?.request === undefined) {
      throw new Error('h3 adapter requires h3 v2 web Request — use the node adapter on h3 v1')
    }

    return webAdapter(handler, event.web.request)
  }

  return fn
}
