import { describe, expect, it } from 'vitest'

import { apiError, isApiErrorSentinel } from '../src/stubs/api-error'

describe('apiError', () => {
  it('returns a sentinel object with the given fields', () => {
    const err = apiError(403, 'Forbidden')

    expect(isApiErrorSentinel(err)).toBe(true)
    expect(err.error_code).toBe(403)
    expect(err.description).toBe('Forbidden')
    expect(err.parameters).toBeUndefined()
  })

  it('carries optional parameters (retry_after etc)', () => {
    const err = apiError(429, 'Too Many Requests', { retry_after: 30 })

    expect(err.parameters).toEqual({ retry_after: 30 })
  })

  it('a plain object is not a sentinel', () => {
    expect(isApiErrorSentinel({ error_code: 500, description: 'x' })).toBe(false)
  })
})
