import { Telegram } from 'puregram'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createTestEnv } from '../../src'
import { __clearPacksForTesting, registerPack } from '../../src/plugins/registry'

describe('plugin pack registry', () => {
  let cleanup: (() => Promise<void>) | undefined

  beforeEach(() => {
    __clearPacksForTesting()
  })

  afterEach(async () => {
    await cleanup?.()
    cleanup = undefined
    __clearPacksForTesting()
  })

  it('registered pack is not applied when plugin is absent', () => {
    let applied = false

    registerPack({
      pluginName: 'fake',
      apply: () => {
        applied = true
      }
    })

    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })

    cleanup = async () => {}
    createTestEnv(tg)

    expect(applied).toBe(false)
  })

  it('registered pack is applied when plugin is present (via tg.has)', () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })

    ;(tg as unknown as { has: (name: string) => boolean }).has = (name: string) => name === 'fake'

    let applied = false

    registerPack({
      pluginName: 'fake',
      apply: () => {
        applied = true
      }
    })

    cleanup = async () => {}
    createTestEnv(tg)

    expect(applied).toBe(true)
  })

  it('multiple packs apply in registration order', () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })

    ;(tg as unknown as { has: (name: string) => boolean }).has = () => true

    const order: string[] = []

    registerPack({
      pluginName: 'a',
      apply: () => {
        order.push('a')
      }
    })
    registerPack({
      pluginName: 'b',
      apply: () => {
        order.push('b')
      }
    })

    cleanup = async () => {}
    createTestEnv(tg)

    expect(order).toEqual(['a', 'b'])
  })
})
