export type MaybeArray<T> = T | T[]

export interface ContextMatch {
  $match: RegExpMatchArray
}

export type HearFunctionCondition<T, V> = (value: V, context: T) => boolean

export type HearCondition<T, V> = HearFunctionCondition<T, V> | RegExp | string | number | boolean

export type HearObjectCondition<T extends Record<string, any>> =
  Record<string, MaybeArray<HearCondition<T, any>>> & {
    [P in keyof T]?: MaybeArray<HearCondition<T, T[P]>>
  }

export type HearConditions<T> = (
  MaybeArray<HearCondition<T, string | undefined>>
  | MaybeArray<HearObjectCondition<T>>
)
