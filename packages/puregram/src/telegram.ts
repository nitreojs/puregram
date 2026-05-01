import type {
  CallbackQueryUpdate,
  Filter,
  MessageUpdate,
  TelegramDispatchers,
  TelegramShortcuts,
  TelegramUser
} from '@puregram/api'
import { and, defineFilter, isFilter } from '@puregram/api'

import { runRequest } from './api/lifecycle'
import type { TelegramApi } from './api/proxy'
import { createApiProxy } from './api/proxy'
import { installShortcuts } from './api/shortcuts'
import { createDebug } from './debug'
import { CustomUpdateRegistry } from './dispatch/custom-updates'
import type {
  DispatchErrorHandler,
  ErrorHandler,
  HookOptions,
  Middleware,
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
export interface Telegram<Ext = unknown> extends TelegramShortcuts, TelegramDispatchers {}
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

    // coalesce concurrent boots — webhook adapters fire start() per request
    this.startPromise ??= this.bootstrap()
    await this.startPromise
  }

  async shutdown () {
    if (!this.started) {
      return
    }

    this.polling?.stop()

    await this.hooks.run('onShutdown', { tg: this })
    await this.drainInFlight()
    this.started = false
    this.startPromise = undefined
  }

  /**
   * register a cross-kind handler — fires for every supported update.
   *
   * the bare form receives every wrapped update (`AnyUpdate`); the filter form gates
   * dispatch on a `Filter`, narrowing the handler argument via `Modify<AnyUpdate, Mod>`.
   * use this when a single handler should span multiple kinds or react to a custom
   * predicate that doesn't fit a per-kind dispatcher (`tg.onMessage`, `tg.onCallbackQuery`, …)
   *
   * @example
   * tg.onUpdate(async (update) => {
   *   console.log('[any]', update.kind)
   * })
   *
   * tg.onUpdate(
   *   (update): update is MessageUpdate => update.is('message') && update.hasText(),
   *   (message) => message.send(`echo: ${message.text}`)
   * )
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
   * register a raw-update handler. fires for every incoming bot-api update payload
   * before kind discrimination — including kinds that landed in bot-api ahead of our
   * schema regen and don't yet have a wrapped class. the handler arg is the raw
   * payload object as received from polling/webhook, untyped beyond the bot-api shape
   *
   * useful for forward-compat logging, ingestion pipelines, or routing logic that
   * needs to see every update before any wrapper allocation
   */
  onRawUpdate (handler: (raw: Record<string, unknown>) => void | Promise<void>) {
    this.rawUpdateHandlers.push(handler)

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
  command (
    nameOrPattern: string | RegExp,
    handler: UpdateHandler<MessageUpdate & { match?: RegExpMatchArray }>
  ) {
    // string form layers in a `@botname` mention check that closes over
    // `this.bot.username`; regex form leaves @-validation to the caller's pattern
    const filter = typeof nameOrPattern === 'string'
      ? and(commandFilter(nameOrPattern), botMentionFilter(this))
      : commandFilter(nameOrPattern)

    return this.onMessage(filter, handler as never)
  }

  /**
   * register a handler against callback queries with matching data
   *
   * - string form — equality match against `update.raw.data`
   * - regex form — runs against `update.raw.data`, attaching `match: RegExpMatchArray`
   *   on success
   *
   * shorthand for `tg.onCallbackQuery(callbackData(value), handler)`
   *
   * @example
   * tg.callbackQuery(/^buy:(?<sku>.+)$/, async (q) => {
   *   await q.answer({ text: `bought ${q.match?.groups?.sku}` })
   * })
   */
  callbackQuery (
    value: string | RegExp,
    handler: UpdateHandler<CallbackQueryUpdate & { match?: RegExpMatchArray }>
  ) {
    // branch keeps the typed return narrow per overload; the runtime call body is identical
    const filter = typeof value === 'string'
      ? callbackQueryFilter(value)
      : callbackQueryFilter(value)

    return this.onCallbackQuery(filter, handler as never)
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
   * the 2-arg form gates the middleware on a `Filter` — when the filter matches, the
   * middleware runs; otherwise the chain passes through. equivalent to wrapping the
   * middleware in `when(filter, mw)` by hand. uses the filter's `kinds` metadata for
   * the same dispatcher fast-path that `tg.on(filter, …)` benefits from
   *
   * @example
   * tg.use(async (update, next) => {
   *   const start = Date.now()
   *   await next()
   *   console.log(`update took ${Date.now() - start}ms`)
   * })
   *
   * tg.use(f.chat.private, async (update, next) => {
   *   console.log('[private]', update.kind)
   *   await next()
   * }, { priority: 'high' })
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
   * builds a framework-agnostic webhook handler. consumed by adapters under
   * `puregram/webhook/<framework>`; for raw `node:http` use `getWebhookCallback`
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
   * node `http`/`https` callback. for express/koa/fastify/hono/h3/elysia
   * import the matching adapter from `puregram/webhook/<framework>` instead
   */
  getWebhookCallback (options: WebhookOptions = {}) {
    return nodeAdapter(this.webhookHandler(options))
  }

  /**
   * one-shot: starts the bot, calls `setWebhook`, and (when `port` is given)
   * spins up a built-in node `http` listener. the same `secretToken` is used
   * to register the webhook and to validate incoming requests
   */
  async startWebhook (options: StartWebhookOptions) {
    await this.start()

    return startWebhookListener(this as Telegram, options)
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

  // raw handlers fire before kind discrimination so they see updates whose
  // kind is unknown to our schema yet (forward-compat path). errors are routed
  // through the same dispatch-error funnel as wrapped-handler errors
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

// `Telegram`-bound mention filter — closes over `tg.bot.username` so the string
// form of `tg.command(...)` can validate the `@bot` suffix attached by the
// preceding `command` filter. when no suffix was used (mention is undefined) the
// command is implicitly for any bot in the chat and we accept; otherwise we
// require the mention to match `tg.bot.username` case-insensitively. unbound
// composition (`f.command('start')`) skips this layer and stays mention-agnostic
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
