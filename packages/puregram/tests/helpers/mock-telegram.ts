import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'

export interface MockResponse {
  ok: boolean
  result?: unknown
  error_code?: number
  description?: string
}

export interface MockRoute {
  method: string
  response: MockResponse | ((params: Record<string, unknown>) => MockResponse)
}

export class MockTelegram {
  private server: Server | undefined
  private routes: MockRoute[] = []

  expect (method: string, response: MockResponse | ((params: Record<string, unknown>) => MockResponse)) {
    this.routes.push({ method, response })

    return this
  }

  async start () {
    const server = createServer(async (req, res) => {
      const match = /\/bot[^/]+\/([a-zA-Z]+)(?:\?(.*))?/.exec(req.url ?? '')

      if (!match) {
        res.writeHead(404)
        res.end()

        return
      }

      const method = match[1]

      const chunks: Buffer[] = []

      for await (const chunk of req) {
        chunks.push(chunk as Buffer)
      }

      const params: Record<string, unknown> = {}

      if (match[2]) {
        const usp = new URLSearchParams(match[2])

        for (const [k, v] of usp.entries()) {
          try {
            params[k] = JSON.parse(v)
          } catch {
            params[k] = v
          }
        }
      }

      const route = this.routes.find(r => r.method === method)

      if (!route) {
        res.writeHead(404, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ ok: false, error_code: 404, description: `unmocked: ${method}` }))

        return
      }

      const response = typeof route.response === 'function' ? route.response(params) : route.response

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify(response))
    })

    this.server = server
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
    const addr = server.address() as AddressInfo

    return `http://127.0.0.1:${addr.port}/bot`
  }

  async stop () {
    const server = this.server

    if (!server) {
      return
    }

    const { promise, resolve } = Promise.withResolvers<void>()

    // close() alone waits for the http client's keep-alive socket to drain, which
    // never happens inside a test — force those sockets shut so teardown resolves
    server.close(() => resolve())
    server.closeAllConnections()

    await promise
  }
}
