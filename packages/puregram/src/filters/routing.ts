// kind-routing filters — re-exports the codegen'd `kind` callable + shorthands and
// adds the handcrafted `kindIn` / `customKind` variants. `kind(k)` matches a single
// update kind; `kindIn(...ks)` matches any of a list; `customKind(name)` is the
// custom-update analogue, scoped to `CustomUpdate` payloads emitted via `tg.emit`

import { defineFilter } from '@puregram/api'
import type { Filter, UpdateKind, UpdateKindMap } from '@puregram/api'

import type { CustomUpdate } from '../dispatch/custom-updates'

// `kind(k)` callable + `kind.message` / `kind.editedMessage` / … shorthands
// already ship from `@puregram/api`'s codegen'd filters and reach the public
// surface via the barrel `export * from '@puregram/api'` in `./index.ts`

/**
 * match when `update.kind` is one of the supplied kinds. accepts varargs or a
 * single readonly array; result narrows to the union of `UpdateKindMap[K]` for
 * the listed kinds. `kinds` metadata is the supplied list, so the dispatcher
 * fast-path skips evaluation for unrelated updates
 */
export function kindIn<K extends UpdateKind> (kinds: readonly K[]): Filter<UpdateKindMap[K]>
export function kindIn<K extends UpdateKind> (...kinds: K[]): Filter<UpdateKindMap[K]>
export function kindIn<K extends UpdateKind> (...args: [readonly K[]] | K[]) {
  const list = (args.length === 1 && Array.isArray(args[0]) ? args[0] : args) as readonly K[]
  const set = new Set<string>(list)

  return defineFilter(
    `kindIn(${list.join(', ')})`,
    (u: unknown): u is UpdateKindMap[K] => set.has((u as { kind?: string }).kind ?? ''),
    { kinds: list }
  )
}

/**
 * match a custom update kind defined via `tg.defineUpdate(name)` and dispatched
 * via `tg.emit(name, payload)`. result narrows to `CustomUpdate` with the kind
 * literal preserved on the discriminant. mirrors `kind(k)` for bot-api updates
 */
export function customKind<N extends string> (name: N) {
  return defineFilter(
    `customKind.${name}`,
    (u: unknown): u is CustomUpdate<N> => (u as { kind?: string }).kind === name,
    { kinds: [name] }
  )
}
