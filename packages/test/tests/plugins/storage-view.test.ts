import { Telegram } from 'puregram'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createTestEnv } from '../../src'
import { __clearPacksForTesting, registerPack } from '../../src/plugins/registry'

describe('namespaced storage view', () => {
  beforeEach(() => __clearPacksForTesting())
  afterEach(() => __clearPacksForTesting())

  it('env.storage is undefined when no pack registers a kv handle', () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg) as unknown as { storage?: unknown }

    expect(env.storage).toBeUndefined()
  })

  it('a pack can register a kv handle that surfaces under env.storage.<name>', () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })

    ;(tg as unknown as { has: (name: string) => boolean }).has = (name: string) => name === 'demo'

    const fakeStore = { foo: 'bar' }

    registerPack({
      pluginName: 'demo',
      apply (env) {
        const storage = env.ensureStorage()

        storage.register('demo', fakeStore)
      }
    })

    const env = createTestEnv(tg) as unknown as { storage: { demo: unknown } }

    expect(env.storage.demo).toBe(fakeStore)
  })
})
