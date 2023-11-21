import type { CallbackDataBuilder } from './builder'
import type { ExistsFalseSym, ExistsTrueSym } from './filters'

export type Accepted = string | number | boolean

export type Simplify<T> = { [Key in keyof T]: T[Key] } & {}

export type Filter<Value, Sym extends symbol> = { (value: Value): boolean } & Record<Sym, true>
export type UniqueSymbol<Sym extends symbol, Id extends string> = Sym & { __id: `filters.${Id}` }

type Extract<B> = B extends CallbackDataBuilder<infer S> ? S : B

export type ConditionFn<Initial extends Accepted> = (value: Initial) => Initial | boolean

type AllowedConditionSimpleValue<Initial extends Accepted> =
  | Initial
  | ConditionFn<Initial>

export type AllowedConditionValue<Initial extends Accepted> =
  | Filter<Initial, symbol>
  | AllowedConditionSimpleValue<Initial>
  | AllowedConditionSimpleValue<Initial>[]

export type ConditionalObject<State extends Record<string, Accepted>> = {
  [Key in keyof State]?: AllowedConditionValue<State[Key]>
}

export type ValidateFilter<Initial, Sym extends symbol> =
  Sym extends ExistsTrueSym
    ? NonNullable<Initial>
    : Sym extends ExistsFalseSym
    ? undefined
    : never

export type ValidateConditions<Conditions extends ConditionalObject<Record<string, any>>> = {
  [Key in keyof Conditions]:
    Conditions[Key] extends ConditionFn<infer Initial>
      ? Initial // ConditionFn<I>
      : Conditions[Key] extends Filter<infer Initial, infer Sym>
      ? ValidateFilter<Initial, Sym> // Filter<I, S>
      : Conditions[Key] extends infer Initial extends Accepted
      ? Initial // Initial
      : Conditions[Key] extends Array<infer Initial> // AllowedConditionSimpleValue<I>[]
      ? Initial
      : Conditions[Key]
}

export interface CallbackLayer<S> {
  unpackedPayload: Extract<S>
}

declare module 'puregram' {
  interface CallbackQueryContext {
    unpackedPayload: Record<never, never>
  }
}
