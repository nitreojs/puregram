import type { Filter } from '@puregram/api'

import type { Middleware } from '../dispatch/hooks'
import type { AnyUpdate } from '../dispatch/on'

/**
 * gate a middleware on a filter. when the filter matches, runs the middleware;
 * otherwise calls `next()` to pass through. uses the filter's `kinds` metadata
 * to skip evaluation entirely when the update kind doesn't match — same fast-path
 * the dispatcher applies for `tg.on(filter, …)` predicates
 *
 * the wrapped middleware sees the narrowed update type from the filter's
 * type-guard, so handlers can rely on `update.text`, `update.chat.type`, etc
 *
 * @example
 * tg.useHook('onUpdate', when(f.chat.private, async (u, next) => {
 *   console.log('[private]', u.kind)
 *   await next()
 * }), { priority: 'high' })
 */
export function when<T> (filter: Filter<T>, mw: Middleware<T>) {
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
      await mw(update as T, next)
    } else {
      await next()
    }
  }

  return wrapped
}
