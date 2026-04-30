import type {
  Filter,
  OnOptions,
  Priority,
  UPDATE_KINDS as UPDATE_KINDS_TYPE,
  UpdateHandler
} from '@puregram/api'
import { UPDATE_KINDS } from '@puregram/api'

import { createDebug } from '../debug'

import type { Dispatcher } from './on'

const dispatchDebug = createDebug('puregram:dispatch')

// installs one `on<Kind>` method per `UPDATE_KINDS` entry. each method routes to
// the underlying `dispatcher.on(kind, handler, priority)` for the bare-handler case
// and `dispatcher.add({ type: 'predicate', … })` when a filter is supplied — the
// dispatcher's existing kinds-metadata fast-path then skips predicate eval for
// updates whose kind is outside the filter's declared scope
//
// the typed merge happens via codegen'd `interface TelegramDispatchers` in
// `@puregram/api`'s `dispatch.ts`, which `Telegram` extends. this file only wires
// runtime — every method shares the same routing body, just bound to a different kind
export function installDispatchers (target: object, dispatcher: Dispatcher) {
  for (const kind of UPDATE_KINDS) {
    const methodName = dispatcherMethodName(kind)

    Object.defineProperty(target, methodName, {
      value: function (
        this: object,
        first: UpdateHandler<unknown> | Filter<unknown, unknown>,
        second?: UpdateHandler<unknown>,
        third?: OnOptions
      ) {
        // overload routing: filter form → predicate dispatch with handler;
        // handler form → bare-kind dispatch. options can sit on either form
        if (typeof second === 'function') {
          const filter = first as Filter<unknown, unknown>
          const handler = second
          const priority = third?.priority ?? 'normal'

          warnOnKindMismatch(filter, kind, methodName)

          dispatcher.add({
            type: 'predicate',
            predicate: filter,
            handler: handler as UpdateHandler,
            priority
          })

          return this
        }

        const handler = first as UpdateHandler<unknown>
        const priority: Priority = (second as OnOptions | undefined)?.priority ?? 'normal'

        dispatcher.on(kind, handler as UpdateHandler, priority)

        return this
      },
      writable: true,
      configurable: true,
      enumerable: false
    })
  }
}

// `message` → `onMessage`, `chat_member` → `onChatMember`,
// `proximity_alert_triggered` → `onProximityAlertTriggered`. mirrors the codegen
// in `@puregram/api`'s `emit-dispatch.ts` — both forms must agree, otherwise
// the codegen'd interface would type a method that runtime never installs
export function dispatcherMethodName (kindName: typeof UPDATE_KINDS_TYPE[number]) {
  const camel = kindName
    .split('_')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')

  return `on${camel}`
}

// non-fatal sanity check: a filter declaring `kinds: ['message_reaction']`
// installed under `tg.onMessage(...)` can never match. log via the namespaced
// debug logger so users opting into `PUREGRAM_DEBUG=puregram:dispatch` see it
function warnOnKindMismatch (filter: Filter<unknown, unknown>, kind: string, methodName: string) {
  const filterKinds = filter.kinds

  if (filterKinds && !filterKinds.includes(kind)) {
    dispatchDebug(
      'filter %o registered on tg.%s but its kinds metadata is %o — handler will never match',
      filter.name,
      methodName,
      filterKinds
    )
  }
}
