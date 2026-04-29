// composable type-guarded predicates with attached metadata. lives in `@puregram/api`
// so codegen'd presence + enum-shorthand filters in `generated/filters.ts` can reach
// for `defineFilter` without producing a reverse dependency on `puregram`. the
// `puregram/filters` subpath re-exports everything here under a friendlier surface

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
 * the public filter shape — a callable type-guard plus attached metadata and
 * fluent composition methods. accepts an `unknown`-typed update at the call site
 * so it composes uniformly across bot-api updates and `CustomUpdate`s; specific
 * filter authors narrow `T` to the type they intend to match
 *
 * the chained-form composition methods (`and`/`or`/`not`) delegate to the
 * corresponding factories — `a.and(b)` and `and(a, b)` produce equivalent results
 */
export interface Filter<T = unknown> extends FilterMeta {
  (update: unknown): update is T
  /** narrow further — match when `this` AND `other` match. result is typed as the intersection */
  and: <U>(other: Filter<U>) => Filter<T & U>
  /** widen — match when `this` OR `other` match. result is typed as the union */
  or: <U>(other: Filter<U>) => Filter<T | U>
  /** negate — match when `this` does not match. result drops type narrowing */
  not: () => Filter<unknown>
}

/**
 * async variant — filter author returns `Promise<boolean>` instead of a synchronous
 * type-guarded boolean. async filters compose via the same operators; the resulting
 * filter is async if any operand is async (operands are awaited sequentially with
 * short-circuit, see `and` / `or`)
 */
export interface AsyncFilter<T = unknown> extends FilterMeta {
  (update: unknown): Promise<boolean>
  and: <U>(other: Filter<U>) => Filter<T & U>
  or: <U>(other: Filter<U>) => Filter<T | U>
  not: () => Filter<unknown>
}

/** structural type for the composition method set, exposed for filter shim authors */
export type FilterMethods<T> = Pick<Filter<T>, 'and' | 'or' | 'not'>

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

function attachMethods<T> (
  predicate: (update: unknown) => unknown,
  name: string,
  kinds: readonly string[] | undefined,
  async: boolean
) {
  const tagged = predicate as Filter<T> & AsyncTagged

  Object.defineProperty(tagged, 'name', { value: name, configurable: true })

  if (kinds !== undefined) {
    Object.defineProperty(tagged, 'kinds', { value: kinds, enumerable: true })
  }

  if (async) {
    tagged[ASYNC_TAG] = true
  }

  tagged.and = function and<U> (other: Filter<U>) {
    return andFilter(this as Filter<T>, other) as Filter<T & U>
  }

  tagged.or = function or<U> (other: Filter<U>) {
    return orFilter(this as Filter<T>, other) as Filter<T | U>
  }

  tagged.not = function not () {
    return notFilter(this as Filter<T>)
  }

  return tagged as Filter<T>
}

/**
 * build a `Filter<T>` from a synchronous type-guard predicate. attaches the supplied
 * `name`, optional `kinds` metadata, and fluent composition methods. the returned
 * value is callable and behaves as a type-guard at the call site, so `if (filter(u))`
 * narrows `u` to `T`
 */
export function defineFilter<T> (
  name: string,
  predicate: (update: unknown) => update is T,
  meta: DefineMeta = {}
) {
  return attachMethods<T>(predicate, name, meta.kinds, false)
}

/**
 * async variant of `defineFilter`. the predicate returns `Promise<boolean>` and
 * does not narrow at the call site (TypeScript has no async type-guard); callers
 * either branch on the awaited boolean or compose with sync filters via `and`
 */
export function defineAsyncFilter<T> (
  name: string,
  predicate: (update: unknown) => Promise<boolean>,
  meta: DefineMeta = {}
) {
  return attachMethods<T>(predicate, name, meta.kinds, true) as unknown as AsyncFilter<T>
}

