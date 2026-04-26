import { describe, it, expect } from 'vitest'

import { createPlugin } from '../../src/plugins/plugin'

describe('createPlugin', () => {
  it('captures name + install', () => {
    const p = createPlugin({
      name: 'my-plugin',
      install: () => ({ hello: () => 'world' })
    })

    expect(p.name).toBe('my-plugin')
    expect(typeof p.install).toBe('function')
  })

  it('preserves dependsOn', () => {
    const p = createPlugin({
      name: 'p',
      dependsOn: ['session', 'flow'],
      install: () => ({})
    })

    expect(p.dependsOn).toEqual(['session', 'flow'])
  })

  it('preserves return-value type via inference', () => {
    const p = createPlugin({
      name: 'session',
      install: () => ({ get: (k: string) => k.toUpperCase() })
    })
    const ext = p.install({} as never) as { get: (k: string) => string }

    expect(ext.get('x')).toBe('X')
  })
})
