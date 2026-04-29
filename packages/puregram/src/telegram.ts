import type { TelegramShortcuts, TelegramUser, UpdateKind, UpdateKindMap } from '@puregram/api'

import { runRequest } from './api/lifecycle'
import type { TelegramApi } from './api/proxy'
import { createApiProxy } from './api/proxy'
import { installShortcuts } from './api/shortcuts'
import { createDebug } from './debug'
import { attach } from './dispatch/attach'
import { CustomUpdateRegistry } from './dispatch/custom-updates'
import type {
  DispatchErrorHandler,
  ErrorHandler,
  HookOptions,
  Middleware,
  RequestHookName
} from './dispatch/hooks'
import { HookRegistry } from './dispatch/hooks'
import type { AnyUpdate, OnOptions, UpdateHandler, UpdatePredicate } from './dispatch/on'
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

const dispatchDebug = createDebug('puregram:dispatch')

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
   * register a handler against a kind, a list of kinds, or an arbitrary predicate
   *
   * handlers compose middleware-style: each handler receives `(update, next)`. calling
   * `next()` lets the next registered handler run, returning without calling `next()`
   * halts the chain. order of registration is order of execution within a priority group;
   * groups dispatch `'high'` → `'normal'` → `'low'` (default `'normal'`)
   *
   * the predicate form runs against every update; type-guard predicates (`(u): u is T`)
   * narrow the handler argument automatically. predicates must be synchronous; predicate
   * throws are routed through `onDispatchError` and halt the chain
   *
   * @example
   * tg.on('message', async (message, next) => {
   *   console.log('[message]', message.text)
   *   await next()
   * })
   *
   * tg.on('message', async (message) => {
   *   if (message.text !== '/cmd') return
   *   await message.send('hi')
   * })
   *
   * tg.on(
   *   (update): update is MessageUpdate => update.is('message') && update.hasText(),
   *   (message) => message.send(`echo: ${message.text}`)
   * )
   *
   * tg.on('message', logRequest, { priority: 'high' })
   */
  on<K extends UpdateKind> (
    kind: K,
    handler: UpdateHandler<UpdateKindMap[K]>,
    options?: OnOptions
  ): this

  on<K extends UpdateKind> (
    kinds: readonly K[],
    handler: UpdateHandler<UpdateKindMap[K]>,
    options?: OnOptions
  ): this

  on<T extends AnyUpdate> (
    predicate: (update: AnyUpdate) => update is T,
    handler: UpdateHandler<T>,
    options?: OnOptions
  ): this

  on (
    predicate: (update: AnyUpdate) => boolean,
    handler: UpdateHandler<AnyUpdate>,
    options?: OnOptions
  ): this

  on (
    first: string | readonly string[] | UpdatePredicate,
    handler: UpdateHandler<never>,
    options: OnOptions = {}
  ): this {
    const priority = options.priority ?? 'normal'
    const fn = handler as UpdateHandler

    if (typeof first === 'function') {
      this.dispatcher.add({ type: 'predicate', predicate: first, handler: fn, priority })

      return this
    }

    const kinds: readonly string[] = Array.isArray(first) ? first : [first as string]

    for (const kind of kinds) {
      this.dispatcher.on(kind, fn, priority)
    }

    return this
  }

  /**
   * register a regex-matched message handler
   *
   * - string form — `tg.command('hello', …)` matches `/hello`, `/hello arg`,
   *   `/hello@bot`, or a `/hello`-prefixed line break (Telegram command conventions)
   * - regex form — `tg.command(/^\/h(?:e|i)/, …)` runs against `message.text` directly
   *
   * non-matching messages call `next()` so the chain continues. matching messages get
   * a `match: RegExpMatchArray` attached to the update before the handler runs, so
   * `message.match.groups?.foo` works for named-capture regexes
   *
   * @example
   * tg.command(/^\/say(?:\s+(?<text>.+))?$/i, async (message) => {
   *   await message.send(message.match?.groups?.text ?? 'silence')
   * })
   */
  command (name: string, handler: UpdateHandler<UpdateKindMap['message']>): this
  command (pattern: RegExp, handler: UpdateHandler<UpdateKindMap['message']>): this
  command (
    nameOrPattern: string | RegExp,
    handler: UpdateHandler<UpdateKindMap['message']>
  ): this {
    const pattern = typeof nameOrPattern === 'string'
      ? buildCommandPattern(nameOrPattern)
      : nameOrPattern
    const isStringForm = typeof nameOrPattern === 'string'

    return this.on('message', async (message, next) => {
      const text = message.raw.text

      if (typeof text !== 'string') {
        await next()

        return
      }

      const result = pattern.exec(text)

      if (result === null) {
        await next()

        return
      }

      // string form auto-validates the `@botname` suffix when present:
      //   /cmd          → match (for this bot)
      //   /cmd@us       → match (explicitly addressed to this bot)
      //   /cmd@them     → skip, the command is for a different bot in the same group
      // regex form leaves @-validation to the caller's pattern
      if (isStringForm) {
        const mentioned = result.groups?.mention

        if (mentioned !== undefined) {
          const ourUsername = this.bot?.username

          if (ourUsername === undefined || mentioned.toLowerCase() !== ourUsername.toLowerCase()) {
            await next()

            return
          }
        }
      }

      attach(message, 'match', result)
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
  useHook (name: 'onDispatchError', fn: DispatchErrorHandler): this
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

    this.dispatch(update).catch((error) => {
      this.reportDispatchError(error as Error, payload)
    })
  }

  async startPolling (options: StartPollingOptions = {}) {
    await this.start()

    this.polling ??= new PollingTransport({
      tg: this as Telegram,
      buildAndDispatch: async (rawUpdate) => {
        const update = buildUpdate(rawUpdate, this) as AnyUpdate

        await this.dispatch(update)
      },
      onError: (error, raw) => {
        this.reportDispatchError(error, raw)
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
        const update = buildUpdate(rawUpdate, this) as AnyUpdate

        await this.dispatch(update)
      },
      onError: (error, raw) => {
        this.reportDispatchError(error, raw)
      }
    }, secret)
  }

  async dropPendingUpdates (value?: boolean | string[]) {
    this.polling ??= new PollingTransport({
      tg: this as Telegram,
      buildAndDispatch: async () => {},
      onError: (error, raw) => {
        this.reportDispatchError(error, raw)
      }
    })

    return this.polling.drop(value)
  }

  protected async dispatch (update: AnyUpdate) {
    await this.hooks.runUpdate(update, async (_, next) => {
      await this.dispatcher.runUserHandlers(update)
      await next()
    })
  }

  // funnel for dispatch errors. runs registered onDispatchError handlers; when
  // none are registered, logs via debug and rethrows on a microtask so node's
  // default uncaughtException semantics kick in (matches v2 loud-by-default)
  private reportDispatchError (error: Error, raw: Record<string, unknown>) {
    this.hooks.runDispatchError(error, { raw })
      .then((handled) => {
        if (!handled) {
          dispatchDebug('handler threw: %O', error)
          rethrowAsync(error)
        }
      })
      .catch((handlerError: unknown) => {
        rethrowAsync(handlerError as Error)
      })
  }
}

function rethrowAsync (error: Error) {
  queueMicrotask(() => {
    throw error
  })
}

// build the canonical telegram command regex for a string-form `tg.command(name, …)`
// matches `/<name>`, `/<name> args`, `/<name>@bot args`, or `/<name>\nstuff`
// the optional `mention` named group captures the `@bot` suffix so the command
// dispatcher can filter out commands addressed to a different bot in the same chat
// case-insensitive because telegram clients sometimes uppercase commands sent via auto-complete
function buildCommandPattern (name: string) {
  return new RegExp(`^/${escapeRegExp(name)}(?:@(?<mention>\\S+))?(?:[\\s\\n]|$)`, 'i')
}

function escapeRegExp (s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// `match` is populated by the value/regex variants of the content/callback/inline
// filter families and by `tg.command(...)`. surfaced via declaration merging so
// userland handlers can read `update.match?.groups?.foo` without explicit casts
declare module '@puregram/api' {
  interface MessageUpdate {
    match?: RegExpMatchArray
  }

  interface EditedMessageUpdate {
    match?: RegExpMatchArray
  }

  interface ChannelPostUpdate {
    match?: RegExpMatchArray
  }

  interface EditedChannelPostUpdate {
    match?: RegExpMatchArray
  }

  interface BusinessMessageUpdate {
    match?: RegExpMatchArray
  }

  interface EditedBusinessMessageUpdate {
    match?: RegExpMatchArray
  }

  interface CallbackQueryUpdate {
    match?: RegExpMatchArray
  }

  interface InlineQueryUpdate {
    match?: RegExpMatchArray
  }

  interface ChosenInlineResultUpdate {
    match?: RegExpMatchArray
  }
}