type AnyFilter = Filter<unknown> | AsyncFilter<unknown>

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
    const pred = async (update: unknown) => {
      for (const f of filters) {
        const r = await (f as (u: unknown) => boolean | Promise<boolean>)(update)

        if (!r) {
          return false
        }
      }

      return true
    }

    return attachMethods<unknown>(pred, name, kinds, true)
  }

  const pred = (update: unknown): update is unknown => {
    for (const f of filters) {
      if (!(f as Filter)(update)) {
        return false
      }
    }

    return true
  }

  return attachMethods<unknown>(pred, name, kinds, false)
}

function orFilter (...filters: readonly AnyFilter[]) {
  const anyAsync = filters.some(isAsync)
  const name = joinNames('or', filters)
  const kinds = unionKinds(filters)

  if (anyAsync) {
    const pred = async (update: unknown) => {
      for (const f of filters) {
        const r = await (f as (u: unknown) => boolean | Promise<boolean>)(update)

        if (r) {
          return true
        }
      }

      return false
    }

    return attachMethods<unknown>(pred, name, kinds, true)
  }

  const pred = (update: unknown): update is unknown => {
    for (const f of filters) {
      if ((f as Filter)(update)) {
        return true
      }
    }

    return false
  }

  return attachMethods<unknown>(pred, name, kinds, false)
}

function notFilter (filter: AnyFilter) {
  // negation can match any kind not in the original set; safer to evaluate everywhere
  const name = `not(${filter.name})`
  const async = isAsync(filter)

  if (async) {
    const pred = async (update: unknown) => {
      const r = await (filter as (u: unknown) => boolean | Promise<boolean>)(update)

      return !r
    }

    return attachMethods<unknown>(pred, name, undefined, true)
  }

  const pred = (update: unknown): update is unknown => !(filter as Filter)(update)

  return attachMethods<unknown>(pred, name, undefined, false)
}

// public composition factories — overloaded for narrow return types in the small-arity
// case, fallback to `Filter<unknown>` for variadic/spread input. callers that need
// narrower typing past 4 operands should compose pairwise (`a.and(b).and(c).and(d).and(e)`)

/**
 * intersection — match only when every operand matches. short-circuits on the first
 * operand that returns false. returns a filter typed as the type-guard intersection
 * of all operands
 */
export function and<A> (a: Filter<A>): Filter<A>
export function and<A, B> (a: Filter<A>, b: Filter<B>): Filter<A & B>
export function and<A, B, C> (a: Filter<A>, b: Filter<B>, c: Filter<C>): Filter<A & B & C>
export function and<A, B, C, D> (a: Filter<A>, b: Filter<B>, c: Filter<C>, d: Filter<D>): Filter<A & B & C & D>
export function and (...filters: readonly AnyFilter[]): Filter<unknown>
export function and (...filters: readonly AnyFilter[]) {
  return andFilter(...filters)
}

/**
 * union — match when any operand matches. short-circuits on the first operand
 * that returns true. returns a filter typed as the type-guard union of all operands
 */
export function or<A> (a: Filter<A>): Filter<A>
export function or<A, B> (a: Filter<A>, b: Filter<B>): Filter<A | B>
export function or<A, B, C> (a: Filter<A>, b: Filter<B>, c: Filter<C>): Filter<A | B | C>
export function or<A, B, C, D> (a: Filter<A>, b: Filter<B>, c: Filter<C>, d: Filter<D>): Filter<A | B | C | D>
export function or (...filters: readonly AnyFilter[]): Filter<unknown>
export function or (...filters: readonly AnyFilter[]) {
  return orFilter(...filters)
}

/** negation — match when the operand does not match. drops type narrowing */
export function not (filter: AnyFilter) {
  return notFilter(filter)
}

/** alias for `and` — reads more naturally for "every operand must match" intents */
export const every = and

/** alias for `or` — reads more naturally for "any operand may match" intents */
export const some = or
