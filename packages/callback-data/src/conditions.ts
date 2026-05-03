import type { Accepted } from './types'

const PRESENT_TAG = Symbol.for('puregram.callback-data.present')
const MISSING_TAG = Symbol.for('puregram.callback-data.missing')

export interface PresentMarker {
  readonly [PRESENT_TAG]: true
}

export interface MissingMarker {
  readonly [MISSING_TAG]: true
}

/** matches when the field is provided in the unpacked payload */
export const present: PresentMarker = { [PRESENT_TAG]: true }

/** matches when the field is absent from the unpacked payload */
export const missing: MissingMarker = { [MISSING_TAG]: true }

export type Predicate<V> = (value: V) => unknown
export type SimpleMatcher<V> = V | Predicate<V>
export type Matcher<V> =
  | SimpleMatcher<V>
  | readonly SimpleMatcher<V>[]
  | PresentMarker
  | MissingMarker

export type ConditionalObject<S extends Record<string, Accepted>> = {
  [Key in keyof S]?: Matcher<S[Key]>
}

/**
 * narrow `S[K]` for each condition key based on its matcher shape:
 * - `missing` → undefined
 * - `present` → NonNullable<S[K]>
 * - literal value → that literal
 * - array of matchers → narrowed to literal union members
 * - predicate → no narrowing
 */
export type ValidateConditions<C, S> = {
  [Key in keyof C & keyof S]:
    C[Key] extends MissingMarker ? undefined :
      C[Key] extends PresentMarker ? NonNullable<S[Key]> :
        C[Key] extends Predicate<S[Key]> ? S[Key] :
          C[Key] extends readonly (infer V)[] ?
            Extract<V, S[Key]> extends never ? S[Key] : Extract<V, S[Key]>
            : C[Key] extends S[Key] ? C[Key] : S[Key]
}

function isPresentMarker (value: unknown): value is PresentMarker {
  return typeof value === 'object' && value !== null && PRESENT_TAG in value
}

function isMissingMarker (value: unknown): value is MissingMarker {
  return typeof value === 'object' && value !== null && MISSING_TAG in value
}

function evaluateMatcher (matcher: unknown, value: unknown): boolean {
  if (isPresentMarker(matcher)) {
    return value !== undefined
  }

  if (isMissingMarker(matcher)) {
    return value === undefined
  }

  if (Array.isArray(matcher)) {
    return matcher.some(m => evaluateMatcher(m, value))
  }

  if (typeof matcher === 'function') {
    const result = (matcher as Predicate<unknown>)(value)

    if (typeof result === 'boolean') {
      return result
    }

    // non-boolean predicate returns: treat as a re-comparison against the original value
    return result === value
  }

  return matcher === value
}

/** returns true iff every condition object is satisfied by the unpacked payload */
export function conditionsPass (
  conditions: readonly Record<string, unknown>[],
  state: Record<string, unknown>
) {
  for (const cond of conditions) {
    for (const [key, matcher] of Object.entries(cond)) {
      if (!evaluateMatcher(matcher, state[key])) {
        return false
      }
    }
  }

  return true
}
