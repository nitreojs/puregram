import type { ParsedRequest, WebhookHandler } from '../handler'

interface FastifyRequestLike {
  method: string
  headers: Record<string, string | string[] | undefined>
  body?: unknown
}

interface FastifyReplyLike {
  code: (status: number) => FastifyReplyLike
  header: (name: string, value: string) => FastifyReplyLike
  send: (body?: string) => unknown
}

export type FastifyHandler = (req: FastifyRequestLike, reply: FastifyReplyLike) => Promise<void>

/**
 * fastify auto-parses json bodies. `fastify.post('/webhook', fastifyAdapter(tg.webhookHandler()))`
 */
export function fastifyAdapter (handler: WebhookHandler) {
  const fn: FastifyHandler = async (req, reply) => {
    const parsed: ParsedRequest = {
      method: req.method,
      headers: pickFirst(req.headers),
      body: req.body as Record<string, unknown> | undefined
    }

    const result = await handler(parsed)

    reply.code(result.status).header('Content-Type', result.contentType).send(result.body)
  }

  return fn
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
