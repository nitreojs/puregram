import type { TelegramResponseParameters } from '@puregram/api'

import { createDebug } from '../debug'
import type { HookRegistry, RequestContext } from '../dispatch/hooks'
import { ApiError } from '../errors'
import type { HttpClient } from '../http/client'
import { needsMultipart, buildSimpleMultipart, buildMediaGroupMultipart } from '../http/multipart'
import type { ResolvedTelegramOptions } from '../options'

const debug = createDebug('puregram:api')

export interface RunRequestDeps {
  options: ResolvedTelegramOptions
  hooks: HookRegistry
  httpClient: HttpClient
}

interface ApiResponseOk {
 ok: true; result: unknown
}
interface ApiResponseErr {
 ok: false; error_code: number; description: string; parameters?: TelegramResponseParameters
}
type ApiResponseUnion = ApiResponseOk | ApiResponseErr

export async function runRequest (
  deps: RunRequestDeps,
  method: string,
  rawParams: Record<string, unknown> | undefined
) {
  const params = { ...(rawParams ?? {}) }
  const suppress = params.suppress === true

  delete params.suppress

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), deps.options.apiTimeout)

  const ctx: RequestContext = { method, params, init: { method: 'GET', signal: controller.signal } }

  try {
    await deps.hooks.run('onBeforeRequest', ctx)

    if ('media' in params) {
      const { body, headers } = await buildMediaGroupMultipart(params)

      ctx.init = { method: 'POST', body, signal: controller.signal, headers, duplex: 'half' } as unknown as RequestInit
    } else if (needsMultipart(params)) {
      const { body, headers } = await buildSimpleMultipart(params)

      ctx.init = { method: 'POST', body, signal: controller.signal, headers, duplex: 'half' } as unknown as RequestInit
    }

    const url = buildUrl(deps.options, method, ctx.init?.method === 'POST' ? undefined : params)

    ctx.url = url

    await deps.hooks.run('onRequestIntercept', ctx)

    debug('-> %s', method)
    const response = await deps.httpClient.request({ url: ctx.url, init: ctx.init ?? {} })
    const json = await response.json() as ApiResponseUnion

    ctx.response = { status: response.status }
    ctx.json = json

    await deps.hooks.run('onResponseIntercept', ctx)
    debug('<- %s ok=%s', method, json.ok)

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
