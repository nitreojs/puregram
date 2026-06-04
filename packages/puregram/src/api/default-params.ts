import type { ApiMethods, TelegramLinkPreviewOptions } from '@puregram/api'

type ParamsOf<M> = M extends (params: infer P) => unknown ? NonNullable<P> : never

// reuse the generated soft-enum so the value type never drifts from the schema
type ParseMode = NonNullable<ParamsOf<ApiMethods['sendMessage']>['parse_mode']>

/** params broadly shared across methods, sensible to default globally via `'*'` */
export interface CommonDefaultableParams {
  parse_mode?: ParseMode
  link_preview_options?: TelegramLinkPreviewOptions
  disable_notification?: boolean
  protect_content?: boolean
  allow_paid_broadcast?: boolean
  message_effect_id?: string
  business_connection_id?: string
}

/**
 * per-call defaults merged into every outgoing api call. set once on the client.
 * `'*'` applies to any method that accepts the param; a per-method key (typed to
 * that method's params) overrides `'*'`, and an explicit call-site value wins over both
 */
export type DefaultParams =
  & { [M in keyof ApiMethods]?: Partial<ParamsOf<ApiMethods[M]>> }
  & { '*'?: Partial<CommonDefaultableParams> }

// precedence: call-site > per-method > '*'. `'*'` params are gated by `accepts`
// (the method's real param names) so a global default never lands on a method that
// doesn't take it. object-valued params replace wholesale — no deep merge
export function mergeDefaultParams (
  defaults: DefaultParams | undefined,
  method: string,
  callParams: Record<string, unknown> | undefined,
  accepts: readonly string[] | undefined
) {
  if (defaults === undefined) {
    return callParams
  }

  const record = defaults as Record<string, Record<string, unknown> | undefined>
  const global = record['*']
  const perMethod = record[method]

  if (global === undefined && perMethod === undefined) {
    return callParams
  }

  const merged: Record<string, unknown> = {}

  if (global !== undefined) {
    for (const key of Object.keys(global)) {
      // unknown method (raw `call` escape) -> no applicability data, skip the global
      if (accepts?.includes(key)) {
        merged[key] = global[key]
      }
    }
  }

  // per-method defaults are already type-scoped to the method, so they apply ungated
  if (perMethod !== undefined) {
    Object.assign(merged, perMethod)
  }

  if (callParams !== undefined) {
    Object.assign(merged, callParams)
  }

  return merged
}
