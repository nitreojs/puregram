import type { AnyUpdate } from './custom-update'

const ASYNC_TAG = Symbol.for('puregram.filter.async')

/**
 * static metadata attached to every `Filter` — lets the dispatcher short-circuit
 * predicate eval and gives debug printers a readable name
 */
export interface FilterMeta {
  /** human-readable name, used by debug/inspect output and runtime conflict checks */
  readonly name: string
  /**
   * kind hint — dispatcher skips this filter for updates whose `kind` isn't
   * listed. `undefined` = evaluate against any update
   */
  readonly kinds?: readonly string[]
}

/**
 * the public filter shape — a callable type-guard plus metadata, a structural
 * `Mod` refinement marker, and fluent composition methods
 *
 * `Base` and `Mod` are independent: kind/structural filters narrow `Base`,
 * presence and value filters narrow `Mod`. `tg.on(filter, handler)` sees the
 * arg typed as `Base & Mod`; raw `if (filter(u))` checks narrow only `Base`
 *
 * @example
 * ```ts
 * tg.on(kind.message.and(hasText), (m) => {
 *   // m: MessageUpdate & { text: string } — `text` is no longer `string | undefined`
 *   m.text.toLowerCase()
 * })
 * ```
 */
export interface Filter<Base = unknown, Mod = unknown> extends FilterMeta {
  (update: AnyUpdate): update is AnyUpdate & Base
  /** intersect — match when both match; intersects `Base` and `Mod` */
  and: <B2, M2>(other: Filter<B2, M2>) => Filter<Base & B2, Mod & M2>
  /** union — match when either matches; unions `Base` and `Mod` */
  or: <B2, M2>(other: Filter<B2, M2>) => Filter<Base | B2, Mod | M2>
  /** negate — drops both narrowings */
  not: () => Filter<unknown, unknown>
}

/**
 * async variant — predicate returns `Promise<boolean>` instead of a sync
 * type-guarded boolean. composes with sync filters; result is async if any operand is
 */
export interface AsyncFilter<Base = unknown, Mod = unknown> extends FilterMeta {
  (update: AnyUpdate): Promise<boolean>
  and: <B2, M2>(other: Filter<B2, M2> | AsyncFilter<B2, M2>) => AsyncFilter<Base & B2, Mod & M2>
  or: <B2, M2>(other: Filter<B2, M2> | AsyncFilter<B2, M2>) => AsyncFilter<Base | B2, Mod | M2>
  not: () => AsyncFilter<unknown, unknown>
}

/** structural type for the composition method set, exposed for filter shim authors */
export type FilterMethods<Base, Mod> = Pick<Filter<Base, Mod>, 'and' | 'or' | 'not'>

/** extract the `Base` narrowing from a filter type — used by `tg.on(filter, handler)` to type the handler arg */
export type ExtractBase<F> =
  F extends Filter<infer B, infer _M> ? B :
    F extends AsyncFilter<infer B, infer _M> ? B :
      never

/** extract the structural `Mod` refinement from a filter type */
export type ExtractMod<F> =
  F extends Filter<infer _B, infer M> ? M :
    F extends AsyncFilter<infer _B, infer M> ? M :
      never

/** combine `Base` and `Mod` into the type a handler sees for the matched update */
export type FilterMatch<F> = ExtractBase<F> & ExtractMod<F>

/**
 * structural runtime check — any callable with `and`/`or`/`not` function props
 * counts as a filter, so userland shims work without going through `defineFilter`
 */
export function isFilter (value: unknown): value is Filter {
  if (typeof value !== 'function') {
    return false
  }

  const v = value as { and?: unknown, or?: unknown, not?: unknown }

  return typeof v.and === 'function' &&
    typeof v.or === 'function' &&
    typeof v.not === 'function'
}

interface DefineMeta {
  kinds?: readonly string[]
}

interface AsyncTagged {
  [ASYNC_TAG]?: true
}

function isAsync (value: unknown) {
  return typeof value === 'function' && (value as AsyncTagged)[ASYNC_TAG] === true
}

function attachMethods<Base = unknown, Mod = unknown> (
  predicate: (update: AnyUpdate) => unknown,
  name: string,
  kinds: readonly string[] | undefined,
  async: boolean
) {
  const tagged = predicate as Filter<Base, Mod> & AsyncTagged

  Object.defineProperty(tagged, 'name', { value: name, configurable: true })

  if (kinds !== undefined) {
    Object.defineProperty(tagged, 'kinds', { value: kinds, enumerable: true })
  }

  if (async) {
    tagged[ASYNC_TAG] = true
  }

  tagged.and = function and<B2, M2> (other: Filter<B2, M2>) {
    return andFilter(this as Filter, other as Filter) as unknown as Filter<Base & B2, Mod & M2>
  }

  tagged.or = function or<B2, M2> (other: Filter<B2, M2>) {
    return orFilter(this as Filter, other as Filter) as unknown as Filter<Base | B2, Mod | M2>
  }

  tagged.not = function not () {
    return notFilter(this as Filter)
  }

  return tagged as Filter<Base, Mod>
}

/**
 * build a `Filter<Base, Mod>` from a sync predicate. predicate may be a plain
 * `boolean` returner or a type-guard `(u): u is Base` — type-guards make raw
 * `if (filter(u))` narrow `u` to `Base`; `tg.on(filter, h)` always sees `Base & Mod`
 */
export function defineFilter<Base = unknown, Mod = unknown> (
  name: string,
  predicate: (update: AnyUpdate) => boolean,
  meta: DefineMeta = {}
) {
  return attachMethods<Base, Mod>(predicate, name, meta.kinds, false)
}

/**
 * async variant of `defineFilter` — predicate returns `Promise<boolean>` and
 * doesn't narrow at the call site (TS has no async type-guard)
 */
