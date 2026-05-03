import { describe, expect, it } from 'vitest'

import { packBody, staticHeaderBits, unpackBody } from '../src/encoder'
import { CallbackDataInvalid } from '../src/errors'
import type { FieldSpec } from '../src/types'

const codeUnitsToString = (codes: number[]) => {
  let out = ''

  for (const c of codes) {
    out += String.fromCharCode(c)
  }

  return out
}

const roundtrip = (fields: FieldSpec[], state: Record<string, unknown>) => {
  const codes = packBody(fields, state)
  const data = codeUnitsToString(codes)

  return unpackBody(fields, data)
}

describe('staticHeaderBits', () => {
  it('returns 0 for empty schemas and required strings/numbers', () => {
    expect(staticHeaderBits([])).toBe(0)
    expect(staticHeaderBits([
      field('a', 'string'),
      field('b', 'number')
    ])).toBe(0)
  })

  it('counts 1 bit per non-optional boolean', () => {
    expect(staticHeaderBits([
      field('x', 'boolean')
    ])).toBe(1)
  })

  it('counts presence + value bits for optional booleans', () => {
    expect(staticHeaderBits([
      field('x', 'boolean', { optional: true })
    ])).toBe(2)
  })

  it('counts ceil(log2(N)) bits for literals', () => {
    expect(staticHeaderBits([{
      key: 'k', type: 'literal', optional: false, values: ['a', 'b', 'c', 'd'], bits: 2
    }])).toBe(2)

    expect(staticHeaderBits([{
      key: 'k', type: 'literal', optional: true, values: ['a', 'b'], bits: 1
    }])).toBe(2)
  })
})

describe('encoder — single-field roundtrip', () => {
  it('roundtrips required strings of varying length', () => {
    const fields = [field('s', 'string')]

    for (const s of ['', 'a', 'abc', 'hello world', 'x'.repeat(100), 'x'.repeat(127)]) {
      expect(roundtrip(fields, { s })).toEqual({ s })
    }
  })

  it('roundtrips required numbers across the safe-int range', () => {
    const fields = [field('n', 'number')]
    const samples = [
      0, 1, -1, 42, -42, 127, -128, 1024, -1024,
      1234567890, -1234567890, 1001234567890, -1001234567890,
      Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER
    ]

    for (const n of samples) {
      expect(roundtrip(fields, { n })).toEqual({ n })
    }
  })

  it('roundtrips required booleans', () => {
    const fields = [field('b', 'boolean')]

    expect(roundtrip(fields, { b: true })).toEqual({ b: true })
    expect(roundtrip(fields, { b: false })).toEqual({ b: false })
  })

  it('roundtrips required literals', () => {
    const fields = [literal('k', ['a', 'b', 'c'])]

    expect(roundtrip(fields, { k: 'a' })).toEqual({ k: 'a' })
    expect(roundtrip(fields, { k: 'b' })).toEqual({ k: 'b' })
    expect(roundtrip(fields, { k: 'c' })).toEqual({ k: 'c' })
  })

  it('roundtrips a single-value literal (zero bits)', () => {
    const fields = [literal('k', ['only'])]

    expect(roundtrip(fields, { k: 'only' })).toEqual({ k: 'only' })
  })

  it('handles literals with non-power-of-2 sizes', () => {
    const fields = [literal('k', ['a', 'b', 'c', 'd', 'e', 'f', 'g'])]

    for (const v of ['a', 'b', 'c', 'd', 'e', 'f', 'g']) {
      expect(roundtrip(fields, { k: v })).toEqual({ k: v })
    }
  })
})

