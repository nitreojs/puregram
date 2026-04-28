import { describe, it, expect } from 'vitest'

import type { Formattable } from '../src/formattable'

describe('Formattable', () => {
  it('is a structural interface with text + entities', () => {
    const f: Formattable = { text: 'hi', entities: [] }

    expect(f.text).toBe('hi')
    expect(Array.isArray(f.entities)).toBe(true)
  })
})
