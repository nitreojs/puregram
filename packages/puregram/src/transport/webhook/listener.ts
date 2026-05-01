import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'

import type { Telegram } from '../../telegram'

import type { NodeWebhookCallback } from './adapters/node'
import { setWebhook, type SetWebhookOptions } from './helpers'
import type { WebhookOptions } from './options'

export interface StartWebhookOptions extends WebhookOptions, SetWebhookOptions {
  /** start a local node `http` server on this port. omit to only set the webhook + return the callback */
  port?: number
  /** host to bind the local server to. defaults to `0.0.0.0` */
  host?: string
  /** path the listener responds to. all other paths get 404. defaults to `/` */
  path?: string
}

export interface StartWebhookResult {
  /** node `http` server, present only when `port` was passed */
  server: Server | undefined
  /** the underlying webhook callback — useful when no listener was started */
  callback: NodeWebhookCallback
  /** stops the listener (if any). does not call `deleteWebhook` */
  stop: () => Promise<void>
}

export async function startWebhookListener (
  tg: Telegram,
  options: StartWebhookOptions
) {
  await setWebhook(tg, {
    url: options.url,
    ...(options.certificate !== undefined && { certificate: options.certificate }),
    ...(options.ipAddress !== undefined && { ipAddress: options.ipAddress }),
    ...(options.maxConnections !== undefined && { maxConnections: options.maxConnections }),
    ...(options.allowedUpdates !== undefined && { allowedUpdates: options.allowedUpdates }),
    ...(options.dropPendingUpdates !== undefined && { dropPendingUpdates: options.dropPendingUpdates }),
    ...(options.secretToken !== undefined && { secretToken: options.secretToken })
  })

  const callback = tg.getWebhookCallback({
    ...(options.secretToken !== undefined && { secretToken: options.secretToken }),
    ...(options.webhookReply !== undefined && { webhookReply: options.webhookReply }),
    ...(options.timeoutMilliseconds !== undefined && { timeoutMilliseconds: options.timeoutMilliseconds })
  })

  if (options.port === undefined) {
    return {
      server: undefined,
      callback,
      stop: () => Promise.resolve()
    }
  }

  const expectedPath = options.path ?? '/'
  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    if (req.url !== expectedPath && req.url !== expectedPath + '/') {
      res.writeHead(404)
      res.end()

      return
    }

    callback(req, res).catch(() => {
      try {
        res.writeHead(500)
        res.end()
      } catch { /* ignore — response may already be sent */ }
    })
  })

  await new Promise<void>((resolve, reject) => {
    const onError = (error: Error) => {
      server.off('listening', onListening)
      reject(error)
    }
    const onListening = () => {
      server.off('error', onError)
      resolve()
    }

    server.once('error', onError)
    server.once('listening', onListening)
    server.listen(options.port, options.host ?? '0.0.0.0')
  })

  return {
    server,
    callback,
    stop: () => new Promise<void>((resolve, reject) => {
      server.close((error?: Error) => {
        if (error) {
          reject(error)

          return
        }

        resolve()
      })
    })
  }
}
