import { describe, expect, it } from 'vitest'

import { CallbackDataBuilder, CallbackDataInvalid, CallbackDataTooLong, defineCallbackData } from '../src'
import type { CallbackData } from '../src'

describe('defineCallbackData', () => {
  it('produces a 6-char base64url slug by default', () => {
    const cd = defineCallbackData('ban')

    expect(cd.slug).toHaveLength(6)
    expect(cd.slug).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('honors slugLength', () => {
    expect(defineCallbackData('ban', { slugLength: 1 }).slug).toHaveLength(1)
    expect(defineCallbackData('ban', { slugLength: 22 }).slug).toHaveLength(22)
  })

  it('rejects out-of-range slugLength', () => {
    expect(() => defineCallbackData('x', { slugLength: 0 })).toThrow(RangeError)
    expect(() => defineCallbackData('x', { slugLength: 23 })).toThrow(RangeError)
  })

  it('produces stable slug for identical raw slug', () => {
    expect(defineCallbackData('ban').slug).toBe(defineCallbackData('ban').slug)
  })

  it('produces distinct slugs for distinct raw slugs', () => {
    expect(defineCallbackData('ban').slug).not.toBe(defineCallbackData('kick').slug)
  })

  it('exposes immutable fields after schema declaration', () => {
    const cd = defineCallbackData('x').number('a').string('b', { optional: true })

    expect(cd.fields.length).toBe(2)
    expect(cd.fields[0].key).toBe('a')
    expect(cd.fields[1].key).toBe('b')
    expect(cd.fields[1].optional).toBe(true)
    expect(() => {
      (cd.fields[0] as { key: string }).key = 'changed'
    }).toThrow()
  })
})

describe('pack / unpack', () => {
  it('roundtrips a single number field', () => {
    const cd = defineCallbackData('counter').number('clicks')
    const packed = cd.pack({ clicks: 42 })

    expect(cd.unpack(packed)).toEqual({ clicks: 42 })
  })

  it('roundtrips a multi-field schema', () => {
    const cd = defineCallbackData('action')
      .number('user_id')
      .literal('kind', ['ban', 'kick', 'mute'])
      .boolean('confirm')
      .string('reason', { optional: true })

    const states = [
      { user_id: 1337, kind: 'ban' as const, confirm: true },
      { user_id: -1001234567890, kind: 'kick' as const, confirm: false, reason: 'spam' },
      { user_id: 0, kind: 'mute' as const, confirm: true, reason: '' }
    ]

    for (const state of states) {
      expect(cd.unpack(cd.pack(state))).toEqual(state)
    }
  })

  it('returns null for unrelated payloads', () => {
    const cd = defineCallbackData('foo').number('n')

    expect(cd.unpack('totally unrelated string')).toBeNull()
    expect(cd.unpack('')).toBeNull()
  })

  it('returns null when slug matches but body is malformed', () => {
    const cd = defineCallbackData('foo').number('n')
    const garbage = cd.slug + 'XXXXX'

    expect(cd.unpack(garbage)).toBeNull()
  })

  it('throws CallbackDataTooLong if packed exceeds 64 bytes', () => {
    const cd = defineCallbackData('x').string('s')

    expect(() => cd.pack({ s: 'x'.repeat(127) })).toThrow(CallbackDataTooLong)
  })

  it('counts utf-8 bytes (not js code units) toward the 64-byte limit', () => {
    const cd = defineCallbackData('x').string('s', { optional: true })

    // emoji is 4 utf-8 bytes (surrogate pair = 2 code units in js but 4 bytes in utf-8)
    const fifteenEmoji = '😀'.repeat(15)

    // 30 code units, 60 bytes — plus header/length/slug should overflow
    expect(() => cd.pack({ s: fifteenEmoji })).toThrow(CallbackDataTooLong)
  })

  it('produces ascii-only wire bytes for primitives (no slug-byte expansion under utf-8)', () => {
    const cd = defineCallbackData('x').number('n').boolean('b')
    const packed = cd.pack({ n: 1234567890, b: true })

    expect(Buffer.byteLength(packed, 'utf8')).toBe(packed.length)
  })

  it('beats decimal toString for large numbers (compact format)', () => {
    const cd = defineCallbackData('x').number('n')
    const packed = cd.pack({ n: 1234567890 })

    expect(packed.length).toBeLessThan(cd.slug.length + '1234567890'.length)
  })
})

describe('validate', () => {
  it('returns true for matching payloads', () => {
    const cd = defineCallbackData('x').number('n')

    expect(cd.validate(cd.pack({ n: 1 }))).toBe(true)
  })

  it('returns false for non-matching payloads', () => {
    const cd = defineCallbackData('x').number('n')

    expect(cd.validate('garbage')).toBe(false)
  })

  it('returns false when conditions exclude the payload', () => {
    const cd = defineCallbackData('x').number('n').with({ n: 42 })

    expect(cd.validate(cd.pack({ n: 7 }))).toBe(false)
    expect(cd.validate(cd.pack({ n: 42 }))).toBe(true)
  })
})

describe('button', () => {
  it('returns an inline button with text + packed callback_data', () => {
    const cd = defineCallbackData('ban').number('user_id')
    const button = cd.button({ text: 'Ban', user_id: 1337 })

    expect(button.text).toBe('Ban')
    expect(button.callback_data).toBe(cd.pack({ user_id: 1337 }))
  })
})

describe('repack', () => {
  it('updates a subset of fields and re-packs', () => {
    const cd = defineCallbackData('counter').number('clicks').number('user_id')
    const original = cd.pack({ clicks: 0, user_id: 42 })
    const updated = cd.repack(original, { clicks: 1 })

    expect(cd.unpack(updated)).toEqual({ clicks: 1, user_id: 42 })
  })

  it('throws if source data does not match this schema', () => {
    const cd = defineCallbackData('x').number('n')

    expect(() => cd.repack('not a valid payload', { n: 1 })).toThrow(CallbackDataInvalid)
  })
})

describe('with — conditions', () => {
  it('exact value match', () => {
    const cd = defineCallbackData('x').number('n').with({ n: 42 })

    expect(cd.validate(cd.pack({ n: 42 }))).toBe(true)
    expect(cd.validate(cd.pack({ n: 7 }))).toBe(false)
  })

  it('predicate function', () => {
    const cd = defineCallbackData('x').number('n').with({ n: n => n > 10 })

    expect(cd.validate(cd.pack({ n: 11 }))).toBe(true)
    expect(cd.validate(cd.pack({ n: 5 }))).toBe(false)
  })

  it('array of allowed values (or)', () => {
    const cd = defineCallbackData('x').literal('k', ['a', 'b', 'c']).with({ k: ['a', 'c'] })

    expect(cd.validate(cd.pack({ k: 'a' }))).toBe(true)
    expect(cd.validate(cd.pack({ k: 'b' }))).toBe(false)
    expect(cd.validate(cd.pack({ k: 'c' }))).toBe(true)
  })

  it('chained conditions are AND', () => {
    const cd = defineCallbackData('x').number('n').number('m')
      .with({ n: n => n > 0 })
      .with({ m: m => m < 10 })

    expect(cd.validate(cd.pack({ n: 1, m: 5 }))).toBe(true)
    expect(cd.validate(cd.pack({ n: -1, m: 5 }))).toBe(false)
    expect(cd.validate(cd.pack({ n: 1, m: 100 }))).toBe(false)
  })

  it('survives a field declared after the condition', () => {
    const narrowed = defineCallbackData('x').number('a').with({ a: 1 })
    // the builders are hidden from the narrowed type, but plain-js callers still
    // reach them — conditions must not be dropped by a later field
    const cd = (narrowed as unknown as CallbackData<{ a: number, b: number }>).number('b')

    expect(cd.validate(cd.pack({ a: 1, b: 2 }))).toBe(true)
    expect(cd.validate(cd.pack({ a: 999, b: 2 }))).toBe(false)
  })
})

describe('with — present / missing', () => {
  it('present matches only when field is provided', async () => {
    const { present } = await import('../src')
    const cd = defineCallbackData('x').string('s', { optional: true }).with({ s: present })

    expect(cd.validate(cd.pack({ s: 'foo' }))).toBe(true)
    expect(cd.validate(cd.pack({}))).toBe(false)
  })

  it('missing matches only when field is absent', async () => {
    const { missing } = await import('../src')
    const cd = defineCallbackData('x').string('s', { optional: true }).with({ s: missing })

    expect(cd.validate(cd.pack({}))).toBe(true)
    expect(cd.validate(cd.pack({ s: 'foo' }))).toBe(false)
  })
})

describe('.filter — dispatch-ready filter', () => {
  it('matches a callback_query update with valid data', () => {
    const cd = defineCallbackData('x').number('n')
    const update = makeCallbackUpdate(cd.pack({ n: 42 }))

    expect(cd.filter(update)).toBe(true)
    expect((update as { payload?: { n: number } }).payload).toEqual({ n: 42 })
  })

  it('rejects updates with mismatched data', () => {
    const cd = defineCallbackData('x').number('n')
    const update = makeCallbackUpdate('garbage')

    expect(cd.filter(update)).toBe(false)
  })

  it('carries kinds metadata for dispatcher fast-path', () => {
    const cd = defineCallbackData('x').number('n')

    expect(cd.filter.kinds).toEqual(['callback_query'])
  })

  it('exposes filter chain methods', () => {
    const cd = defineCallbackData('x').number('n')

    expect(typeof cd.filter.and).toBe('function')
    expect(typeof cd.filter.or).toBe('function')
    expect(typeof cd.filter.not).toBe('function')
  })

  it('attaches narrowed payload after .with()', () => {
    const cd = defineCallbackData('x').number('n').with({ n: 42 })

    expect(cd.filter(makeCallbackUpdate(cd.pack({ n: 42 })))).toBe(true)
    expect(cd.filter(makeCallbackUpdate(cd.pack({ n: 7 })))).toBe(false)
  })
})

describe('CallbackDataBuilder.create (v2 alias)', () => {
  it('produces an equivalent builder', () => {
    const a = defineCallbackData('foo').number('n')
    const b = CallbackDataBuilder.create('foo').number('n')

    expect(a.slug).toBe(b.slug)
    expect(b.unpack(a.pack({ n: 7 }))).toEqual({ n: 7 })
  })
})

describe('schema validation', () => {
  it('rejects optional + default combo', () => {
    expect(() => defineCallbackData('x').number('n', { optional: true, default: 0 })).toThrow(RangeError)
  })

  it('rejects empty literal value list', () => {
    expect(() => defineCallbackData('x').literal('k', [])).toThrow(RangeError)
  })

  it('rejects duplicate literal values', () => {
    expect(() => defineCallbackData('x').literal('k', ['a', 'b', 'a'])).toThrow(RangeError)
  })
})

describe('pack — string well-formedness', () => {
  it('rejects an unpaired surrogate', () => {
    const cd = defineCallbackData('s').string('t')

    expect(() => cd.pack({ t: '\uD83D' })).toThrow(CallbackDataInvalid)
    expect(() => cd.pack({ t: '\uDE00' })).toThrow(CallbackDataInvalid)
    expect(() => cd.pack({ t: 'ok\uD83Dend' })).toThrow(CallbackDataInvalid)
  })

  it('round-trips a well-formed astral character', () => {
    const cd = defineCallbackData('s').string('t')

    expect(cd.unpack(cd.pack({ t: '\u{1F600}' }))).toEqual({ t: '\u{1F600}' })
  })
})

describe('unpack — hostile payloads', () => {
  it('returns null for an over-long varint instead of an unsafe integer', () => {
    const cd = defineCallbackData('x').number('n')
    const crafted = cd.slug + '\u007F'.repeat(10) + '\u0001'

    expect(cd.unpack(crafted)).toBeNull()
  })

  it('still round-trips the safe-integer boundary', () => {
    const cd = defineCallbackData('x').number('n')

    expect(cd.unpack(cd.pack({ n: Number.MAX_SAFE_INTEGER }))).toEqual({ n: Number.MAX_SAFE_INTEGER })
    expect(cd.unpack(cd.pack({ n: -Number.MAX_SAFE_INTEGER }))).toEqual({ n: -Number.MAX_SAFE_INTEGER })
  })
})

function makeCallbackUpdate (data: string) {
  return {
    kind: 'callback_query',
    raw: { data }
  } as never
}
