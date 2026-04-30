import type {
  Filter,
  ServiceActionKind,
  TelegramShortcuts,
  TelegramUser,
  UpdateKind,
  UpdateKindMap
} from '@puregram/api'
import { and, defineFilter, isFilter, kind as kindFilter } from '@puregram/api'

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
import type { AnyUpdate, OnOptions, UpdateHandler, UpdatePredicate } from './dispatch/on'
import { Dispatcher } from './dispatch/on'
import { buildUpdate } from './dispatch/update-builder'
import type { ApiResponseError } from './errors'
import {
  callbackData as callbackDataFilter
} from './filters/callback'
import { command as commandFilter } from './filters/content'
import {
  chosenInlineResult as chosenInlineResultFilter,
  inlineQuery as inlineQueryFilter
} from './filters/inline'
import { when } from './filters/when'
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
   * narrow the handler argument automatically. predicates may return `boolean` or
   * `Promise<boolean>` — async results are awaited before the handler runs. predicate
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
  on<Base, Mod> (
    filter: Filter<Base, Mod>,
    handler: UpdateHandler<Base & Mod>,
    options?: OnOptions
  ): this

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
    predicate: (update: AnyUpdate) => Promise<boolean>,
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
    // string form layers in a `@botname` mention check that closes over
    // `this.bot.username`; regex form leaves @-validation to the caller's pattern
    const filter = typeof nameOrPattern === 'string'
      ? and(commandFilter(nameOrPattern), botMentionFilter(this))
      : commandFilter(nameOrPattern)

    return this.on(filter, handler)
  }

  /**
   * register a handler against callback queries with matching data
   *
   * - string form — equality match against `update.raw.data`
   * - regex form — runs against `update.raw.data`, attaching `match: RegExpMatchArray`
   *   on success
   *
   * shorthand for `tg.on(callbackData(value), handler)`
   *
   * @example
   * tg.callbackData(/^buy:(?<sku>.+)$/, async (q) => {
   *   await q.answer({ text: `bought ${q.match?.groups?.sku}` })
   * })
   */
  callbackData (value: string, handler: UpdateHandler<UpdateKindMap['callback_query']>): this
  callbackData (pattern: RegExp, handler: UpdateHandler<UpdateKindMap['callback_query']>): this
  callbackData (
    value: string | RegExp,
    handler: UpdateHandler<UpdateKindMap['callback_query']>
  ): this {
    return this.on(
      typeof value === 'string' ? callbackDataFilter(value) : callbackDataFilter(value),
      handler
    )
  }

  /**
   * register a handler against inline queries with matching query text
   *
   * - string form — equality match against `update.raw.query`
   * - regex form — runs against `update.raw.query`, attaching `match: RegExpMatchArray`
   *   on success
   *
   * shorthand for `tg.on(inlineQuery(value), handler)`
   *
   * @example
   * tg.inlineQuery(/^search\s+(?<term>.+)$/i, async (q) => {
   *   await q.answer([], { switch_pm_text: q.match?.groups?.term })
   * })
   */
  inlineQuery (value: string, handler: UpdateHandler<UpdateKindMap['inline_query']>): this
  inlineQuery (pattern: RegExp, handler: UpdateHandler<UpdateKindMap['inline_query']>): this
  inlineQuery (
    value: string | RegExp,
    handler: UpdateHandler<UpdateKindMap['inline_query']>
  ): this {
    return this.on(
      typeof value === 'string' ? inlineQueryFilter(value) : inlineQueryFilter(value),
      handler
    )
  }

  /**
   * register a handler against chosen-inline-result updates with matching `result_id`
   *
   * - string form — equality match against `update.raw.result_id`
   * - regex form — runs against `update.raw.result_id`, attaching
   *   `match: RegExpMatchArray` on success
   *
   * shorthand for `tg.on(chosenInlineResult(value), handler)`
   *
   * @example
   * tg.chosenInlineResult(/^article:(?<id>\d+)$/, (r) => {
   *   console.log('chose article', r.match?.groups?.id)
   * })
   */
  chosenInlineResult (value: string, handler: UpdateHandler<UpdateKindMap['chosen_inline_result']>): this
  chosenInlineResult (pattern: RegExp, handler: UpdateHandler<UpdateKindMap['chosen_inline_result']>): this
  chosenInlineResult (
    value: string | RegExp,
    handler: UpdateHandler<UpdateKindMap['chosen_inline_result']>
  ): this {
    return this.on(
      typeof value === 'string'
        ? chosenInlineResultFilter(value)
        : chosenInlineResultFilter(value),
      handler
    )
  }

  /**
   * register a handler against a service-event update kind (derived
   * `Message`-payload events like `new_chat_members`, `pinned_message`, etc)
   *
   * shorthand for `tg.on(kind(type), handler)` constrained to `ServiceActionKind`
   *
   * @example
   * tg.action('new_chat_members', async (update) => {
   *   await update.send(`welcome ${update.newChatMembers.length} new members`)
   * })
   */
  action<T extends ServiceActionKind> (
    type: T,
    handler: UpdateHandler<UpdateKindMap[T]>
  ) {
    return this.on(kindFilter(type), handler)
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

// `Telegram`-bound mention filter — closes over `tg.bot.username` so the string
// form of `tg.command(...)` can validate the `@bot` suffix attached by the
// preceding `command` filter. when no suffix was used (mention is undefined) the
// command is implicitly for any bot in the chat and we accept; otherwise we
// require the mention to match `tg.bot.username` case-insensitively. unbound
// composition (`f.command('start')`) skips this layer and stays mention-agnostic
function botMentionFilter (tg: Telegram) {
  return defineFilter<UpdateKindMap['message']>(
    'botMention',
    (update: unknown): update is UpdateKindMap['message'] => {
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
