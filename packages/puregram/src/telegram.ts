import type { ApiResponseError } from './errors'
import type { Plugin } from './plugins/plugin'
import type { TelegramApi } from './api/proxy'
import type { Middleware, ErrorHandler, HookOptions, RequestHookName } from './dispatch/hooks'
import type { TelegramOptions, ResolvedTelegramOptions } from './options'
import type { HttpClient } from './http/client'
import type { UpdateHandler } from './dispatch/on'
import type { UpdateKind, UpdateKindMap } from '@puregram/api'

import { resolveOptions } from './options'
import { defaultHttpClient } from './http/client'
import { createApiProxy } from './api/proxy'
import { runRequest } from './api/lifecycle'
import { HookRegistry } from './dispatch/hooks'
import { Dispatcher } from './dispatch/on'
import { CustomUpdateRegistry } from './dispatch/custom-updates'
import { resolveInstallOrder } from './plugins/installer'
import { PluginRegistry } from './plugins/registry'

export class Telegram<Ext = {}> {
  readonly options: ResolvedTelegramOptions
  readonly api: TelegramApi

  protected readonly hooks = new HookRegistry()
  protected readonly dispatcher = new Dispatcher()
  protected readonly customUpdates = new CustomUpdateRegistry()
  protected readonly plugins = new PluginRegistry()
  protected readonly pendingPlugins: Plugin[] = []
  protected readonly httpClient: HttpClient

  protected started = false

  constructor (input: TelegramOptions) {
    this.options = resolveOptions(input)
    this.httpClient = this.options.httpClient ?? defaultHttpClient
    this.api = createApiProxy((method, params) => runRequest(
      { options: this.options, hooks: this.hooks, httpClient: this.httpClient },
      method,
      params as Record<string, unknown> | undefined
    ))
  }

  static fromToken (token: string, options: Partial<TelegramOptions> = {}): Telegram {
    return new Telegram({ token, ...options })
  }

  static isErrorResponse (value: unknown): value is ApiResponseError {
    return typeof value === 'object' && value !== null
      && 'ok' in value && (value as { ok: unknown }).ok === false
      && 'error_code' in value
  }

  extend<N extends string, Ext2> (
    plugin: Plugin<N, Ext2>
  ): Telegram<Ext & { [K in N]: Awaited<Ext2> }> {
    if (this.started) {
      throw new Error('cannot extend after .start() — plugins must be queued before start')
    }
    this.pendingPlugins.push(plugin as Plugin)
    return this as unknown as Telegram<Ext & { [K in N]: Awaited<Ext2> }>
  }

  has (pluginName: string): boolean {
    return this.plugins.has(pluginName)
  }

  async start (): Promise<void> {
    if (this.started) return

    const order = resolveInstallOrder(this.pendingPlugins)
    for (const plugin of order) {
      const ext = await plugin.install(this)
      this.plugins.set(plugin.name, ext)
      Object.defineProperty(this, plugin.name, {
        value: ext, enumerable: true, configurable: false
      })
    }

    await this.hooks.run('onInit', { tg: this })
    this.started = true
  }

  async shutdown (): Promise<void> {
    if (!this.started) return
    await this.hooks.run('onShutdown', { tg: this })
    this.started = false
  }

  on<K extends UpdateKind> (
    kind: K,
    handler: UpdateHandler<UpdateKindMap[K]>
  ): this {
    this.dispatcher.on(kind, handler as UpdateHandler)
    return this
  }

  off (kind: string, handler: UpdateHandler): this {
    this.dispatcher.off(kind, handler)
    return this
  }

  useHook (name: RequestHookName | 'onUpdate', fn: Middleware<any>, options?: HookOptions): this
  useHook (name: 'onInit' | 'onShutdown', fn: Middleware<{ tg: unknown }>): this
  useHook (name: 'onError', fn: ErrorHandler): this
  useHook (name: string, fn: any, options?: HookOptions): this {
    this.hooks.add(name as never, fn, options)
    return this
  }

  defineUpdate<N extends string> (kind: N): this {
    this.customUpdates.define(kind)
    return this
  }

  emit (kind: string, payload: Record<string, unknown>): void {
    const update = this.customUpdates.build(kind, payload)
    void this.dispatch(update)
  }

  protected async dispatch (update: { kind: string }): Promise<void> {
    await this.hooks.runUpdate(update, async (_, next) => {
      await this.dispatcher.runUserHandlers(update)
      await next()
    })
  }
}
