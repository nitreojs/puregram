import type { TelegramShortcuts, TelegramUser, UpdateKind, UpdateKindMap } from '@puregram/api'

import { runRequest } from './api/lifecycle'
import type { TelegramApi } from './api/proxy'
import { createApiProxy } from './api/proxy'
import { installShortcuts } from './api/shortcuts'
import { CustomUpdateRegistry } from './dispatch/custom-updates'
import type { Middleware, ErrorHandler, HookOptions, RequestHookName } from './dispatch/hooks'
import { HookRegistry } from './dispatch/hooks'
import type { UpdateHandler } from './dispatch/on'
import { Dispatcher } from './dispatch/on'
import { buildUpdate } from './dispatch/update-builder'
import type { ApiResponseError } from './errors'
import type { HttpClient } from './http/client'
import { defaultHttpClient } from './http/client'
import type { TelegramOptions, ResolvedTelegramOptions } from './options'
import { resolveOptions } from './options'
import { resolveInstallOrder } from './plugins/installer'
import type { Plugin } from './plugins/plugin'
import { PluginRegistry } from './plugins/registry'
import { PollingTransport, type StartPollingOptions } from './transport/polling'
import { createWebhookCallback } from './transport/webhook'

/* eslint-disable @typescript-eslint/no-empty-interface, @typescript-eslint/no-unused-vars */
export interface Telegram<Ext = unknown> extends TelegramShortcuts {}
/* eslint-enable @typescript-eslint/no-empty-interface, @typescript-eslint/no-unused-vars */

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class Telegram<Ext = unknown> {
  readonly options: ResolvedTelegramOptions
  readonly api: TelegramApi

  /** populated by startPolling on first getMe call */
  bot!: TelegramUser

  protected readonly hooks = new HookRegistry()
  protected readonly dispatcher = new Dispatcher()
  protected readonly customUpdates = new CustomUpdateRegistry()
  protected readonly plugins = new PluginRegistry()
  protected readonly pendingPlugins: Plugin[] = []
  protected readonly httpClient: HttpClient
  protected polling: PollingTransport | undefined

  protected started = false

  constructor (input: TelegramOptions) {
    this.options = resolveOptions(input)
    this.httpClient = this.options.httpClient ?? defaultHttpClient
    this.api = createApiProxy((method, params) => runRequest(
      { options: this.options, hooks: this.hooks, httpClient: this.httpClient },
      method,
      params
    ))

    if (this.options.bot) {
      this.bot = this.options.bot
    }

    installShortcuts(this as Telegram)
  }

  static fromToken (token: string, options: Partial<TelegramOptions> = {}) {
    return new Telegram({ token, ...options })
  }

  // eslint-disable-next-line local-rules/no-redundant-return-type -- type predicate is needed for narrowing
  static isErrorResponse (value: unknown): value is ApiResponseError {
    return typeof value === 'object' && value !== null &&
      'ok' in value && (value as { ok: unknown }).ok === false &&
      'error_code' in value
  }

  extend<N extends string, Ext2> (
    plugin: Plugin<N, Ext2>
  ): Telegram<Ext & { [K in N]: Awaited<Ext2> }> & Ext & { [K in N]: Awaited<Ext2> } {
    if (this.started) {
      throw new Error('cannot extend after .start() — plugins must be queued before start')
    }

    this.pendingPlugins.push(plugin as Plugin)

    return this as unknown as
      Telegram<Ext & { [K in N]: Awaited<Ext2> }> & Ext & { [K in N]: Awaited<Ext2> }
  }

  has (pluginName: string): boolean {
    return this.plugins.has(pluginName)
  }

  async start () {
    if (this.started) {
      return
    }

    const order = resolveInstallOrder(this.pendingPlugins)

    for (const plugin of order) {
      const ext = await plugin.install(this)

      this.plugins.set(plugin.name, ext)
      Object.defineProperty(this, plugin.name, {
        value: ext, enumerable: true, configurable: false
      })
    }

    if (!this.bot) {
      this.bot = await this.api.getMe()
    }

    await this.hooks.run('onInit', { tg: this })
    this.started = true
  }

  async shutdown () {
    if (!this.started) {
      return
    }

    await this.hooks.run('onShutdown', { tg: this })
    this.started = false
  }

  /**
   * register a handler for one or more update kinds.
   *
   * handlers compose middleware-style: each handler receives `(update, next)`. calling
   * `next()` lets the next registered handler run, returning without calling `next()`
   * halts the chain. order of registration is order of execution.
   *
   * @example
   * tg.on('message', async (message, next) => {
   *   console.log('[message]', message.text)
   *   await next()  // pass through to subsequent handlers
   * })
   *
   * tg.on('message', async (message) => {
   *   if (message.text !== '/cmd') return  // ← chain stops here, no further handlers run
   *   await message.send('hi')
   * })
   */
  on<K extends UpdateKind> (kind: K, handler: UpdateHandler<UpdateKindMap[K]>): this
  on<K extends UpdateKind> (kinds: readonly K[], handler: UpdateHandler<UpdateKindMap[K]>): this
  on<K extends UpdateKind> (
    kindOrKinds: K | readonly K[],
    handler: UpdateHandler<UpdateKindMap[K]>
  ): this {
    const kinds: readonly K[] = Array.isArray(kindOrKinds)
      ? (kindOrKinds as readonly K[])
      : [kindOrKinds as K]

    for (const kind of kinds) {
      this.dispatcher.on(kind, handler as UpdateHandler)
    }

    return this
  }

  /**
   * register a handler that fires when a `message` update's text matches `/<name>`,
   * `/<name> <args>`, or `/<name>@<bot>` (group mention form). non-matching messages
   * are passed through to the next handler via `next()`. matching messages run the
   * handler and stop the chain unless the handler itself calls `next()`.
   *
   * @example
   * tg.command('start', async (message) => {
   *   await message.send('hello')
   * })
   */
  command (
    name: string,
    handler: UpdateHandler<UpdateKindMap['message']>
  ) {
    const prefix = `/${name}`

    return this.on('message', async (message, next) => {
      const text = message.raw.text

      if (typeof text !== 'string') {
        await next()

        return
      }

      const matched = text === prefix ||
        text.startsWith(`${prefix} `) ||
        text.startsWith(`${prefix}@`) ||
        text.startsWith(`${prefix}\n`)

      if (!matched) {
        await next()

        return
      }

      await handler(message, next)
    })
  }

  off (kind: string, handler: UpdateHandler): this {
    this.dispatcher.off(kind, handler)

    return this
  }

  useHook (name: RequestHookName | 'onUpdate', fn: Middleware<unknown>, options?: HookOptions): this
  useHook (name: 'onInit' | 'onShutdown', fn: Middleware<{ tg: unknown }>): this
  useHook (name: 'onError', fn: ErrorHandler): this
  /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
  useHook (name: string, fn: any, options?: HookOptions): this {
    this.hooks.add(name as never, fn, options)

    return this
  }
  /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */

  /**
   * register a dispatch middleware
   *
   * shorthand for `useHook('onUpdate', fn, options)`. defaults to `'normal'` priority,
   * which runs before `tg.on(...)` handlers and after `'high'` middleware like waitFor/session
   *
   * @example
   * tg.use(async (update, next) => {
   *   const start = Date.now()
   *   await next()
   *   console.log(`update took ${Date.now() - start}ms`)
   * })
   */
  use (fn: Middleware<unknown>, options?: HookOptions) {
    return this.useHook('onUpdate', fn, options)
  }

  defineUpdate<N extends string> (kind: N) {
    this.customUpdates.define(kind)

    return this
  }

  emit (kind: string, payload: Record<string, unknown>) {
    const update = this.customUpdates.build(kind, payload)

    this.dispatch(update).catch(() => undefined)
  }

  async startPolling (options: StartPollingOptions = {}) {
    await this.start()

    this.polling ??= new PollingTransport({
      tg: this as Telegram,
      buildAndDispatch: async (rawUpdate) => {
        const update = buildUpdate(rawUpdate, this) as { kind: string }

        await this.dispatch(update)
      }
    })

    await this.polling.start(options)
  }

  stopPolling () {
    this.polling?.stop()
  }

  getWebhookCallback (secret?: string) {
    return createWebhookCallback({
      buildAndDispatch: async (rawUpdate) => {
        const update = buildUpdate(rawUpdate, this) as { kind: string }

        await this.dispatch(update)
      }
    }, secret)
  }

  async dropPendingUpdates (value?: boolean | string[]) {
    this.polling ??= new PollingTransport({
      tg: this as Telegram,
      buildAndDispatch: async () => {}
    })

    return this.polling.drop(value)
  }

  protected async dispatch (update: { kind: string }) {
    await this.hooks.runUpdate(update, async (_, next) => {
      await this.dispatcher.runUserHandlers(update)
      await next()
    })
  }
}
