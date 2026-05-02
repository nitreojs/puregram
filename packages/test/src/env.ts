import type { RequestContext, Telegram } from 'puregram'

import { InterceptingHttpClient, swapHttpClient } from './http/intercept'
import type { TestEnvOptions } from './options'
import { OverrideRegistry } from './stubs/overrides'

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

      const stubResult: unknown = true

      record.result = stubResult
      this.apiCalls.push(record)

      return { ok: true as const, result: stubResult }
    })

    this.restoreHttp = swapHttpClient(tg, intercept)

    // ensure tg.shutdown() runs its lifecycle hooks even if .start() was never called
    tg.registerCleanup(async () => {})
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
