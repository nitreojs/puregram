import type { Filter, UniqueSymbol } from './types'

const EXISTS_SYMBOL = Symbol('filters.exists')
type ExistsSymbol = typeof EXISTS_SYMBOL

export type ExistsTrueSym = UniqueSymbol<typeof EXISTS_SYMBOL, 'exists.true'>
export type ExistsFalseSym = UniqueSymbol<typeof EXISTS_SYMBOL, 'exists.false'>

export type ExistsSym = ExistsTrueSym | ExistsFalseSym

export function exists<Value>(exists?: true): Filter<Value, ExistsTrueSym>
export function exists<Value>(exists: false): Filter<Value, ExistsFalseSym>
export function exists<Value> (exists = true): Filter<Value, ExistsSym> {
  const filter: Filter<Value, ExistsSymbol> = (value: Value) => {
    return exists ? value !== undefined : value === undefined
  }

  filter[EXISTS_SYMBOL] = true as const

  return filter
}
