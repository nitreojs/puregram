import type { IncomingMessage, ServerResponse } from 'node:http'

import type { ParsedRequest, WebhookHandler } from '../handler'
import { DEFAULT_MAX_BODY_BYTES } from '../options'

export type NodeWebhookCallback = (req: IncomingMessage, res: ServerResponse) => Promise<void>

export interface NodeAdapterOptions {
  /** body-size cap in bytes; default 1MB */
  maxBodyBytes?: number
}

class BodyTooLargeError extends Error {}

export function nodeAdapter (handler: WebhookHandler, options: NodeAdapterOptions = {}) {
  const maxBodyBytes = options.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES

  const callback: NodeWebhookCallback = async (req, res) => {
    const parsed: ParsedRequest = {
      method: req.method ?? 'GET',
      headers: normaliseHeaders(req.headers),
      body: undefined
    }

    if (parsed.method === 'POST') {
      // pre-check via Content-Length so we never start buffering an oversized body
      const declared = Number(parsed.headers['content-length'] ?? 0)

      if (Number.isFinite(declared) && declared > maxBodyBytes) {
        res.writeHead(413)
        res.end()

        return
      }

      try {
        parsed.body = await readJson(req, maxBodyBytes)
      } catch (error) {
        if (error instanceof BodyTooLargeError) {
          res.writeHead(413)
        } else {
          res.writeHead(400)
        }

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

async function readJson (req: IncomingMessage, maxBytes: number) {
  const chunks: Uint8Array[] = []
  let total = 0

  for await (const chunk of req) {
    const buf = chunk as Uint8Array

    total += buf.length

    if (total > maxBytes) {
      throw new BodyTooLargeError()
    }

    chunks.push(buf)
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
