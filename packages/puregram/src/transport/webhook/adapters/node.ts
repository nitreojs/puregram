import type { IncomingMessage, ServerResponse } from 'node:http'

import type { ParsedRequest, WebhookHandler } from '../handler'

export type NodeWebhookCallback = (req: IncomingMessage, res: ServerResponse) => Promise<void>

export function nodeAdapter (handler: WebhookHandler) {
  const callback: NodeWebhookCallback = async (req, res) => {
    const parsed: ParsedRequest = {
      method: req.method ?? 'GET',
      headers: normaliseHeaders(req.headers),
      body: undefined
    }

    if (parsed.method === 'POST') {
      try {
        parsed.body = await readJson(req)
      } catch {
        res.writeHead(400)
        res.end()

        return
      }
    }

    const result = await handler(parsed)

    res.writeHead(result.status, { 'Content-Type': result.contentType })
    res.end(result.body)
  }

  return callback
}

async function readJson (req: IncomingMessage) {
  const chunks: Uint8Array[] = []

  for await (const chunk of req) {
    chunks.push(chunk as Uint8Array)
  }

  const text = Buffer.concat(chunks).toString('utf8')

  return JSON.parse(text) as Record<string, unknown>
}

function normaliseHeaders (headers: IncomingMessage['headers']) {
  const out: Record<string, string | undefined> = {}

  for (const [key, value] of Object.entries(headers)) {
    if (Array.isArray(value)) {
      // node multi-value headers come as string[]; for our use the first value
      // (matches how all known telegram-set headers behave on the wire)
      out[key.toLowerCase()] = value[0]
    } else if (typeof value === 'string') {
      out[key.toLowerCase()] = value
    }
  }

  return out
}
