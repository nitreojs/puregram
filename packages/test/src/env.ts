import type { RequestContext, Telegram } from 'puregram'

import { TestChat } from './actors/chat'
import { allocateChatId } from './actors/identity'
import { TestMessage } from './actors/message'
import type { CreateUserOptions } from './actors/user'
import { TestUser } from './actors/user'
import { inject as injectRaw } from './dispatch/inject'
import { InterceptingHttpClient, swapHttpClient } from './http/intercept'
import type { TestEnvOptions } from './options'
import { applyPacks } from './plugins/registry'
import type { StorageViewWithRegister } from './plugins/storage-view'
import { createNamespacedStorageView } from './plugins/storage-view'
import { isApiErrorSentinel } from './stubs/api-error'
import { runAutoStub, STRICT_FALLBACK } from './stubs/auto-stub'
import { OverrideRegistry } from './stubs/overrides'
import { World } from './world/world'

export interface ApiCallRecord {
  method: string
  params: Record<string, unknown>
  result?: unknown
  error?: { error_code: number, description: string, parameters?: object }
  at: number
}

export class TestEnv<TG extends Telegram = Telegram> {
  readonly tg: TG
  readonly options: TestEnvOptions
  readonly apiCalls: ApiCallRecord[] = []
  storage: StorageViewWithRegister | undefined

  private readonly overrides = new OverrideRegistry()
  private readonly restoreHttp: () => void
  private readonly world = new World()
  private readonly postInjectHooks: ((raw: Record<string, unknown>) => Promise<void> | void)[] = []
  private snapshot: Record<string, unknown> | undefined

  constructor (tg: TG, options: TestEnvOptions = {}) {
    this.tg = tg
    this.options = options

    tg.useHook('onBeforeRequest', (ctx, next) => {
      const request = ctx as RequestContext
      const params = { ...(request.params ?? {}) }

      delete params.suppress
      this.snapshot = params

      return next()
    }, { priority: 'high' })

    const intercept = new InterceptingHttpClient(async (method, params) => {
      const captured = this.snapshot ?? params

      this.snapshot = undefined

      const record: ApiCallRecord = { method, params: captured, at: Date.now() }
      const resolved = await this.overrides.resolve(method, captured)

      if (resolved.kind === 'error') {
        const sentinel = resolved.value as { error_code: number, description: string, parameters?: object }
        const envelope = {
          ok: false as const,
          error_code: sentinel.error_code,
          description: sentinel.description,
          ...(sentinel.parameters !== undefined ? { parameters: sentinel.parameters } : {})
        }

        record.error = {
          error_code: envelope.error_code,
          description: envelope.description,
          ...(sentinel.parameters !== undefined ? { parameters: sentinel.parameters } : {})
        }
        this.apiCalls.push(record)

        return envelope
      }

      if (resolved.kind === 'reply') {
        record.result = resolved.value
        this.apiCalls.push(record)

        return { ok: true as const, result: resolved.value }
      }

      const stubResult: unknown = runAutoStub(this.world, method, captured)

      if (stubResult === STRICT_FALLBACK) {
        if (this.options.strictApi === true) {
          const description = `strictApi: no auto-stub or override for "${method}"`
          const envelope = {
            ok: false as const,
            error_code: 500,
            description
          }

          record.error = { error_code: 500, description }
          this.apiCalls.push(record)

          return envelope
        }

        record.result = true
        this.apiCalls.push(record)

        return { ok: true as const, result: true }
      }

      if (isApiErrorSentinel(stubResult)) {
        const envelope = {
          ok: false as const,
          error_code: stubResult.error_code,
          description: stubResult.description,
          ...(stubResult.parameters !== undefined ? { parameters: stubResult.parameters } : {})
        }

        record.error = {
          error_code: stubResult.error_code,
          description: stubResult.description,
          ...(stubResult.parameters !== undefined ? { parameters: stubResult.parameters } : {})
        }
        this.apiCalls.push(record)

        return envelope
      }

      record.result = stubResult
      this.apiCalls.push(record)

      return { ok: true as const, result: stubResult }
    })

    this.restoreHttp = swapHttpClient(tg, intercept)

    // ensure `tg.shutdown()` runs lifecycle hooks even when `.start()` never ran
    tg.registerCleanup(async () => {})

    this.installPendingPluginsEagerly()
    applyPacks(this as TestEnv, this.tg)
  }

  get bot () {
    return this.world.bot
  }

  get users () {
    return this.world.users as readonly TestUser[]
  }

  get chats () {
    return this.world.chats as readonly TestChat[]
  }

