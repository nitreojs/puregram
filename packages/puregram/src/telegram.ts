import type {
  CallbackQueryUpdate,
  Filter,
  MessageUpdate,
  TelegramDispatchers,
  TelegramShortcuts,
  TelegramUser
} from '@puregram/api'
import { and, defineFilter, isFilter } from '@puregram/api'

import type { DownloadTarget } from './api/download'
import {
  download as downloadHelper,
  downloadIterable as downloadIterableHelper,
  downloadStream as downloadStreamHelper,
  downloadToFile as downloadToFileHelper,
  getFileURL as getFileURLHelper
} from './api/download'
import { runRequest } from './api/lifecycle'
import type { TelegramApi } from './api/proxy'
import { createApiProxy } from './api/proxy'
import { installShortcuts, type ManualShortcuts } from './api/shortcuts'
import { createDebug } from './debug'
import { CustomUpdateRegistry } from './dispatch/custom-updates'
import type {
  DispatchErrorHandler,
  ErrorHandler,
  HookOptions,
  Middleware,
  RequestContext,
  RequestHookName
} from './dispatch/hooks'
import { HookRegistry } from './dispatch/hooks'
import { installDispatchers } from './dispatch/install-dispatchers'
import type { AnyUpdate, OnOptions, UpdateHandler, UpdatePredicate } from './dispatch/on'
import { Dispatcher } from './dispatch/on'
import { buildUpdate } from './dispatch/update-builder'
import type { ApiResponseError } from './errors'
import { callbackData as callbackQueryFilter } from './filters/callback'
import { command as commandFilter } from './filters/content'
import { when } from './filters/when'
import type { HttpClient } from './http/client'
import { defaultHttpClient } from './http/client'
import type { TelegramOptions, ResolvedTelegramOptions } from './options'
import { resolveOptions } from './options'
import { resolveInstallOrder } from './plugins/installer'
import type { Plugin } from './plugins/plugin'
import { PluginRegistry } from './plugins/registry'
import { PollingTransport, type StartPollingOptions } from './transport/polling'
import type { WebhookOptions } from './transport/webhook'
import { createHandler as createWebhookHandler, nodeAdapter, resolveWebhookOptions } from './transport/webhook'
import {
  deleteWebhook as deleteWebhookHelper,
  type DeleteWebhookOptions,
  getWebhookInfo as getWebhookInfoHelper,
  setWebhook as setWebhookHelper,
  type SetWebhookOptions
} from './transport/webhook/helpers'
import { startWebhookListener, type StartWebhookOptions } from './transport/webhook/listener'

const dispatchDebug = createDebug('puregram:dispatch')

