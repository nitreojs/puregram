import { describe, it, expect } from 'vitest'

import { resolveInstallOrder, PluginConflict, PluginCycle, PluginMissingDep } from '../../src/plugins/installer'
import { createPlugin } from '../../src/plugins/plugin'

const p = (name: string, deps: string[] = []) =>
  createPlugin({ name, dependsOn: deps, install: () => ({}) })

describe('resolveInstallOrder', () => {
  it('orders plugins so deps install first', () => {
    const session = p('session')
    const flow = p('flow')
    const scenes = p('scenes', ['session', 'flow'])
    const order = resolveInstallOrder([scenes, session, flow])

    expect(order.map(o => o.name)).toEqual(['session', 'flow', 'scenes'])
  })

  it('throws on missing dep', () => {
    const a = p('a', ['missing'])

    expect(() => resolveInstallOrder([a])).toThrow(PluginMissingDep)
  })

  it('throws on cycle', () => {
    const a = p('a', ['b'])
    const b = p('b', ['a'])

    expect(() => resolveInstallOrder([a, b])).toThrow(PluginCycle)
  })

  it('throws on duplicate name', () => {
    const a = p('session')
    const b = p('session')

    expect(() => resolveInstallOrder([a, b])).toThrow(PluginConflict)
  })
})
