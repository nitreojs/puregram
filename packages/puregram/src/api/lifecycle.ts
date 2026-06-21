import { inspect } from 'node:util'

import type { TelegramResponseParameters } from '@puregram/api'
import { METHOD_PARAMS, WEBHOOK_REPLY_SAFE_METHODS } from '@puregram/api'

import { createDebug } from '../debug'
import type { HookRegistry, RequestContext } from '../dispatch/hooks'
import { ApiError } from '../errors'
import type { HttpClient } from '../http/client'
import { needsMultipart, buildSimpleMultipart, buildMediaGroupMultipart } from '../http/multipart'
import type { ResolvedTelegramOptions } from '../options'
import { replyAls } from '../transport/webhook/reply'

import { mergeDefaultParams } from './default-params'

const debug = createDebug('puregram:api')
// full request params + raw response body — noisy, lives on its own child namespace
// `puregram:*` / `puregram:api:raw` switch it on; plain `puregram:api` stays terse
const debugRaw = debug.extend('raw')

export interface RunRequestDeps {
  options: ResolvedTelegramOptions
  hooks: HookRegistry
  httpClient: HttpClient
}

interface ApiResponseOk {
  ok: true
  result: unknown
}
interface ApiResponseErr {
  ok: false
  error_code: number
  description: string
  parameters?: TelegramResponseParameters
}
type ApiResponseUnion = ApiResponseOk | ApiResponseErr

export async function runRequest (
  deps: RunRequestDeps,
  method: string,
  rawParams: Record<string, unknown> | undefined
) {
  const params = mergeDefaultParams(deps.options.defaultParams, method, rawParams, METHOD_PARAMS[method])
  const retry = resolveRetry(deps.options.retryOnFloodWait)
  let attempt = 0

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await runOnce(deps, method, params)
    } catch (error) {
      if (retry === undefined || attempt >= retry.max) {
        throw error
      }

      const waitMs = floodWaitMs(error)

      if (waitMs === undefined || waitMs > retry.maxWaitMs) {
        throw error
      }

      attempt += 1
      debug('429 retry %d for %s in %dms', attempt, method, waitMs)
      await sleep(waitMs)
    }
  }
}

function resolveRetry (input: ResolvedTelegramOptions['retryOnFloodWait']) {
  if (input === false || input === undefined) {
    return undefined
  }

  if (input === true) {
    return { max: 1, maxWaitMs: Infinity }
  }

  return {
    max: input.max ?? 1,
    maxWaitMs: input.maxWaitMs ?? Infinity
  }
}

function floodWaitMs (error: unknown) {
  if (!(error instanceof ApiError) || error.code !== 429) {
    return undefined
  }

  const retryAfter = error.parameters?.retry_after

  if (typeof retryAfter !== 'number') {
    return undefined
  }

  return retryAfter * 1000
}

function sleep (ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

async function runOnce (
  deps: RunRequestDeps,
  method: string,
  rawParams: Record<string, unknown> | undefined
) {
  const params = { ...(rawParams ?? {}) }
  const suppress = params.suppress === true

  delete params.suppress

  // webhook-reply optimization — methods returning `true` ride the 200 body, invisible to callers
  // skip when `suppress` (needs real error shape) or multipart (can't serialize as json)
  const slot = replyAls.getStore()

  if (slot !== undefined && !slot.consumed && !suppress &&
      WEBHOOK_REPLY_SAFE_METHODS.has(method) &&
      !('media' in params) && !needsMultipart(params)) {
    if (slot.tryClaim(method, params)) {
      return true
    }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), deps.options.apiTimeout)

  const ctx: RequestContext = { method, params, init: { method: 'GET', signal: controller.signal } }

  try {
    await deps.hooks.run('onBeforeRequest', ctx)

    if ('media' in params) {
      const { body, headers } = await buildMediaGroupMultipart(params, deps.options.useLocal)

      ctx.init = { method: 'POST', body, signal: controller.signal, headers, duplex: 'half' } as unknown as RequestInit
    } else if (needsMultipart(params)) {
      const { body, headers } = await buildSimpleMultipart(params, deps.options.useLocal)

      ctx.init = { method: 'POST', body, signal: controller.signal, headers, duplex: 'half' } as unknown as RequestInit
    }

    const url = buildUrl(deps.options, method, ctx.init?.method === 'POST' ? undefined : params)

    ctx.url = url

    await deps.hooks.run('onRequestIntercept', ctx)

    debug('-> %s', method)

    if (debugRaw.enabled) {
      debugRaw('-> %s %s', method, inspect(params, { depth: null }))
    }

    const response = await deps.httpClient.request({ url: ctx.url, init: ctx.init ?? {} })
    const json = await response.json() as ApiResponseUnion

    ctx.response = { status: response.status }
    ctx.json = json

    await deps.hooks.run('onResponseIntercept', ctx)

    if (json.ok) {
      debug('<- %s ok=true', method)
    } else {
      debug('<- %s ok=false error_code=%s description=%s', method, json.error_code, json.description)
    }

    if (debugRaw.enabled) {
      debugRaw('<- %s %s', method, inspect(json, { depth: null }))
    }

    if (!json.ok) {
      if (suppress) {
        return json
      }

      throw new ApiError(json)
    }

    await deps.hooks.run('onAfterRequest', ctx)

    return json.result
  } catch (error) {
    const wrapped = await deps.hooks.runError(error as Error, ctx)

    throw wrapped
  } finally {
    clearTimeout(timeout)
  }
}

function buildUrl (
  options: ResolvedTelegramOptions,
  method: string,
  paramsForQuery: Record<string, unknown> | undefined
) {
  const path = options.useTestDc ? 'test/' + method : method
  const base = `${options.apiBaseUrl}${options.token}/${path}`

  if (!paramsForQuery) {
    return base
  }

  const flat: Record<string, string> = {}

  for (const [key, value] of Object.entries(paramsForQuery)) {
    if (value === undefined || value === null) {
      continue
    }

    if (typeof value === 'object' && !Buffer.isBuffer(value)) {
      flat[key] = JSON.stringify(value)
    } else {
      flat[key] = String(value)
    }
  }

  const qs = new URLSearchParams(flat).toString()

  return qs ? `${base}?${qs}` : base
}
