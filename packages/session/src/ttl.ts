export const PROXY_SYM = Symbol('proxy')
export const TTL_SYM = Symbol('ttl')

// ttl bookkeeping rides on the stored record under this key so lazy expiry survives a
// storage round trip — stripped on load, so it never reaches `update.session`
export const TTL_KEY = '__ttl'

export interface TtlData {
  t: number
  at: number
}

export interface TtlWrapped<T> {
  [TTL_SYM]: true
  value: T
  t: number
}

/**
 * marks a value to expire `t` ms after it was last set (lazy — checked on read)
 * `t === 0` clears any existing ttl for the key on assignment
 */
export function ttl<T> (value: T, t = 30_000): T {
  if (t < 0) {
    throw new Error('could not ttl a value with t < 1')
  }

  return {
    [TTL_SYM]: true,
    value,
    t
  } as unknown as T
}
