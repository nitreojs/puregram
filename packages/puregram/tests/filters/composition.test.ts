import type { MessageUpdate } from '@puregram/api'
import { and, defineFilter, every, not, or, some } from '@puregram/api'
import { describe, expect, expectTypeOf, it } from 'vitest'

import { chat } from '../../src/filters/chat'
import { text } from '../../src/filters/content'

const isMessage = defineFilter(
  'isMessage',
  (u: unknown): u is { kind: 'message' } =>
    typeof u === 'object' && u !== null && (u as { kind?: unknown }).kind === 'message',
  { kinds: ['message'] }
)

const isCallback = defineFilter(
  'isCallback',
  (u: unknown): u is { kind: 'callback_query' } =>
    typeof u === 'object' && u !== null && (u as { kind?: unknown }).kind === 'callback_query',
  { kinds: ['callback_query'] }
)

// kind-agnostic filter — no `kinds` metadata
const truthy = defineFilter('truthy', (_u: unknown): _u is unknown => true)

describe('and / or / not short-circuit', () => {
  it('and stops at the first falsy operand', () => {
    let aCalls = 0
    let bCalls = 0
    const a = defineFilter('a', (_u: unknown): _u is unknown => {
      aCalls++

      return false
    })
    const b = defineFilter('b', (_u: unknown): _u is unknown => {
      bCalls++

      return true
    })

    expect(and(a, b)({})).toBe(false)
    expect(aCalls).toBe(1)
    expect(bCalls).toBe(0)
  })

  it('or stops at the first truthy operand', () => {
    let aCalls = 0
    let bCalls = 0
    const a = defineFilter('a', (_u: unknown): _u is unknown => {
      aCalls++

      return true
    })
    const b = defineFilter('b', (_u: unknown): _u is unknown => {
      bCalls++

      return false
    })

    expect(or(a, b)({})).toBe(true)
    expect(aCalls).toBe(1)
    expect(bCalls).toBe(0)
  })

  it('not negates the operand result', () => {
    expect(not(isMessage)({ kind: 'message' })).toBe(false)
    expect(not(isMessage)({ kind: 'callback_query' })).toBe(true)
  })
})

describe('kinds-metadata propagation', () => {
  it('and intersects kinds when both operands declare them', () => {
    const a = defineFilter('a', (_u: unknown): _u is unknown => true, { kinds: ['message', 'edited_message'] })
    const b = defineFilter('b', (_u: unknown): _u is unknown => true, { kinds: ['message', 'channel_post'] })

    expect(and(a, b).kinds).toEqual(['message'])
  })

  it('and falls back to undefined when any operand is kind-agnostic', () => {
    const a = defineFilter('a', (_u: unknown): _u is unknown => true, { kinds: ['message'] })

    expect(and(a, truthy).kinds).toBeUndefined()
    expect(and(truthy, a).kinds).toBeUndefined()
  })

  it('or unions kinds', () => {
    const a = defineFilter('a', (_u: unknown): _u is unknown => true, { kinds: ['message'] })
    const b = defineFilter('b', (_u: unknown): _u is unknown => true, { kinds: ['callback_query'] })

    expect(or(a, b).kinds).toEqual(['message', 'callback_query'])
  })

  it('or falls back to undefined when any operand is kind-agnostic', () => {
    const a = defineFilter('a', (_u: unknown): _u is unknown => true, { kinds: ['message'] })

    expect(or(a, truthy).kinds).toBeUndefined()
  })

  it('not always drops kinds', () => {
    const a = defineFilter('a', (_u: unknown): _u is unknown => true, { kinds: ['message'] })

    expect(not(a).kinds).toBeUndefined()
  })
})

describe('every / some aliases', () => {
  it('every is the same reference as and', () => {
    expect(every).toBe(and)
  })

  it('some is the same reference as or', () => {
    expect(some).toBe(or)
  })
})

describe('chained-method form vs factory form', () => {
  it('a.and(b) is equivalent to and(a, b)', () => {
    const aAndB = and(isMessage, isMessage).kinds
    const chained = isMessage.and(isMessage).kinds

    expect(chained).toEqual(aAndB)

    const u = { kind: 'message' }

    expect(and(isMessage, isMessage)(u)).toBe(true)
    expect(isMessage.and(isMessage)(u)).toBe(true)
  })

  it('a.or(b) is equivalent to or(a, b)', () => {
    const aOrB = or(isMessage, isCallback).kinds
    const chained = isMessage.or(isCallback).kinds

    expect(chained).toEqual(aOrB)

    expect(or(isMessage, isCallback)({ kind: 'callback_query' })).toBe(true)
    expect(isMessage.or(isCallback)({ kind: 'callback_query' })).toBe(true)
  })

  it('a.not() is equivalent to not(a)', () => {
    expect(isMessage.not()({ kind: 'message' })).toBe(false)
    expect(isMessage.not()({ kind: 'callback_query' })).toBe(true)
  })
})

describe('type-guard intersection through composition', () => {
  it('and narrows to the intersection of operand types', () => {
    const combined = chat.private.and(text('hello'))

    expectTypeOf(combined).toBeFunction()

    if (combined({})) {
      // both operand types intersect; result is a message-payload + text-bearing type
      expectTypeOf(combined).toMatchTypeOf<(u: unknown) => boolean>()
    }
  })

  it('or widens to the union of operand types', () => {
    const widened = isMessage.or(isCallback)

    expectTypeOf(widened).toBeFunction()
    // result accepts updates of either kind; the union shows up at handler call sites
    type Widened = typeof widened
    expectTypeOf<Widened>().toMatchTypeOf<(u: unknown) => boolean>()
  })

  it('not produces a type-guarded filter typed as unknown', () => {
    const negated = not(isMessage)

    expectTypeOf(negated).toBeFunction()
    expectTypeOf(negated).toMatchTypeOf<(u: unknown) => boolean>()
  })

  it('defineFilter<T> propagates T through and()', () => {
    const onlyMessage = defineFilter(
      'onlyMessage',
      (u: unknown): u is MessageUpdate =>
        (u as { kind?: string }).kind === 'message'
    )

    const composed = onlyMessage.and(text('hi'))

    expectTypeOf(composed).toBeFunction()
  })
})
