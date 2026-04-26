import { describe, expect, it } from 'vitest'

import { WaitForCancelled, WaitForTimeout } from '../src/errors'

describe('WaitForTimeout', () => {
  it('captures kind and timeout value', () => {
    const err = new WaitForTimeout('message', 5000)

    expect(err).toBeInstanceOf(Error)
    expect(err.kind).toBe('message')
    expect(err.timeout).toBe(5000)
    expect(err.name).toBe('WaitForTimeout')
    expect(err.message).toContain('message')
    expect(err.message).toContain('5000')
  })
})

describe('WaitForCancelled', () => {
  it('captures kind', () => {
    const err = new WaitForCancelled('callback_query')

    expect(err.kind).toBe('callback_query')
    expect(err.name).toBe('WaitForCancelled')
  })
})
