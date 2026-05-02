import type { RequestContext, Telegram } from 'puregram'

import { TestChat } from './actors/chat'
import { allocateChatId } from './actors/identity'
import { TestMessage } from './actors/message'
import type { CreateUserOptions } from './actors/user'
import { TestUser } from './actors/user'
import { inject as injectRaw } from './dispatch/inject'
import { InterceptingHttpClient, swapHttpClient } from './http/intercept'
import type { TestEnvOptions } from './options'
import { runAutoStub } from './stubs/auto-stub'
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

  private readonly overrides = new OverrideRegistry()
  private readonly restoreHttp: () => void
  private readonly world = new World()
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

      record.result = stubResult
      this.apiCalls.push(record)

      return { ok: true as const, result: stubResult }
    })

    this.restoreHttp = swapHttpClient(tg, intercept)

    // ensure tg.shutdown() runs its lifecycle hooks even if .start() was never called
    tg.registerCleanup(async () => {})
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
      inject: raw => injectRaw(this.tg, raw),
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

        await injectRaw(this.tg, {
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
    await injectRaw(this.tg, raw)
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
}