export function defineAsyncFilter<Base = unknown, Mod = unknown> (
  name: string,
  predicate: (update: AnyUpdate) => Promise<boolean>,
  meta: DefineMeta = {}
) {
  return attachMethods<Base, Mod>(predicate, name, meta.kinds, true) as unknown as AsyncFilter<Base, Mod>
}

type AnyFilter = Filter | AsyncFilter

function intersectKinds (filters: readonly AnyFilter[]) {
  // any kind-agnostic operand poisons the whole result — that operand could match anywhere
  let acc: Set<string> | undefined

  for (const f of filters) {
    if (f.kinds === undefined) {
      return undefined
    }

    if (acc === undefined) {
      acc = new Set(f.kinds)
      continue
    }

    for (const k of [...acc]) {
      if (!f.kinds.includes(k)) {
        acc.delete(k)
      }
    }
  }

  return acc === undefined ? undefined : [...acc]
}

function unionKinds (filters: readonly AnyFilter[]) {
  const acc = new Set<string>()

  for (const f of filters) {
    if (f.kinds === undefined) {
      return undefined
    }

    for (const k of f.kinds) {
      acc.add(k)
    }
  }

  return [...acc]
}

function joinNames (op: string, filters: readonly AnyFilter[]) {
  return `${op}(${filters.map(f => f.name).join(', ')})`
}

function andFilter (...filters: readonly AnyFilter[]) {
  const anyAsync = filters.some(isAsync)
  const name = joinNames('and', filters)
  const kinds = intersectKinds(filters)

  if (anyAsync) {
    const pred = async (update: AnyUpdate) => {
      for (const f of filters) {
        const r = await (f as (u: unknown) => boolean | Promise<boolean>)(update)

        if (!r) {
          return false
        }
      }

      return true
    }

    return attachMethods(pred, name, kinds, true)
  }

  const pred = (update: AnyUpdate): update is AnyUpdate => {
    for (const f of filters) {
      if (!(f as Filter)(update)) {
        return false
      }
    }

    return true
  }

  return attachMethods(pred, name, kinds, false)
}

function orFilter (...filters: readonly AnyFilter[]) {
  const anyAsync = filters.some(isAsync)
  const name = joinNames('or', filters)
  const kinds = unionKinds(filters)

  if (anyAsync) {
    const pred = async (update: AnyUpdate) => {
      for (const f of filters) {
        const r = await (f as (u: unknown) => boolean | Promise<boolean>)(update)

        if (r) {
          return true
        }
      }

      return false
    }

    return attachMethods(pred, name, kinds, true)
  }

  const pred = (update: AnyUpdate): update is AnyUpdate => {
    for (const f of filters) {
      if ((f as Filter)(update)) {
        return true
      }
    }

    return false
  }

  return attachMethods(pred, name, kinds, false)
}

function notFilter (filter: AnyFilter) {
  // negation might match outside the original kind set — evaluate everywhere
  const name = `not(${filter.name})`
  const async = isAsync(filter)

  if (async) {
    const pred = async (update: AnyUpdate) => {
      const r = await (filter as (u: unknown) => boolean | Promise<boolean>)(update)

      return !r
    }

    return attachMethods(pred, name, undefined, true)
  }

  const pred = (update: AnyUpdate): update is AnyUpdate => !(filter as Filter)(update)

  return attachMethods(pred, name, undefined, false)
}

/** intersection — short-circuits on the first false operand. intersects `Base` and `Mod` */
export function and<B1, M1> (a: Filter<B1, M1>): Filter<B1, M1>
export function and<B1, M1, B2, M2> (
  a: Filter<B1, M1>, b: Filter<B2, M2>
): Filter<B1 & B2, M1 & M2>
export function and<B1, M1, B2, M2, B3, M3> (
  a: Filter<B1, M1>, b: Filter<B2, M2>, c: Filter<B3, M3>
): Filter<B1 & B2 & B3, M1 & M2 & M3>
export function and<B1, M1, B2, M2, B3, M3, B4, M4> (
  a: Filter<B1, M1>, b: Filter<B2, M2>, c: Filter<B3, M3>, d: Filter<B4, M4>
): Filter<B1 & B2 & B3 & B4, M1 & M2 & M3 & M4>
export function and (...filters: readonly AnyFilter[]): Filter<unknown, unknown>
export function and (...filters: readonly AnyFilter[]) {
  return andFilter(...filters)
}

/** union — short-circuits on the first true operand. unions `Base` and `Mod` */
export function or<B1, M1> (a: Filter<B1, M1>): Filter<B1, M1>
export function or<B1, M1, B2, M2> (
  a: Filter<B1, M1>, b: Filter<B2, M2>
): Filter<B1 | B2, M1 | M2>
export function or<B1, M1, B2, M2, B3, M3> (
  a: Filter<B1, M1>, b: Filter<B2, M2>, c: Filter<B3, M3>
): Filter<B1 | B2 | B3, M1 | M2 | M3>
export function or<B1, M1, B2, M2, B3, M3, B4, M4> (
  a: Filter<B1, M1>, b: Filter<B2, M2>, c: Filter<B3, M3>, d: Filter<B4, M4>
): Filter<B1 | B2 | B3 | B4, M1 | M2 | M3 | M4>
export function or (...filters: readonly AnyFilter[]): Filter<unknown, unknown>
export function or (...filters: readonly AnyFilter[]) {
  return orFilter(...filters)
}

/** negation — match when the operand does not match. drops both `Base` and `Mod` narrowing */
export function not (filter: AnyFilter) {
  return notFilter(filter)
}

/** alias for `and` — reads more naturally for "every operand must match" intents */
export const every = and

/** alias for `or` — reads more naturally for "any operand may match" intents */
export const some = or
