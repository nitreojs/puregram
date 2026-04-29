import { defineAsyncFilter, defineFilter } from '@puregram/api'
import { describe, expect, expectTypeOf, it } from 'vitest'

describe('defineFilter', () => {
  it('produces a callable with name, and, or, not properties', () => {
    const f = defineFilter('myFilter', (_u: unknown): _u is unknown => true)

    expect(typeof f).toBe('function')
    expect(f.name).toBe('myFilter')
    expect(typeof f.and).toBe('function')
    expect(typeof f.or).toBe('function')
    expect(typeof f.not).toBe('function')
  })

  it('attaches kinds when supplied', () => {
    const f = defineFilter('m', (_u: unknown): _u is unknown => true, { kinds: ['message'] })

    expect(f.kinds).toEqual(['message'])
  })

  it('omits kinds when not supplied', () => {
    const f = defineFilter('m', (_u: unknown): _u is unknown => true)

    expect(f.kinds).toBeUndefined()
  })

  it('the predicate narrows at the call site', () => {
    interface Tagged {
      tag: 'x'
    }

    const isTagged = defineFilter(
      'isTagged',
      (u: unknown): u is Tagged =>
        typeof u === 'object' && u !== null && (u as { tag?: string }).tag === 'x'
    )

    const value: unknown = { tag: 'x' }

    if (isTagged(value)) {
      expectTypeOf(value).toEqualTypeOf<Tagged>()
      expect(value.tag).toBe('x')
    }
  })
})

describe('defineAsyncFilter', () => {
  it('produces an async-tagged filter that returns Promise<boolean>', async () => {
    const f = defineAsyncFilter('asyncTrue', async () => {
      await Promise.resolve()

      return true
    })

    expect(f.name).toBe('asyncTrue')
    expect(typeof f.and).toBe('function')

    const result = f({})

    expect(result).toBeInstanceOf(Promise)
    await expect(result).resolves.toBe(true)
  })

  it('attaches kinds metadata', () => {
    const f = defineAsyncFilter('m', () => Promise.resolve(true), { kinds: ['message'] })

    expect(f.kinds).toEqual(['message'])
  })
})