/* eslint-disable @typescript-eslint/no-empty-interface, @typescript-eslint/no-unused-vars */
export interface Telegram<Ext = unknown> extends TelegramShortcuts, TelegramDispatchers, ManualShortcuts {}
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
  protected readonly rawUpdateHandlers: ((raw: Record<string, unknown>) => void | Promise<void>)[] = []
  protected readonly httpClient: HttpClient
  protected readonly inFlight = new Set<Promise<void>>()
  protected readonly cleanups: (() => Promise<void>)[] = []
  protected polling: PollingTransport | undefined

  protected started = false
  protected startPromise: Promise<void> | undefined

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
    installDispatchers(this, this.dispatcher)
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

    // coalesce concurrent boots (webhook adapters fire start() per request);
    // clear the slot on failure so a later call can retry — one bad getMe shouldn't brick the bot
    if (this.startPromise === undefined) {
      this.startPromise = this.bootstrap().catch((error: unknown) => {
        this.startPromise = undefined

        throw error
      })
    }

    await this.startPromise
  }

  async shutdown () {
    if (!this.started && this.cleanups.length === 0) {
      return
    }

    this.polling?.stop()

    for (const cleanup of this.cleanups.splice(0)) {
      try {
        await cleanup()
      } catch (error) {
        dispatchDebug('cleanup threw during shutdown: %O', error)
      }
    }

    await this.hooks.run('onShutdown', { tg: this })
    await this.drainInFlight()
    this.started = false
    this.startPromise = undefined
  }

  /** register a cleanup callback to run on `shutdown()`. userland can hook teardown onto the bot's lifecycle */
  registerCleanup (fn: () => Promise<void>) {
    this.cleanups.push(fn)
  }

  /**
   * register a cross-kind handler — fires for every supported update. the bare form
   * receives `AnyUpdate`; the filter form narrows via `Modify<AnyUpdate, Mod>`. use
   * this for multi-kind handlers or custom predicates that don't fit per-kind dispatchers
   *
   * @example
   * ```ts
   * tg.onUpdate((update) => console.log('[any]', update.kind))
   *
   * tg.onUpdate(
   *   (u): u is MessageUpdate => u.is('message') && u.hasText(),
   *   (m) => m.send(`echo: ${m.text}`)
   * )
   * ```
   */
  onUpdate (handler: UpdateHandler<AnyUpdate>, options?: OnOptions): this

  onUpdate<Base, Mod> (
    filter: Filter<Base, Mod>,
    handler: UpdateHandler<Base & Mod>,
    options?: OnOptions
  ): this

  onUpdate<T extends AnyUpdate> (
    predicate: (update: AnyUpdate) => update is T,
    handler: UpdateHandler<T>,
    options?: OnOptions
  ): this

  onUpdate (
    predicate: (update: AnyUpdate) => boolean | Promise<boolean>,
    handler: UpdateHandler<AnyUpdate>,
    options?: OnOptions
  ): this

  onUpdate (
    first: UpdateHandler<AnyUpdate> | UpdatePredicate,
    secondOrOptions?: UpdateHandler<AnyUpdate> | OnOptions,
    maybeOptions?: OnOptions
  ): this {
    if (typeof secondOrOptions === 'function') {
      const predicate = first as UpdatePredicate
      const handler = secondOrOptions
      const priority = maybeOptions?.priority ?? 'normal'

      this.dispatcher.add({
        type: 'predicate',
        predicate,
        handler: handler as UpdateHandler,
        priority
      })

      return this
    }

    const handler = first
    const priority = secondOrOptions?.priority ?? 'normal'

    this.dispatcher.add({
      type: 'predicate',
      predicate: () => true,
      handler: handler as UpdateHandler,
      priority
    })

    return this
  }

  /**
   * register a raw-update handler — fires before kind discrimination, so it sees
   * even unknown kinds that landed in bot-api ahead of our schema regen. handler
   * arg is the raw payload from polling/webhook. handy for forward-compat logging
   * or ingestion pipelines that want every update before wrapper allocation
   */
  onRawUpdate (handler: (raw: Record<string, unknown>) => void | Promise<void>) {
    this.rawUpdateHandlers.push(handler)

    return this
  }

  /**
   * register a command handler. string form matches `/hello`, `/hello arg`,
   * `/hello@bot`, or `/hello`-prefixed line break (Telegram conventions); regex form
   * runs against `message.text` directly. non-matching messages call `next()`.
   * matching messages get `match: RegExpMatchArray` attached for named captures
   *
   * @example
   * ```ts
   * tg.command(/^\/say(?:\s+(?<text>.+))?$/i, async (m) => {
   *   await m.send(m.match?.groups?.text ?? 'silence')
   * })
   * ```
   */
  command (
    nameOrPattern: string | RegExp,
    handler: UpdateHandler<MessageUpdate & { match?: RegExpMatchArray }>
  ) {
    // string form layers in a `@botname` mention check; regex form leaves @-validation to the caller
    const filter = typeof nameOrPattern === 'string'
      ? and(commandFilter(nameOrPattern), botMentionFilter(this))
      : commandFilter(nameOrPattern)

    return this.onMessage(filter, handler as never)
  }

  /**
   * register a handler against callback queries with matching data. string form is
   * equality on `update.raw.data`; regex form attaches `match: RegExpMatchArray` on success.
   * shorthand for `tg.onCallbackQuery(callbackData(value), handler)`
   *
   * @example
   * ```ts
   * tg.callbackQuery(/^buy:(?<sku>.+)$/, async (q) => {
   *   await q.answer({ text: `bought ${q.match?.groups?.sku}` })
   * })
   * ```
   */
  callbackQuery (
    value: string | RegExp,
    handler: UpdateHandler<CallbackQueryUpdate & { match?: RegExpMatchArray }>
  ) {
    const filter = typeof value === 'string'
      ? callbackQueryFilter(value)
      : callbackQueryFilter(value)

    return this.onCallbackQuery(filter, handler as never)
  }

  off (kind: string, handler: UpdateHandler): this {
    this.dispatcher.off(kind, handler)

    return this
  }

  useHook (name: RequestHookName, fn: Middleware<RequestContext>, options?: HookOptions): this
  useHook (name: 'onUpdate', fn: Middleware<unknown>, options?: HookOptions): this
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
   * register a dispatch middleware — shorthand for `useHook('onUpdate', fn, options)`.
   * default priority `'normal'` runs before `tg.on(...)` handlers and after `'high'` middleware
   * (waitFor/session). the 2-arg form gates on a `Filter` (equivalent to `when(filter, mw)`)
   * and benefits from the same `kinds` fast-path as `tg.on(filter, …)`
   *
   * @example
   * ```ts
   * tg.use(async (update, next) => {
   *   const start = Date.now()
   *   await next()
   *   console.log(`update took ${Date.now() - start}ms`)
   * })
   *
   * tg.use(f.chat.private, async (u, next) => {
   *   console.log('[private]', u.kind)
   *   await next()
   * }, { priority: 'high' })
   * ```
   */
  use (fn: Middleware<unknown>, options?: HookOptions): this
  use<Base, Mod> (
    filter: Filter<Base, Mod>,
    mw: Middleware<Base & Mod>,
    options?: HookOptions
  ): this

  use (
    filterOrMw: Filter | Middleware<unknown>,
    mwOrOptions?: Middleware<unknown> | HookOptions,
    maybeOptions?: HookOptions
  ): this {
    if (isFilter(filterOrMw)) {
      const mw = mwOrOptions as Middleware<unknown>

      return this.useHook('onUpdate', when(filterOrMw, mw), maybeOptions)
    }

    return this.useHook('onUpdate', filterOrMw, mwOrOptions as HookOptions | undefined)
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
      buildAndDispatch: rawUpdate => this.handleIncoming(rawUpdate),
      trackInFlight: (p) => {
        this.trackInFlight(p)
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

  /**
   * framework-agnostic webhook handler consumed by `puregram/webhook/<framework>`
   * adapters. for raw `node:http` use `getWebhookCallback`
   */
  webhookHandler (options: WebhookOptions = {}) {
    return createWebhookHandler(resolveWebhookOptions(options), {
      dispatch: raw => this.handleIncoming(raw),
      trackInFlight: (p) => {
        this.trackInFlight(p)
      },
      ensureStarted: () => this.start(),
      reportError: (error, raw) => {
        this.reportDispatchError(error, raw)
      }
    })
  }

  /**
   * node `http`/`https` callback. for express/koa/fastify/hono/h3/elysia,
   * import the matching adapter from `puregram/webhook/<framework>`
   */
  getWebhookCallback (options: WebhookOptions = {}) {
    return nodeAdapter(this.webhookHandler(options), {
      ...(options.maxBodyBytes !== undefined && { maxBodyBytes: options.maxBodyBytes })
    })
  }

  /**
   * one-shot — starts the bot, calls `setWebhook`, and (when `port` is given)
   * spins up a built-in node `http` listener. `secretToken` is used both to
   * register the webhook and to validate incoming requests
   */
  async startWebhook (options: StartWebhookOptions) {
    await this.start()

    const startup = await startWebhookListener(this as Telegram, options)

    if (startup.server !== undefined) {
      this.registerCleanup(startup.stop)
    }

    return startup
  }

  async setWebhook (options: SetWebhookOptions) {
    return setWebhookHelper(this as Telegram, options)
  }

  async deleteWebhook (options: DeleteWebhookOptions = {}) {
    return deleteWebhookHelper(this as Telegram, options)
  }

  async getWebhookInfo () {
    return getWebhookInfoHelper(this as Telegram)
  }

  /**
   * download a telegram file into a `Buffer`. accepts a raw `file_id`, any
   * `MediaSource.fileId(...)`, any wrapper or raw payload, plus `Photo` /
   * `TelegramPhotoSize[]` (largest auto-picked). other upload variants throw `TypeError`
   *
   * @example
   * ```ts
   * const bytes = await tg.download(update.document)
   * ```
   */
  async download (target: DownloadTarget) {
    return downloadHelper(this.downloadDeps(), target)
  }

  /** download a Telegram file as a node `Readable` */
  async downloadStream (target: DownloadTarget) {
    return downloadStreamHelper(this.downloadDeps(), target)
  }

  /** download a Telegram file as an async-iterable byte stream */
  async downloadIterable (target: DownloadTarget) {
    return downloadIterableHelper(this.downloadDeps(), target)
  }

  /** download a Telegram file straight to disk */
  async downloadToFile (path: string, target: DownloadTarget) {
    return downloadToFileHelper(this.downloadDeps(), path, target)
  }

  /** resolve the public download URL. calls `getFile` if needed — pass a resolved `File` to skip the round-trip */
  async getFileURL (target: DownloadTarget) {
    return getFileURLHelper(this.downloadDeps(), target)
  }

  async dropPendingUpdates (value?: boolean | string[]) {
    this.polling ??= new PollingTransport({
      tg: this as Telegram,
      buildAndDispatch: async () => {},
      trackInFlight: () => {},
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

  protected async handleIncoming (raw: Record<string, unknown>) {
    await this.runRawUpdateHandlers(raw)

    const update = buildUpdate(raw, this) as AnyUpdate

    await this.dispatch(update)
  }

  // packs deps for download helpers without leaking a `this` ref — helpers stay test-friendly
  private downloadDeps () {
    return {
      options: this.options,
      httpClient: this.httpClient,
      getFile: async (fileId: string) => this.api.getFile({ file_id: fileId })
    }
  }

  private async bootstrap () {
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

  private trackInFlight (p: Promise<void>) {
    this.inFlight.add(p)
    // dispatchers wrap rejections themselves before reaching here, so this is purely cleanup
    // eslint-disable-next-line @typescript-eslint/no-floating-promises -- see above
    p.finally(() => this.inFlight.delete(p))
  }

  private async drainInFlight () {
    if (this.inFlight.size === 0) {
      return
    }

    await Promise.allSettled(this.inFlight)
  }

  // raw handlers fire before kind discrimination — forward-compat for unknown kinds.
  // errors funnel through `reportDispatchError` like wrapped handlers
  private async runRawUpdateHandlers (raw: Record<string, unknown>) {
    if (this.rawUpdateHandlers.length === 0) {
      return
    }

    for (const handler of this.rawUpdateHandlers) {
      try {
        await handler(raw)
      } catch (error) {
        this.reportDispatchError(error as Error, raw)
      }
    }
  }

  // dispatch-error funnel. with no onDispatchError handler: log via debug and rethrow on a
  // microtask, so node's default uncaughtException kicks in (matches v2 loud-by-default)
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

// `Telegram`-bound mention filter — closes over `tg.bot.username` so `tg.command('foo')`
// validates `@bot` suffixes. no-suffix commands accept any bot; unbound `f.command('foo')`
// skips this layer entirely
function botMentionFilter (tg: Telegram) {
  return defineFilter<MessageUpdate>(
    'botMention',
    (update: unknown): update is MessageUpdate => {
      const mentioned = (update as { match?: RegExpMatchArray }).match?.groups?.mention

      if (mentioned === undefined) {
        return true
      }

      const ours = tg.bot?.username

      return ours !== undefined && mentioned.toLowerCase() === ours.toLowerCase()
    },
    { kinds: ['message'] }
  )
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
