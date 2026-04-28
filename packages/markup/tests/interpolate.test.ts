import { describe, it, expect } from 'vitest'

import { Formatted } from '../src/formatted'
import { interpolate } from '../src/interpolate'

describe('interpolate', () => {
  it('concatenates plain string pieces', () => {
    const out = interpolate([
      { kind: 'text', value: 'hello ' },
      { kind: 'text', value: 'world' }
    ])

    expect(out.text).toBe('hello world')
    expect(out.entities).toEqual([])
  })

  it('shifts Formatted entity offsets', () => {
    const inner = new Formatted('bold', [{ type: 'bold', offset: 0, length: 4 }])
    const out = interpolate([
      { kind: 'text', value: 'a ' },
      { kind: 'formatted', value: inner },
      { kind: 'text', value: ' b' }
    ])

    expect(out.text).toBe('a bold b')
    expect(out.entities).toEqual([{ type: 'bold', offset: 2, length: 4 }])
  })

  it('coerces numbers to strings as text pieces', () => {
    const out = interpolate([
      { kind: 'text', value: 'count=' },
      { kind: 'text', value: String(42) }
    ])

    expect(out.text).toBe('count=42')
  })

  it('skips null/undefined/false pieces (kind: skip)', () => {
    const out = interpolate([
      { kind: 'text', value: 'x' },
      { kind: 'skip' },
      { kind: 'text', value: 'y' }
    ])

    expect(out.text).toBe('xy')
  })

  it('preserves entity order across multiple Formatted pieces', () => {
    const a = new Formatted('a', [{ type: 'bold', offset: 0, length: 1 }])
    const b = new Formatted('b', [{ type: 'italic', offset: 0, length: 1 }])
    const out = interpolate([
      { kind: 'formatted', value: a },
      { kind: 'text', value: '-' },
      { kind: 'formatted', value: b }
    ])

    expect(out.text).toBe('a-b')
    expect(out.entities).toEqual([
      { type: 'bold', offset: 0, length: 1 },
      { type: 'italic', offset: 2, length: 1 }
    ])
  })
})
