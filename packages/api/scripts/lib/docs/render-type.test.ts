import { describe, expect, it } from 'vitest'

import { renderType } from './render-type'

describe('renderType', () => {
  it('renders primitives', () => {
    expect(renderType({ kind: 'integer' })).toBe('integer')
    expect(renderType({ kind: 'float' })).toBe('float')
    expect(renderType({ kind: 'bool' })).toBe('boolean')
    expect(renderType({ kind: 'true' })).toBe('true')
    expect(renderType({ kind: 'string' })).toBe('string')
  })

  it('renders string enumerations as inline code joined by plain pipes', () => {
    expect(renderType({ kind: 'string', enumeration: ['html', 'markdown'] }))
      .toBe('`html` | `markdown`')
  })

  it('appends a bare string to soft enums to show they stay open', () => {
    expect(renderType({ kind: 'string', enumeration: ['HTML', 'Markdown'], open: true }))
      .toBe('`HTML` | `Markdown` | string')
  })

  it('links references to the objects page anchor', () => {
    expect(renderType({ kind: 'reference', name: 'Message' }))
      .toBe('[Message](/api/objects#message)')
  })

  it('renders arrays with a trailing []', () => {
    expect(renderType({ kind: 'array', of: { kind: 'reference', name: 'PhotoSize' } }))
      .toBe('[PhotoSize](/api/objects#photosize)[]')
  })

  it('renders unions joined by plain pipes', () => {
    expect(renderType({ kind: 'union', of: [{ kind: 'integer' }, { kind: 'string' }] }))
      .toBe('integer | string')
  })
})
