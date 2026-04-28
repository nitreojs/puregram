import { describe, expect, it } from 'vitest'

import {
  FlowHandlerMissing,
  FlowKindMismatch,
  FlowPersistenceUnconfigured
} from '../../src/errors'

describe('persistent errors', () => {
  it('FlowPersistenceUnconfigured carries a clear message', () => {
    const err = new FlowPersistenceUnconfigured()

    expect(err).toBeInstanceOf(Error)
    expect(err.name).toBe('FlowPersistenceUnconfigured')
    expect(err.message).toMatch(/flow\(\{ storage \}\)/)
  })

  it('FlowHandlerMissing carries the missing id', () => {
    const err = new FlowHandlerMissing('register:age')

    expect(err.name).toBe('FlowHandlerMissing')
    expect(err.id).toBe('register:age')
    expect(err.message).toContain('register:age')
  })

  it('FlowKindMismatch carries both kinds and the id', () => {
    const err = new FlowKindMismatch('confirm:choice', 'message', 'callback_query')

    expect(err.name).toBe('FlowKindMismatch')
    expect(err.id).toBe('confirm:choice')
    expect(err.expectedKind).toBe('message')
    expect(err.actualKind).toBe('callback_query')
    expect(err.message).toContain('confirm:choice')
    expect(err.message).toContain('message')
    expect(err.message).toContain('callback_query')
  })
})
