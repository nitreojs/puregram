import { describe, it, expect } from 'vitest'
import { parseTypeRef } from '../../scripts/lib/parser/normalize'

describe('parseTypeRef', () => {
  it('parses primitive types', () => {
    expect(parseTypeRef('Integer')).toEqual({ kind: 'integer' })
    expect(parseTypeRef('String')).toEqual({ kind: 'string' })
    expect(parseTypeRef('Boolean')).toEqual({ kind: 'bool' })
    expect(parseTypeRef('Float')).toEqual({ kind: 'float' })
    expect(parseTypeRef('Float number')).toEqual({ kind: 'float' })
    expect(parseTypeRef('True')).toEqual({ kind: 'true' })
  })

  it('parses references', () => {
    expect(parseTypeRef('User')).toEqual({ kind: 'reference', name: 'User' })
    expect(parseTypeRef('InlineKeyboardMarkup')).toEqual({ kind: 'reference', name: 'InlineKeyboardMarkup' })
  })

  it('parses arrays', () => {
    expect(parseTypeRef('Array of Integer')).toEqual({ kind: 'array', of: { kind: 'integer' } })
    expect(parseTypeRef('Array of Message')).toEqual({ kind: 'array', of: { kind: 'reference', name: 'Message' } })
    expect(parseTypeRef('Array of Array of PhotoSize')).toEqual({
      kind: 'array',
      of: { kind: 'array', of: { kind: 'reference', name: 'PhotoSize' } }
    })
  })

  it('parses unions with " or "', () => {
    expect(parseTypeRef('Integer or String')).toEqual({
      kind: 'union',
      of: [{ kind: 'integer' }, { kind: 'string' }]
    })
  })

  it('parses three-way unions', () => {
    expect(parseTypeRef('InputFile or String')).toEqual({
      kind: 'union',
      of: [{ kind: 'reference', name: 'InputFile' }, { kind: 'string' }]
    })
  })
})
