import type {
  ActionControllerParams,
  Filter,
  GetBusinessAccountGiftsParams,
  GetChatGiftsParams,
  GetUserGiftsParams,
  MessageUpdate,
  SendChatActionParams,
  TelegramDispatchers,
  TelegramShortcuts,
  TelegramUser
} from '@puregram/api'
import { and, CallbackQueryUpdate, defineFilter, isFilter } from '@puregram/api'

import { ChatActionController } from './api/chat-action'
import type { DownloadTarget } from './api/download'
import {
  download as downloadHelper,
  downloadIterable as downloadIterableHelper,
  downloadStream as downloadStreamHelper,
  downloadToFile as downloadToFileHelper,
  getFileURL as getFileURLHelper
} from './api/download'
import { runRequest } from './api/lifecycle'
import { cursorPaginator, offsetPaginator } from './api/paginate'
import type { ApiCaller, TelegramApi } from './api/proxy'
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
import { nodeAdapter } from './transport/webhook/adapters/node'
import { createHandler as createWebhookHandler } from './transport/webhook/handler'
import {
  deleteWebhook as deleteWebhookHelper,
  type DeleteWebhookOptions,
  getWebhookInfo as getWebhookInfoHelper,
  setWebhook as setWebhookHelper,
  type SetWebhookOptions
} from './transport/webhook/helpers'
import type { StartWebhookOptions } from './transport/webhook/listener'
import { resolveWebhookOptions } from './transport/webhook/options'

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
  protected readonly seenUpdates = new Set<number>()
  protected polling: PollingTransport | undefined

  protected started = false
  protected startPromise: Promise<void> | undefined

  private readonly apiCaller: ApiCaller

  constructor (input: TelegramOptions) {
    this.options = resolveOptions(input)
    this.httpClient = this.options.httpClient ?? defaultHttpClient
    this.apiCaller = (method, params) => runRequest(
      { options: this.options, hooks: this.hooks, httpClient: this.httpClient },
      method,
      params
    )
    this.api = createApiProxy(this.apiCaller)

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

    // coalesce concurrent boots (webhook adapters fire start() per request)
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
   * register a handler for a specific update kind by name. the typed `on*` dispatchers
   * (`onMessage`, `onCallbackQuery`, …) cover the bot-api's curated kind list with full
   * type narrowing; this method also routes to custom kinds registered via `defineUpdate`
   */
  on (kind: string, handler: UpdateHandler<AnyUpdate>, options?: OnOptions) {
    this.dispatcher.on(kind, handler as UpdateHandler, options?.priority ?? 'normal')

    return this
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

  /**
   * register a handler for errors thrown by dispatched update handlers — alias
   * for `useHook('onDispatchError', fn)`. when `swallowDispatchErrors` is true
   * in options, registered catch handlers are the only escape hatch (otherwise
   * unhandled errors rethrow on a microtask and trip `uncaughtException`)
   *
   * @example
   * ```ts
   * tg.catch((err, ctx) => {
   *   console.error('handler threw on update', ctx.raw.update_id, err)
   * })
   * ```
   */
  catch (handler: DispatchErrorHandler) {
    this.hooks.add('onDispatchError', handler)

    return this
  }

  useHook (name: RequestHookName, fn: Middleware<RequestContext>, options?: HookOptions): this
  useHook (name: 'onApiCall', fn: Middleware<RequestContext>, options?: HookOptions): this
  useHook (name: 'onUpdate', fn: Middleware<AnyUpdate>, options?: HookOptions): this
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
  use (fn: Middleware<AnyUpdate>, options?: HookOptions): this
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

    const { startWebhookListener } = await import('./transport/webhook/listener')
    const startup = await startWebhookListener(this as Telegram, options)

    if (startup.server !== undefined) {
      this.registerCleanup(startup.stop)
    }

    return startup
  }

  async setWebhook (options: SetWebhookOptions) {
    return setWebhookHelper(this as Telegram, options)
  }

  resolveAllowedUpdates (value: string[] | 'auto') {
    if (value !== 'auto') {
      return value
    }

    const { kinds, opaque } = this.dispatcher.collectAllowedKinds()

    // can't confidently narrow (opaque predicate or no handlers) → telegram default subscription
    if (opaque || kinds.size === 0) {
      return []
    }

    return [...kinds]
  }

  iterUserProfilePhotos (userId: number, params: { offset?: number, limit?: number } = {}) {
    return offsetPaginator(async (offset, limit) => {
      const result = await this.api.getUserProfilePhotos({ user_id: userId, offset, limit })

      return { items: result.photos, total: result.total_count }
    }, params.offset, params.limit)
  }

  iterUserProfileAudios (userId: number, params: { offset?: number, limit?: number } = {}) {
    return offsetPaginator(async (offset, limit) => {
      const result = await this.api.getUserProfileAudios({ user_id: userId, offset, limit })

      return { items: result.audios, total: result.total_count }
    }, params.offset, params.limit)
  }

  iterStarTransactions (params: { offset?: number, limit?: number } = {}) {
    return offsetPaginator(async (offset, limit) => {
      const result = await this.api.getStarTransactions({ offset, limit })

      return { items: result.transactions, total: undefined }
    }, params.offset, params.limit)
  }

  iterUserGifts (userId: number, params: Omit<GetUserGiftsParams, 'user_id' | 'offset'> = {}) {
    return cursorPaginator(async (offset, limit) => {
      const result = await this.api.getUserGifts({ ...params, user_id: userId, offset, limit })

      return { items: result.gifts, total: result.total_count, next: result.next_offset }
    }, '', params.limit)
  }

  iterChatGifts (chatId: number | string, params: Omit<GetChatGiftsParams, 'chat_id' | 'offset'> = {}) {
    return cursorPaginator(async (offset, limit) => {
      const result = await this.api.getChatGifts({ ...params, chat_id: chatId, offset, limit })

      return { items: result.gifts, total: result.total_count, next: result.next_offset }
    }, '', params.limit)
  }

  iterBusinessAccountGifts (
    businessConnectionId: string,
    params: Omit<GetBusinessAccountGiftsParams, 'business_connection_id' | 'offset'> = {}
  ) {
    return cursorPaginator(async (offset, limit) => {
      const result = await this.api.getBusinessAccountGifts({
        ...params,
        business_connection_id: businessConnectionId,
        offset,
        limit
      })

      return { items: result.gifts, total: result.total_count, next: result.next_offset }
    }, '', params.limit)
  }

  /**
   * a scoped api proxy that injects `business_connection_id` into every call — act on behalf of a
   * connected business account. a call-site `business_connection_id` overrides the bound one.
   *
   * @example
   * ```ts
   * const biz = tg.business(connectionId)
   * await biz.sendMessage({ chat_id, text: 'on behalf of the account' })
   * ```
   */
  business (businessConnectionId: string) {
    return createApiProxy((method, params) =>
      this.apiCaller(method, { business_connection_id: businessConnectionId, ...params })
    )
  }

  /**
   * a scoped api proxy that injects `receiver_user_id` (and optionally `callback_query_id`)
   * into every call — send group messages visible only to one user. call-site params
   * override the bound ones. not chainable with `tg.business(…)` (both return flat api
   * proxies) — pass `business_connection_id` as a call-site param instead.
   *
   * @example
   * ```ts
   * const eph = tg.ephemeral(userId)
   * await eph.sendMessage({ chat_id, text: 'only you can see this' })
   * ```
   */
  ephemeral (receiverUserId: number, callbackQueryId?: string) {
    return createApiProxy((method, params) =>
      this.apiCaller(method, {
        receiver_user_id: receiverUserId,
        ...(callbackQueryId !== undefined ? { callback_query_id: callbackQueryId } : {}),
        ...params
      })
    )
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

  /**
   * create a controller that re-sends `sendChatAction(action)` every `interval`
   * ms (default `5000`) until `stop()` is called — telegram clears the action
   * after ~5 seconds, so a long task needs it refreshed
   *
   * @example
   * ```ts
   * const controller = tg.createActionController(chatId, 'typing')
   * controller.start()
   * // ... long task ...
   * controller.stop()
   * ```
   */
  createActionController (chatId: number | string, action: SendChatActionParams['action'], options?: ActionControllerParams) {
    return new ChatActionController(this, chatId, action, options)
  }

  /**
   * run `fn` while continuously sending `sendChatAction(action)`. the action
   * auto-stops when `fn` settles — even if it throws — and `fn`'s result is
   * returned
   *
   * @example
   * ```ts
   * const photo = await tg.withChatAction(chatId, 'upload_photo', () => buildPhoto())
   * ```
   */
  async withChatAction <T> (chatId: number | string, action: SendChatActionParams['action'], fn: () => Promise<T> | T, options?: ActionControllerParams) {
    const controller = this.createActionController(chatId, action, options)

    controller.start()

    try {
      return await fn()
    } finally {
      controller.stop()
    }
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
    if (this.options.dedupeUpdates !== false && this.isDuplicateUpdate(raw)) {
      return
    }

    await this.runRawUpdateHandlers(raw)

    const update = buildUpdate(raw, this) as AnyUpdate

    if (this.options.autoAnswerCallbackQuery !== false && update instanceof CallbackQueryUpdate) {
      await this.dispatchAutoAnswered(update)

      return
    }

    await this.dispatch(update)
  }

  protected isDuplicateUpdate (raw: Record<string, unknown>) {
    const id = raw.update_id

    if (typeof id !== 'number') {
      return false
    }

    if (this.seenUpdates.has(id)) {
      return true
    }

    // keep a bounded window of recent ids — evict oldest (insertion order) past the cap
    const configured = typeof this.options.dedupeUpdates === 'object' ? this.options.dedupeUpdates.max : undefined
    const max = configured ?? 1000

    this.seenUpdates.add(id)

    while (this.seenUpdates.size > max) {
      // Set.values() iterator-result `value` is typed `any` by the lib; the oldest key is always a number
      const oldest = this.seenUpdates.values().next().value as number | undefined

      if (oldest === undefined) {
        break
      }

      this.seenUpdates.delete(oldest)
    }

    return false
  }

  // wrap update.answer so a handler call marks it answered; if none did, answer once after dispatch
  protected async dispatchAutoAnswered (update: CallbackQueryUpdate) {
    const original = update.answer.bind(update)
    let answered = false

    update.answer = (params = {}) => {
      answered = true

      return original(params)
    }

    try {
      await this.dispatch(update)
    } finally {
      if (!answered) {
        const fallback = this.options.autoAnswerCallbackQuery
        const params = typeof fallback === 'object' ? fallback : {}

        await original(params).catch(() => {})
      }
    }
  }

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

    // the v2 composer swallowed handler errors; v3 crashes by default — make the delta loud
    // at startup instead of at the first thrown 403
    if (!this.options.swallowDispatchErrors && !this.hooks.hasDispatchErrorHandler) {
      process.emitWarning(
        'no dispatch error handler registered — an error thrown inside an update handler will crash the process. register tg.catch(handler) or set swallowDispatchErrors: true',
        { code: 'PUREGRAM_NO_DISPATCH_ERROR_HANDLER' }
      )
    }

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

  // with no onDispatchError handler: log via debug and rethrow on a microtask so node's
  // uncaughtException kicks in. `swallowDispatchErrors` suppresses that fallback
  private reportDispatchError (error: Error, raw: Record<string, unknown>) {
    this.hooks.runDispatchError(error, { raw })
      .then((handled) => {
        if (!handled) {
          dispatchDebug('handler threw: %O', error)

          if (!this.options.swallowDispatchErrors) {
            rethrowAsync(error)
          }
        }
      })
      .catch((handlerError: unknown) => {
        if (!this.options.swallowDispatchErrors) {
          rethrowAsync(handlerError as Error)
        }
      })
  }
}

function rethrowAsync (error: Error) {
  queueMicrotask(() => {
    throw error
  })
}

// closes over `tg.bot.username` so `tg.command('foo')` validates `@bot` suffixes
// no-suffix commands accept any bot; unbound `f.command('foo')` skips this layer
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

// `match` is populated by value/regex variants of content/callback/inline filters
// and by `tg.command(...)` — surfaced so handlers can read `update.match?.groups?.foo`
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
