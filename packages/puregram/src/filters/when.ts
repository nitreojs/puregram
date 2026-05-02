import type { Filter } from '@puregram/api'

import type { Middleware } from '../dispatch/hooks'
import type { AnyUpdate } from '../dispatch/on'

/**
 * gate a middleware on a filter — runs it on match, calls `next()` otherwise.
 * uses the filter's `kinds` metadata for the same fast-path as `tg.on(filter, …)`.
 * the middleware sees the narrowed update type
 *
 * @example
 * ```ts
 * tg.useHook('onUpdate', when(f.chat.private, async (u, next) => {
 *   console.log('[private]', u.kind)
 *   await next()
 * }), { priority: 'high' })
 * ```
 */
export function when<Base, Mod> (
  filter: Filter<Base, Mod>,
  mw: Middleware<Base & Mod>
) {
  const wrapped: Middleware<unknown> = async (update, next) => {
    const kinds = filter.kinds

    if (kinds !== undefined && !kinds.includes((update as AnyUpdate).kind)) {
      await next()

      return
    }

    const result = (filter as (u: unknown) => boolean | Promise<boolean>)(update)
    const matched = typeof result === 'object' && result !== null && 'then' in result
      ? await result
      : result

    if (matched) {
      await mw(update as Base & Mod, next)
    } else {
      await next()
    }
  }

  return wrapped
}
