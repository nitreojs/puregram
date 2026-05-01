import { createDebug } from '../../../debug'
import type { ParsedRequest, WebhookHandler } from '../handler'

const debug = createDebug('puregram:webhook')

interface ExpressLike {
  method?: string
  headers: Record<string, string | string[] | undefined>
  body?: unknown
}

interface ExpressResLike {
  status: (code: number) => ExpressResLike
  set: (header: string, value: string) => ExpressResLike
  send: (body?: string) => unknown
}

export type ExpressMiddleware = (req: ExpressLike, res: ExpressResLike) => Promise<void>

/**
 * mount with `app.post('/webhook', expressAdapter(tg.webhookHandler({ ... })))`.
 * requires `express.json()` body parser registered before this route
 */
export function expressAdapter (handler: WebhookHandler) {
  const middleware: ExpressMiddleware = async (req, res) => {
    if (req.method === 'POST' && req.body === undefined) {
      debug('express: req.body is undefined — register `app.use(express.json())` before this route')
    }

    const parsed: ParsedRequest = {
      method: req.method ?? 'GET',
      headers: pickFirst(req.headers),
      body: req.body as Record<string, unknown> | undefined
    }

    const result = await handler(parsed)

    res.status(result.status).set('Content-Type', result.contentType).send(result.body)
  }

  return middleware
}

function pickFirst (headers: Record<string, string | string[] | undefined>) {
  const out: Record<string, string | undefined> = {}

  for (const [key, value] of Object.entries(headers)) {
    if (Array.isArray(value)) {
      out[key.toLowerCase()] = value[0]
    } else if (typeof value === 'string') {
      out[key.toLowerCase()] = value
    }
  }

  return out
}
