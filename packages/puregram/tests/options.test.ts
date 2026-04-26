import { describe, it, expect } from 'vitest'

import { resolveOptions, DEFAULT_OPTIONS } from '../src/options'

describe('resolveOptions', () => {
  it('fills missing fields with defaults', () => {
    const out = resolveOptions({ token: 'abc' })

    expect(out.token).toBe('abc')
    expect(out.apiBaseUrl).toBe(DEFAULT_OPTIONS.apiBaseUrl)
    expect(out.apiTimeout).toBe(DEFAULT_OPTIONS.apiTimeout)
  })

  it('user values win over defaults', () => {
    const out = resolveOptions({ token: 'x', apiTimeout: 5000 })

    expect(out.apiTimeout).toBe(5000)
  })
})
