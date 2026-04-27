import { describe, expect, it } from 'vitest'

import { TTL_SYM, ttl, type TtlWrapped } from '../src/ttl'

describe('ttl()', () => {
  it('wraps a value with TTL_SYM, value, and t fields', () => {
    const wrapped = ttl({ a: 1 }, 5_000) as unknown as TtlWrapped<{ a: number }>

    expect(wrapped[TTL_SYM]).toBe(true)
    expect(wrapped.value).toEqual({ a: 1 })
    expect(wrapped.t).toBe(5_000)
  })

  it('default t is 30_000ms', () => {
    const wrapped = ttl('hello') as unknown as TtlWrapped<string>

    expect(wrapped.t).toBe(30_000)
  })

  it('throws if t < 0', () => {
    expect(() => ttl('x', -1)).toThrow()
  })

  it('t = 0 is allowed (treated as "no ttl" / clear by middleware)', () => {
    const wrapped = ttl('x', 0) as unknown as TtlWrapped<string>

    expect(wrapped.t).toBe(0)
  })
})
