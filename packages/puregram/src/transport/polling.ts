import { createDebug } from '../debug'
import { ApiError } from '../errors'
import type { Telegram } from '../telegram'

const debug = createDebug('puregram:polling')

export interface StartPollingOptions {
  offset?: number
  timeout?: number
  dropPendingUpdates?: boolean | string[]
  allowedUpdates?: string[]
}

export interface PollingDeps {
  tg: Telegram
  buildAndDispatch: (rawUpdate: Record<string, unknown>) => Promise<void>
}

export class PollingTransport {
  private offset = 0
  private retries = 0
  private isStarted = false

  constructor (private readonly deps: PollingDeps) {}

  async start (options: StartPollingOptions = {}) {
    if (this.isStarted) {
      throw new Error('polling already started')
    }

    if (!this.deps.tg.options.token) {
      throw new TypeError('token not set')
    }

    if (options.dropPendingUpdates) {
      await this.drop(options.dropPendingUpdates)
    }

    this.isStarted = true
    await this.loop(options)
  }

  stop () {
    this.isStarted = false
    this.retries = 0
  }

  async drop (value: boolean | string[] = true) {
    let offset = 0
    let count = 0
    const allowed = Array.isArray(value) ? value : []

    while (true) {
      const updates = await this.deps.tg.api.getUpdates({ offset, allowed_updates: allowed })

      if (!updates || updates.length === 0) {
        break
      }

      count += updates.length
      const last = updates[updates.length - 1]

      if (last) {
        offset = last.update_id + 1
      }
    }

    return count
  }

  private async loop (options: StartPollingOptions) {
    while (this.isStarted) {
      try {
        await this.tick(options)
      } catch (error) {
        if (error instanceof ApiError && error.code === 409) {
          if (this.deps.tg.options.apiRetryLimit !== -1) {
            debug('409 — another bot is using getUpdates; stopping')
            this.stop()

            return
          }
        }

        if (this.deps.tg.options.apiRetryLimit !== -1 && this.retries >= this.deps.tg.options.apiRetryLimit) {
          debug('exhausted retries')
          this.stop()

          return
        }

        this.retries += 1
        debug('retry %d', this.retries)
        await new Promise(resolve => setTimeout(resolve, this.deps.tg.options.apiWait))
      }
    }
  }

  private async tick (options: StartPollingOptions) {
    const params: Record<string, unknown> = {
      timeout: options.timeout ?? 15,
      allowed_updates: options.allowedUpdates ?? this.deps.tg.options.allowedUpdates
    }

    if (this.offset) {
      params.offset = this.offset
    }

    if (options.offset !== undefined) {
      params.offset = options.offset
    }

    const updates = await this.deps.tg.api.getUpdates(params)

    if (!updates || updates.length === 0) {
      return
    }

    // dispatch each update without awaiting — keeping this serial deadlocks any handler that
    // awaits a future update (e.g. tg.flow.waitFor / prompt called mid-handler). middleware onion
    // semantics still hold per-dispatch; only the cross-update ordering is relaxed.
    for (const update of updates) {
      this.offset = update.update_id + 1

      this.deps.buildAndDispatch(update as unknown as Record<string, unknown>)
        .catch(error => {
          debug('handler threw: %O', error)
        })
    }

    this.retries = 0
  }
}
