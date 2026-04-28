import { describe, it, expect } from 'vitest'

import { Formatted } from '../src/formatted'
import { join, joinWithEntities } from '../src/join'

describe('join', () => {
  it('returns empty Formatted for empty parts', () => {
    const f = join([])

    expect(f.text).toBe('')
    expect(f.entities).toEqual([])
  })

  it('default separator is empty string', () => {
    expect(join(['a', 'b', 'c']).text).toBe('abc')
  })

  it('string separator goes between parts (no trailing)', () => {
    expect(join(['a', 'b', 'c'], ', ').text).toBe('a, b, c')
  })

  it('Formatted parts merge with shifted offsets', () => {
    const a = new Formatted('A', [{ type: 'bold', offset: 0, length: 1 }])
    const b = new Formatted('B', [{ type: 'italic', offset: 0, length: 1 }])
    const out = join([a, b], '-')

    expect(out.text).toBe('A-B')
    expect(out.entities).toEqual([
      { type: 'bold', offset: 0, length: 1 },
      { type: 'italic', offset: 2, length: 1 }
    ])
  })

  it('Formatted separator merges its entities at every gap', () => {
    const sep = new Formatted(' | ', [{ type: 'code', offset: 0, length: 3 }])
    const out = join(['a', 'b', 'c'], sep)

    expect(out.text).toBe('a | b | c')
    expect(out.entities).toEqual([
      { type: 'code', offset: 1, length: 3 },
      { type: 'code', offset: 5, length: 3 }
    ])
  })

  it('drops null/undefined/false parts silently', () => {
    expect(join(['a', null, 'b', undefined, 'c', false], '-').text).toBe('a-b-c')
  })

  it('coerces numbers via String()', () => {
    expect(join([1, 2, 3], ',').text).toBe('1,2,3')
  })

  it('coerces raw {text, entities} objects via Formatted.from', () => {
    const out = join([{ text: 'x', entities: [{ type: 'bold', offset: 0, length: 1 }] }, 'y'], '-')

    expect(out.text).toBe('x-y')
    expect(out.entities).toEqual([{ type: 'bold', offset: 0, length: 1 }])
  })

  it('joinWithEntities is the same function as join', () => {
    expect(joinWithEntities).toBe(join)
  })
})
