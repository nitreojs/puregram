import { describe, expect, it, vi } from 'vitest'

import { HandlerRegistry } from '../../src/persistent/handlers'

describe('HandlerRegistry', () => {
  it('register + lookup round-trips by id', () => {
    const reg = new HandlerRegistry()
    const onAnswer = vi.fn()

    reg.register('register:name', { onAnswer })

    const cfg = reg.get('register:name')

    expect(cfg).toBeDefined()
    expect(cfg!.onAnswer).toBe(onAnswer)
  })

  it('defaults kind to message when not specified on the config', () => {
    const reg = new HandlerRegistry()

    reg.register('x', { onAnswer: () => {} })

    expect(reg.get('x')!.kind).toBe('message')
  })

  it('preserves explicit kind', () => {
    const reg = new HandlerRegistry()

    reg.register('x', { kind: 'callback_query', onAnswer: () => {} })

    expect(reg.get('x')!.kind).toBe('callback_query')
  })

  it('returns undefined for unknown ids', () => {
    expect(new HandlerRegistry().get('nope')).toBeUndefined()
  })

  it('throws when re-registering the same id', () => {
    const reg = new HandlerRegistry()

    reg.register('x', { onAnswer: () => {} })

    expect(() => reg.register('x', { onAnswer: () => {} })).toThrow(/already registered/)
  })
})
