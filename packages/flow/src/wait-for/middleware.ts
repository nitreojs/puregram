import type { UpdateKindMap } from '@puregram/api'
import type { Middleware } from 'puregram'

import type { WaiterRegistry } from './registry'

interface KindLike {
  kind: string
}

// eslint-disable-next-line local-rules/no-redundant-return-type -- type predicate is needed for narrowing
function hasKind (value: unknown): value is KindLike {
  return typeof value === 'object' && value !== null && typeof (value as KindLike).kind === 'string'
}

// eslint-disable-next-line local-rules/no-redundant-return-type -- Middleware<unknown> documents the contract
export function createWaitForMiddleware (registry: WaiterRegistry): Middleware<unknown> {
  return async (update, next) => {
    if (!hasKind(update)) {
      await next()

      return
    }

    const kind = update.kind as keyof UpdateKindMap
    const waiter = registry.match(kind, update as UpdateKindMap[typeof kind])

    if (waiter === undefined) {
      await next()

      return
    }

    waiter.resolve(update as UpdateKindMap[typeof kind])

    if (!waiter.consume) {
      await next()
    }

    // consume === true → do not call next(); short-circuits user handlers + 'low' chain
  }
}
