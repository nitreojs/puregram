import type { ParsedRequest, WebhookHandler } from '../handler'

/**
 * web standards adapter. consumes a `Request`, returns a `Response`. used as the
 * shared core for hono, h3, elysia, and any other fetch-style framework
 */
export async function webAdapter (handler: WebhookHandler, request: Request) {
  let body: Record<string, unknown> | undefined

  if (request.method === 'POST') {
    try {
      body = await request.json() as Record<string, unknown>
    } catch {
      return new Response(null, { status: 400 })
    }
  }

  const parsed: ParsedRequest = {
    method: request.method,
    headers: extractHeaders(request.headers),
    body
  }

  const result = await handler(parsed)

  return new Response(result.body || null, {
    status: result.status,
    headers: { 'Content-Type': result.contentType }
  })
}

function extractHeaders (headers: Headers) {
  const out: Record<string, string | undefined> = {}

  headers.forEach((value, key) => {
    out[key.toLowerCase()] = value
  })

  return out
}
