import { describe, expect, it } from 'vitest'

import { callbackData, defineCallbackData } from '../src'
import type { AnyCallbackData } from '../src/plugin'

const fakeTelegram = () => ({})

const installSync = (schemas: AnyCallbackData[]) => {
  const result = callbackData(schemas).install(fakeTelegram() as never)

  if (result instanceof Promise) {
    throw new Error('plugin install unexpectedly returned a promise')
  }

  return result
}

describe('callbackData() plugin', () => {
  it('registers given schemas', () => {
    const Foo = defineCallbackData('foo').number('n')
    const Bar = defineCallbackData('bar').string('s')
    const ext = installSync([Foo, Bar])

    expect(ext.all.size).toBe(2)
    expect(ext.all.get(Foo.slug)).toBe(Foo)
    expect(ext.all.get(Bar.slug)).toBe(Bar)
  })

  it('throws on slug collision', () => {
    let a = defineCallbackData('one', { slugLength: 1 })
    let b = defineCallbackData('two', { slugLength: 1 })

    let attempts = 0

    while (a.slug !== b.slug && attempts < 50) {
      attempts += 1
      a = defineCallbackData(`one${attempts}`, { slugLength: 1 })
      b = defineCallbackData(`two${attempts}`, { slugLength: 1 })
    }

    if (a.slug !== b.slug) {
      // failed to find a collision in 50 attempts — fall back to manual same-raw-slug collision
      const x = defineCallbackData('same').number('n')
      const y = defineCallbackData('same').string('s')

      expect(() => installSync([x, y])).toThrow(/slug collision/)

      return
    }

    expect(() => installSync([a, b])).toThrow(/slug collision/)
  })

  it('allows registering the same schema twice (idempotent)', () => {
    const Foo = defineCallbackData('foo').number('n')
    const ext = installSync([Foo, Foo])

    expect(ext.all.size).toBe(1)
  })

  it('register() can be called after install', () => {
    const Foo = defineCallbackData('foo').number('n')
    const Bar = defineCallbackData('bar').string('s')
    const ext = installSync([Foo])

    expect(ext.all.size).toBe(1)

    ext.register(Bar)

    expect(ext.all.size).toBe(2)
  })

  it('throws on register() with colliding slug', () => {
    const Foo = defineCallbackData('foo').number('n')
    const FooClone = defineCallbackData('foo').string('s')
    const ext = installSync([Foo])

    expect(() => ext.register(FooClone)).toThrow(/slug collision/)
  })
})
