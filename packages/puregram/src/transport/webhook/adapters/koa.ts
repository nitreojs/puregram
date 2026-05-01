import { createDebug } from '../../../debug'
import type { ParsedRequest, WebhookHandler } from '../handler'

const debug = createDebug('puregram:webhook')

interface KoaContextLike {
  method: string
  headers: Record<string, string | string[] | undefined>
  request: { body?: unknown }
  status: number
  body: unknown
  set: (header: string, value: string) => void
}

export type KoaMiddleware = (ctx: KoaContextLike) => Promise<void>

/**
 * pair with `koa-bodyparser` (or any json middleware). `app.use(koaAdapter(tg.webhookHandler()))`
 */
export function koaAdapter (handler: WebhookHandler) {
  const middleware: KoaMiddleware = async (ctx) => {
    if (ctx.method === 'POST' && ctx.request.body === undefined) {
      debug('koa: ctx.request.body is undefined — install koa-bodyparser (or @koa/bodyparser) before this route')
    }

    const parsed: ParsedRequest = {
      method: ctx.method,
      headers: pickFirst(ctx.headers),
      body: ctx.request.body as Record<string, unknown> | undefined
    }

    const result = await handler(parsed)

    ctx.status = result.status
    ctx.set('Content-Type', result.contentType)
    ctx.body = result.body
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
