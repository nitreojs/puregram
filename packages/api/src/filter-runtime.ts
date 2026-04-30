// composable filter primitives. lives in `@puregram/api` so codegen'd presence +
// kind shorthand filters in `generated/filters.ts` can reach `defineFilter`
// without producing a reverse dependency on `puregram`. the `puregram/filters`
// subpath re-exports everything here under a friendlier surface
//
// type model (mtcute-style two-parameter):
// - `Base` is the precondition update type — narrowed by kind/structural filters
// - `Mod` is a structural marker carrying refinements layered onto `Base` —
//   added by presence filters, parametric filters, value-narrowers
// composition intersects both: `and(a, b)` is `Filter<aBase & bBase, aMod & bMod>`.
// the dispatcher reads `Base & Mod` to type the handler argument, so a chain like
// `kind.message.and(hasText)` lands as `MessageUpdate & { text: string }` at the
// handler — `text` collapses from `string | undefined` to `string`. this avoids
// distributing conditional types like `Extract<T & U, AnyUpdate>` across the
// 50-member `AnyUpdate` union, which historically OOM'd the type-checker

import type { AnyUpdate } from './custom-update'

const ASYNC_TAG = Symbol.for('puregram.filter.async')

/**
 * static metadata attached to every `Filter` so the dispatcher can short-circuit
 * predicate evaluation when the update's `kind` is provably outside the filter's
 * declared scope, and so debug printers can render a readable name
 */
export interface FilterMeta {
  /** human-readable name, used by debug/inspect output and runtime conflict checks */
  readonly name: string
  /**
   * optional kind hint — when set, the dispatcher skips evaluating this filter for
   * updates whose `kind` is not in the list. `undefined` means "evaluate against
   * any update", which is the correct default for filters whose match domain is
   * truly kind-agnostic (composition negation, async user-defined predicates)
   */
  readonly kinds?: readonly string[]
}

/**
 * the public filter shape — a callable type-guard that narrows the input to
 * `Base`, plus attached metadata, a structural `Mod` refinement marker, and
 * fluent composition methods. accepts an `AnyUpdate` at the call site so it
 * composes uniformly across bot-api updates and `CustomUpdate`s
 *
 * `Base` and `Mod` are independent: kind/structural filters narrow `Base`,
 * presence and value filters narrow `Mod`. `and(...)` intersects both; `or(...)`
 * unions both. handlers wired through `tg.on(filter, handler)` see the arg
 * typed as `Base & Mod`, so e.g. `hasText` (Mod = `{ text: string }`) collapses
 * `MessageUpdate.text` from `string | undefined` to `string`
 *
 * raw `if (filter(u)) { ... }` checks narrow only `Base` — `Mod` flows through
 * the dispatcher signature, not through `update is Base`. for full narrowing,
 * use the dispatcher entry points (`tg.on`, `tg.use`, `when`)
 */
export interface Filter<Base = unknown, Mod = unknown> extends FilterMeta {
  (update: AnyUpdate): update is AnyUpdate & Base
  /**
   * narrow further — match when `this` AND `other` match. result intersects
   * both `Base` and `Mod` of the operands
   */
  and: <B2, M2>(other: Filter<B2, M2>) => Filter<Base & B2, Mod & M2>
  /**
   * widen — match when `this` OR `other` match. result unions both `Base` and
   * `Mod` of the operands; the dispatcher arg becomes `(B1 & M1) | (B2 & M2)`
   */
  or: <B2, M2>(other: Filter<B2, M2>) => Filter<Base | B2, Mod | M2>
  /** negate — match when `this` does not match. drops both narrowings */
  not: () => Filter<unknown, unknown>
}

/**
 * async variant — filter author returns `Promise<boolean>` instead of a synchronous
 * type-guarded boolean. async filters compose via the same operators; the resulting
 * filter is async if any operand is async (operands are awaited sequentially with
 * short-circuit, see `and` / `or`)
 */
export interface AsyncFilter<Base = unknown, Mod = unknown> extends FilterMeta {
  (update: AnyUpdate): Promise<boolean>
  and: <B2, M2>(other: Filter<B2, M2> | AsyncFilter<B2, M2>) => AsyncFilter<Base & B2, Mod & M2>
  or: <B2, M2>(other: Filter<B2, M2> | AsyncFilter<B2, M2>) => AsyncFilter<Base | B2, Mod | M2>
  not: () => AsyncFilter<unknown, unknown>
}

/** structural type for the composition method set, exposed for filter shim authors */
export type FilterMethods<Base, Mod> = Pick<Filter<Base, Mod>, 'and' | 'or' | 'not'>

/**
 * extract the `Base` narrowing from a filter type. used by `tg.on(filter, handler)`
 * and friends to type the handler argument as `ExtractBase<F> & ExtractMod<F>`
 */
export type ExtractBase<F> =
  F extends Filter<infer B, infer _M> ? B :
    F extends AsyncFilter<infer B, infer _M> ? B :
      never

/** extract the structural `Mod` refinement from a filter type */
export type ExtractMod<F> =
  F extends Filter<infer _B, infer M> ? M :
    F extends AsyncFilter<infer _B, infer M> ? M :
      never

/** combine `Base` and `Mod` into the type a handler/middleware sees for the matched update */
export type FilterMatch<F> = ExtractBase<F> & ExtractMod<F>

/**
 * structural runtime check used by `tg.use(filter, mw)` overload routing — any
 * callable with `and`/`or`/`not` properties of `function` type is treated as a
 * filter, regardless of how it was constructed. lets userland filter shims
 * participate without going through `defineFilter`
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
 * build a `Filter<Base, Mod>` from a synchronous predicate. attaches the supplied
 * `name`, optional `kinds` metadata, and fluent composition methods. the predicate
 * may be a plain `boolean` returner or a type-guard `(u): u is Base` form — when a
 * type-guard, raw `if (filter(u))` narrows `u` to `Base`. handler narrowing through
 * `tg.on(filter, h)` always uses `Base & Mod` regardless of predicate shape
 */
export function defineFilter<Base = unknown, Mod = unknown> (
  name: string,
  predicate: (update: AnyUpdate) => boolean,
  meta: DefineMeta = {}
) {
  return attachMethods<Base, Mod>(predicate, name, meta.kinds, false)
}

/**
 * async variant of `defineFilter`. the predicate returns `Promise<boolean>` and
 * does not narrow at the call site (TypeScript has no async type-guard); callers
 * either branch on the awaited boolean or compose with sync filters via `and`
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
  // intersection — if any operand is kind-agnostic (`undefined`), the result is also
  // kind-agnostic, since that operand might match anywhere. otherwise take the
  // intersection of explicit kinds
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
  // negation can match any kind not in the original set; safer to evaluate everywhere
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

// public composition factories — overloaded for narrow return types in the small-arity
// case, fallback to `Filter<AnyUpdate, unknown>` for variadic/spread input. callers
// that need narrower typing past 4 operands should compose pairwise

/**
 * intersection — match only when every operand matches. short-circuits on the first
 * operand that returns false. result intersects both `Base` and `Mod` of the operands
 */
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

/**
 * union — match when any operand matches. short-circuits on the first operand
 * that returns true. result unions both `Base` and `Mod` of the operands
 */
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
