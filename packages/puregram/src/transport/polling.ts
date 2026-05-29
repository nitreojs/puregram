import type { TelegramUpdate } from '@puregram/api'

import { createDebug } from '../debug'
import { ApiError } from '../errors'
import type { Telegram } from '../telegram'

const debug = createDebug('puregram:polling')

export interface StartPollingOptions {
  offset?: number
  timeout?: number
  dropPendingUpdates?: boolean | string[]
  allowedUpdates?: string[]
  /**
   * cap the number of update dispatches that run in parallel. when the cap is
   * reached, the next update waits for a slot. defaults to `Infinity`
   * (unbounded — preserves existing behavior)
   */
  concurrency?: number
  /**
   * return a key for a given raw update to serialize dispatch per-key. updates
   * sharing a key run in FIFO order; updates with different keys still run in
   * parallel (subject to `concurrency`). `undefined`/empty key opts out
   *
   * @example
   * ```ts
   * sequentializeBy: (raw) =>
   *   String(raw.message?.chat.id ?? raw.callback_query?.message?.chat.id ?? '')
   * ```
   */
  sequentializeBy?: (raw: TelegramUpdate) => string | undefined
}

export interface PollingDeps {
  tg: Telegram
  buildAndDispatch: (rawUpdate: Record<string, unknown>) => Promise<void>
  trackInFlight: (p: Promise<void>) => void
  onError: (error: Error, rawUpdate: Record<string, unknown>) => void
}

interface KeyQueue {
  /** tail of the per-key dispatch chain — next dispatch awaits this before running */
  tail: Promise<void>
  /** number of in-flight + pending dispatches sharing the key; queue is dropped at 0 */
  pending: number
}

export class PollingTransport {
  private offset = 0
  private retries = 0
  private isStarted = false

  private slots = Infinity
  private slotsInitialized = false
  private readonly waiters: (() => void)[] = []
  private readonly keyQueues = new Map<string, KeyQueue>()

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

    // run the loop in the background — startPolling resolves once polling has started so
    // callers can keep going (the loop's own try/catch handles retries + fatal stops)
    this.loop(options).catch((error) => {
      debug('loop crashed: %O', error)
    })
  }

  stop () {
    this.isStarted = false
    this.retries = 0
    this.slotsInitialized = false
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
        debug('retry %d: %s', this.retries, error instanceof Error ? error.message : error)
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

    if (!this.slotsInitialized) {
      this.slots = options.concurrency ?? Infinity
      this.slotsInitialized = true
    }

    // dispatch each update without awaiting — keeping this serial deadlocks any handler that
    // awaits a future update (e.g. tg.flow.waitFor / prompt called mid-handler). middleware onion
    // semantics still hold per-dispatch; only the cross-update ordering is relaxed
    for (const update of updates) {
      this.offset = update.update_id + 1

      const raw = update as unknown as Record<string, unknown>
      const key = options.sequentializeBy?.(update)
      const promise = this.scheduleDispatch(raw, options, key)

      this.deps.trackInFlight(promise)
    }

    this.retries = 0
  }

  private scheduleDispatch (
    raw: Record<string, unknown>,
    options: StartPollingOptions,
    key: string | undefined
  ) {
    if (key !== undefined && key !== '') {
      const queue = this.keyQueues.get(key)
      const previous = queue?.tail ?? Promise.resolve()
      const pendingBefore = queue?.pending ?? 0

      const chained = previous.then(() => this.runDispatch(raw, options))
      const next: KeyQueue = { tail: chained, pending: pendingBefore + 1 }

      this.keyQueues.set(key, next)

      const cleanup = chained.finally(() => {
        const current = this.keyQueues.get(key)

        if (current === undefined) {
          return
        }

        current.pending -= 1

        if (current.pending <= 0) {
          this.keyQueues.delete(key)
        }
      })

      // swallow on cleanup chain — actual error reporting happens inside runDispatch
      return cleanup.catch(() => {})
    }

    return this.runDispatch(raw, options)
  }

  private async runDispatch (raw: Record<string, unknown>, options: StartPollingOptions) {
    const cap = options.concurrency ?? Infinity

    if (cap !== Infinity) {
      await this.acquireSlot()
    }

    try {
      await this.deps.buildAndDispatch(raw)
    } catch (error) {
      debug('handler threw: %O', error)
      this.deps.onError(error as Error, raw)
    } finally {
      if (cap !== Infinity) {
        this.releaseSlot()
      }
    }
  }

  private acquireSlot () {
    if (this.slots > 0) {
      this.slots -= 1

      return Promise.resolve()
    }

    return new Promise<void>((resolve) => {
      this.waiters.push(resolve)
    })
  }

  private releaseSlot () {
    const next = this.waiters.shift()

    if (next !== undefined) {
      next()

      return
    }

    this.slots += 1
  }
}