  createUser (options: CreateUserOptions = {}) {
    const user = new TestUser({
      tg: this.tg,
      world: this.world,
      inject: raw => this.injectInternal(raw),
      options,
      strictMembership: this.options.strictMembership ?? false
    })

    this.world.users.push(user)
    this.world.chats.push(user.pmChat)

    return user
  }

  createChat (options:
    | { type: 'group' | 'supergroup', title: string, id?: number }
    | { type: 'channel', title: string, id?: number }
  ) {
    const id = options.id ?? allocateChatId(options.type)
    const chat = new TestChat({ id, type: options.type, title: options.title })

    if (chat.type === 'channel') {
      chat.setPostFn(async (text) => {
        const msg = new TestMessage({
          chat,
          from: undefined,
          message_id: chat.nextMessageId(),
          date: Math.floor(Date.now() / 1000)
        })

        msg.text = text
        chat.appendMessage(msg)

        await this.injectInternal({
          update_id: this.world.nextUpdateId(),
          channel_post: msg.toRaw()
        })

        return msg
      })
    }

    this.world.chats.push(chat)

    return chat
  }

  async inject (raw: Record<string, unknown>) {
    const enriched = raw.update_id !== undefined
      ? raw
      : { update_id: this.world.nextUpdateId(), ...raw }

    await this.injectInternal(enriched)
  }

  // packs observe the raw update after dispatch settles — e.g. to mirror session into a sync cache
  onPostInject (fn: (raw: Record<string, unknown>) => Promise<void> | void) {
    this.postInjectHooks.push(fn)
  }

  lastApiCall (method?: string) {
    if (method === undefined) {
      return this.apiCalls[this.apiCalls.length - 1]
    }

    for (let i = this.apiCalls.length - 1; i >= 0; i -= 1) {
      const call = this.apiCalls[i]

      if (call !== undefined && call.method === method) {
        return call
      }
    }

    return undefined
  }

  callsTo (method: string) {
    return this.apiCalls.filter(c => c.method === method)
  }

  clearApiCalls () {
    this.apiCalls.length = 0
  }

  onApi (method: string, reply: unknown, opts?: { times?: number, mutateWorld?: boolean }) {
    this.overrides.set(method, reply, opts)

    return this
  }

  offApi (method?: string) {
    this.overrides.clear(method)

    return this
  }

  async shutdown () {
    await this.tg.shutdown()
    this.restoreHttp()
  }

  ensureStorage () {
    if (this.storage === undefined) {
      this.storage = createNamespacedStorageView()
    }

    return this.storage
  }

  private async injectInternal (raw: Record<string, unknown>) {
    if (this.options.strictDispatch === true) {
      this.assertHandlerExistsFor(raw)
    }

    await injectRaw(this.tg, raw)

    for (const fn of this.postInjectHooks) {
      await fn(raw)
    }
  }

  private assertHandlerExistsFor (raw: Record<string, unknown>) {
    const kind = Object.keys(raw).find(k => k !== 'update_id')

    if (kind === undefined) {
      throw new Error('strictDispatch: empty update — no kind to dispatch')
    }

    interface DispatcherInternal {
      has: (kind: string) => boolean
      entries: { type: 'kind' | 'predicate' }[]
    }

    interface InternalTelegram {
      dispatcher: DispatcherInternal
    }

    const dispatcher = (this.tg as unknown as InternalTelegram).dispatcher
    const hasKindHandler = dispatcher.has(kind)
    const hasPredicateHandler = dispatcher.entries.some(e => e.type === 'predicate')

    if (!hasKindHandler && !hasPredicateHandler) {
      throw new Error(`strictDispatch: no handler registered for update kind "${kind}"`)
    }
  }

  // install queued plugins synchronously so packs can `tg.has()` them before `.start()`.
  // async-install plugins skip (a later `.start()` runs them; pack just won't activate here)
  private installPendingPluginsEagerly () {
    interface InternalTelegram {
      pendingPlugins: { name: string, install: (tg: Telegram) => unknown }[]
      plugins: { set: (name: string, ext: unknown) => void, has: (name: string) => boolean }
    }

    const internal = this.tg as unknown as InternalTelegram
    const pending = internal.pendingPlugins

    if (pending === undefined || pending.length === 0) {
      return
    }

    const remaining: typeof pending = []

    for (const plugin of pending) {
      if (internal.plugins.has(plugin.name)) {
        continue
      }

      const ext = plugin.install(this.tg)

      if (ext instanceof Promise) {
        remaining.push(plugin)

        continue
      }

      internal.plugins.set(plugin.name, ext)
      Object.defineProperty(this.tg, plugin.name, {
        value: ext,
        enumerable: true,
        configurable: false
      })
    }

    pending.length = 0
    pending.push(...remaining)
  }
}
