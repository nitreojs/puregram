import type { IncomingMessage, ServerResponse } from 'node:http'

export type WebhookCallback = (req: IncomingMessage, res: ServerResponse) => Promise<void>

export interface WebhookDeps {
  buildAndDispatch: (rawUpdate: Record<string, unknown>) => Promise<void>
}

export function createWebhookCallback (deps: WebhookDeps, secret?: string): WebhookCallback {
  return async (req, res) => {
    if (req.method !== 'POST') return

    if (secret !== undefined) {
      const got = req.headers['x-telegram-bot-api-secret-token']
      if (got !== secret) {
        res.writeHead(200)
        res.end()
        return
      }
    }

    let bodyBuffer: Buffer
    try {
      const chunks: Uint8Array[] = []
      for await (const chunk of req) chunks.push(chunk as Uint8Array)
      bodyBuffer = Buffer.concat(chunks)
    } catch {
      res.writeHead(500)
      res.end()
      return
    }

    let update: Record<string, unknown>
    try {
      update = JSON.parse(bodyBuffer.toString('utf8'))
    } catch {
      res.writeHead(400)
      res.end()
      return
    }

    res.writeHead(200)
    res.end()

    setImmediate(() => { void deps.buildAndDispatch(update) })
  }
}
