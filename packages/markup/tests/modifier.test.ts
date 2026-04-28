import { describe, it, expect } from 'vitest'

import { makeModifier, MODIFIER_NAMES } from '../src/builders/chain'

describe('makeModifier (primitive)', () => {
  it('exposes a function that accepts a string and emits one entity per chain entry', () => {
    const bold = makeModifier(['bold'])

    expect(bold('foo').text).toBe('foo')
    expect(bold('foo').entities).toEqual([{ type: 'bold', offset: 0, length: 3 }])
  })

  it('property access for known modifier names extends the chain', () => {
    const bold = makeModifier(['bold'])
    const out = (bold as unknown as { italic: (s: string) => unknown }).italic('foo') as { entities: unknown[] }

    expect(out.entities).toEqual([
      { type: 'bold', offset: 0, length: 3 },
      { type: 'italic', offset: 0, length: 3 }
    ])
  })

  it('MODIFIER_NAMES includes all modifier types', () => {
    expect(MODIFIER_NAMES.has('bold')).toBe(true)
    expect(MODIFIER_NAMES.has('italic')).toBe(true)
    expect(MODIFIER_NAMES.has('expandableBlockquote')).toBe(true)
    expect(MODIFIER_NAMES.has('code')).toBe(true)
    expect(MODIFIER_NAMES.size).toBe(8)
  })
})
