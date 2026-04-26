import { describe, it, expect } from 'vitest'

import { TelegramError, ApiError } from '../src/errors'

describe('TelegramError', () => {
  it('captures code, description, optional cause', () => {
    const cause = new Error('underlying')
    const err = new TelegramError({ error_code: 400, description: 'bad request', cause })

    expect(err.code).toBe(400)
    expect(err.message).toBe('bad request')
    expect(err.cause).toBe(cause)
    expect(err.name).toBe('TelegramError')
  })

  it('serializes to JSON', () => {
    const err = new TelegramError({ error_code: 500, description: 'oops' })
    const json = err.toJSON()

    expect(json.code).toBe(500)
    expect(json.message).toBe('oops')
  })
})

describe('ApiError', () => {
  it('extends TelegramError with response parameters', () => {
    const err = new ApiError({ ok: false, error_code: 429, description: 'too many', parameters: { retry_after: 5 } })

    expect(err).toBeInstanceOf(TelegramError)
    expect(err.code).toBe(429)
    expect(err.parameters?.retry_after).toBe(5)
    expect(err.name).toBe('ApiError')
  })
})