describe('encoder — optional fields', () => {
  it('preserves omitted optional fields as undefined', () => {
    const fields = [
      field('a', 'string'),
      field('b', 'string', { optional: true })
    ]

    expect(roundtrip(fields, { a: 'foo' })).toEqual({ a: 'foo' })
    expect(roundtrip(fields, { a: 'foo', b: 'bar' })).toEqual({ a: 'foo', b: 'bar' })
  })

  it('handles optional booleans (present and absent)', () => {
    const fields = [field('b', 'boolean', { optional: true })]

    expect(roundtrip(fields, {})).toEqual({})
    expect(roundtrip(fields, { b: true })).toEqual({ b: true })
    expect(roundtrip(fields, { b: false })).toEqual({ b: false })
  })

  it('handles optional literals (present and absent)', () => {
    const fields = [literal('k', ['x', 'y', 'z'], { optional: true })]

    expect(roundtrip(fields, {})).toEqual({})
    expect(roundtrip(fields, { k: 'y' })).toEqual({ k: 'y' })
  })

  it('handles optional number (present and absent)', () => {
    const fields = [field('n', 'number', { optional: true })]

    expect(roundtrip(fields, {})).toEqual({})
    expect(roundtrip(fields, { n: 0 })).toEqual({ n: 0 })
    expect(roundtrip(fields, { n: -42 })).toEqual({ n: -42 })
  })
})

describe('encoder — defaults', () => {
  it('substitutes default for missing required field', () => {
    const fields = [field('n', 'number', { default: 42 })]

    expect(roundtrip(fields, {})).toEqual({ n: 42 })
  })

  it('takes provided value over default', () => {
    const fields = [field('n', 'number', { default: 42 })]

    expect(roundtrip(fields, { n: 7 })).toEqual({ n: 7 })
  })
})

describe('encoder — invalid input', () => {
  it('throws on missing required field with no default', () => {
    const fields = [field('n', 'number')]

    expect(() => packBody(fields, {})).toThrow(CallbackDataInvalid)
  })

  it('throws on wrong type for boolean', () => {
    const fields = [field('b', 'boolean')]

    expect(() => packBody(fields, { b: 'true' })).toThrow(CallbackDataInvalid)
  })

  it('throws on non-integer number', () => {
    const fields = [field('n', 'number')]

    expect(() => packBody(fields, { n: 1.5 })).toThrow(CallbackDataInvalid)
  })

  it('throws on infinite/NaN number', () => {
    const fields = [field('n', 'number')]

    expect(() => packBody(fields, { n: NaN })).toThrow(CallbackDataInvalid)
    expect(() => packBody(fields, { n: Infinity })).toThrow(CallbackDataInvalid)
  })

  it('throws on string overflow', () => {
    const fields = [field('s', 'string')]

    expect(() => packBody(fields, { s: 'x'.repeat(128) })).toThrow(CallbackDataInvalid)
  })

  it('throws on literal value not in set', () => {
    const fields = [literal('k', ['a', 'b'])]

    expect(() => packBody(fields, { k: 'c' })).toThrow(CallbackDataInvalid)
  })
})

describe('encoder — malformed wire input', () => {
  const fields = [field('s', 'string')]

  it('returns null on truncated string', () => {
    // length byte says 100 but body has only 3 chars
    const wire = String.fromCharCode(100) + 'abc'

    expect(unpackBody(fields, wire)).toBeNull()
  })

  it('returns null on leftover trailing bytes', () => {
    const codes = packBody(fields, { s: 'foo' })
    const data = codeUnitsToString(codes) + 'extra'

    expect(unpackBody(fields, data)).toBeNull()
  })

  it('returns null on out-of-range literal index', () => {
    // schema with 4 values uses 2 bits, but we'll encode index 3 then read against schema with 3 values
    const wide = [literal('k', ['a', 'b', 'c', 'd'])]
    const narrow = [literal('k', ['a', 'b', 'c'])]
    const codes = packBody(wide, { k: 'd' })

    expect(unpackBody(narrow, codeUnitsToString(codes))).toBeNull()
  })
})

