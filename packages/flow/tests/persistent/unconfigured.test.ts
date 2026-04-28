import { Telegram } from 'puregram'
import { describe, expect, it } from 'vitest'

import { FlowPersistenceUnconfigured, flow } from '../../src'

const STUB_BOT = { id: 1, is_bot: true, first_name: 'stub', username: 'stubbot' } as any

describe('storage guard', () => {
  it('throws FlowPersistenceUnconfigured on flow.prompt({ id }) without storage', async () => {
    const t = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(flow())

    await t.start()

    await expect(
      (t as any).flow.prompt(100, 'name?', { id: 'register:name' })
    ).rejects.toBeInstanceOf(FlowPersistenceUnconfigured)

    await t.shutdown()
  })

  it('throws FlowPersistenceUnconfigured on flow.waitFor({ id }) without storage', async () => {
    const t = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(flow())

    await t.start()

    await expect(
      (t as any).flow.waitFor('message', { id: 'await:msg' })
    ).rejects.toBeInstanceOf(FlowPersistenceUnconfigured)

    await t.shutdown()
  })

  it('flow.handle registers regardless of storage', async () => {
    const t = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(flow())

    await t.start()

    expect(() => {
      ;(t as any).flow.handle('register:name', { onAnswer: () => {} })
    }).not.toThrow()

    await t.shutdown()
  })
})