describe('encoder — combined schemas', () => {
  it('roundtrips a kitchen-sink schema', () => {
    const fields: FieldSpec[] = [
      field('id', 'number'),
      field('flag', 'boolean'),
      literal('kind', ['view', 'edit', 'delete']),
      field('reason', 'string', { optional: true }),
      field('count', 'number', { optional: true }),
      field('confirmed', 'boolean', { optional: true })
    ]

    const states = [
      { id: 1, flag: true, kind: 'view' },
      { id: -1001, flag: false, kind: 'edit', reason: 'spam' },
      { id: 999, flag: true, kind: 'delete', reason: 'flood', count: 5 },
      { id: 0, flag: false, kind: 'view', count: 0, confirmed: true },
      { id: Number.MAX_SAFE_INTEGER, flag: true, kind: 'edit', confirmed: false }
    ]

    for (const state of states) {
      expect(roundtrip(fields, state)).toEqual(state)
    }
  })

  it('packs a 7-boolean schema in one header byte plus zero body', () => {
    const fields: FieldSpec[] = []

    for (const k of ['a', 'b', 'c', 'd', 'e', 'f', 'g']) {
      fields.push(field(k, 'boolean'))
    }

    const state = { a: true, b: false, c: true, d: true, e: false, f: false, g: true }
    const codes = packBody(fields, state)

    expect(codes.length).toBe(1)
    expect(unpackBody(fields, codeUnitsToString(codes))).toEqual(state)
  })
})

describe('encoder — fuzz', () => {
  it('roundtrips 2000 randomly-generated schema+state pairs', () => {
    const rng = makeRng(0xBEEF)

    for (let trial = 0; trial < 2000; trial += 1) {
      const fieldCount = 1 + Math.floor(rng() * 6)
      const fields: FieldSpec[] = []

      for (let i = 0; i < fieldCount; i += 1) {
        fields.push(randomField(rng, `f${i}`))
      }

      const state = randomState(rng, fields)
      const codes = packBody(fields, state)
      const data = codeUnitsToString(codes)
      const roundtripped = unpackBody(fields, data)

      expect(roundtripped).toEqual(stripUndefined(state))
    }
  })
})

function field (
  key: string,
  type: 'string' | 'number' | 'boolean',
  opts: { optional?: boolean, default?: unknown } = {}
) {
  const spec: FieldSpec = {
    key,
    type,
    optional: opts.optional ?? false
  }

  if (opts.default !== undefined) {
    spec.default = opts.default as never
  }

  return spec
}

function literal (
  key: string,
  values: string[],
  opts: { optional?: boolean, default?: string } = {}
): FieldSpec {
  const spec: FieldSpec = {
    key,
    type: 'literal',
    optional: opts.optional ?? false,
    values,
    bits: values.length === 1 ? 0 : Math.ceil(Math.log2(values.length))
  }

  if (opts.default !== undefined) {
    spec.default = opts.default
  }

  return spec
}

function makeRng (seed: number) {
  let s = seed

  return () => {
    s = (s + 0x6D2B79F5) >>> 0

    let t = s

    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function randomField (rng: () => number, key: string) {
  const types: ('string' | 'number' | 'boolean' | 'literal')[] = ['string', 'number', 'boolean', 'literal']
  const type = types[Math.floor(rng() * types.length)]
  const optional = rng() < 0.4

  if (type === 'literal') {
    const n = 1 + Math.floor(rng() * 8)
    const values: string[] = []

    for (let i = 0; i < n; i += 1) {
      values.push(`v${i}`)
    }

    return {
      key,
      type: 'literal',
      optional,
      values,
      bits: n === 1 ? 0 : Math.ceil(Math.log2(n))
    }
  }

  return { key, type, optional }
}

function randomState (rng: () => number, fields: readonly FieldSpec[]) {
  const state: Record<string, unknown> = {}

  for (const f of fields) {
    if (f.optional && rng() < 0.4) {
      continue
    }

    if (f.type === 'string') {
      const len = Math.floor(rng() * 20)
      let s = ''

      for (let i = 0; i < len; i += 1) {
        // ascii printable to keep round-trip predictable; the format supports any js string
        s += String.fromCharCode(0x20 + Math.floor(rng() * 95))
      }

      state[f.key] = s
    } else if (f.type === 'number') {
      const sign = rng() < 0.5 ? -1 : 1
      const magnitude = Math.floor(rng() * Number.MAX_SAFE_INTEGER)

      state[f.key] = sign * magnitude
    } else if (f.type === 'boolean') {
      state[f.key] = rng() < 0.5
    } else if (f.type === 'literal' && f.values) {
      state[f.key] = f.values[Math.floor(rng() * f.values.length)]
    }
  }

  return state
}

function stripUndefined (obj: Record<string, unknown>) {
  const out: Record<string, unknown> = {}

  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      out[k] = v
    }
  }

  return out
}
