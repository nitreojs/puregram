import { flow } from '@puregram/flow'
import { Telegram } from 'puregram'
import { afterEach, describe, expect, it } from 'vitest'

import { createTestEnv } from '../../src'

import '../../src/plugins/flow'

const STUB_BOT = { id: 1, is_bot: true, first_name: 'stub', username: 'stubbot' } as never

describe('@puregram/test/flow', () => {
  let cleanup: (() => Promise<void>) | undefined

  afterEach(async () => {
    await cleanup?.()
    cleanup = undefined
  })

  it('env.flow.waiters() is empty before any waitFor', async () => {
    const tg = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(flow())
    const env = createTestEnv(tg)

    expect(env.flow!.waiters()).toEqual([])

    await env.shutdown()
  })

  it('arming a waiter via tg.flow.waitFor adds an entry', async () => {
    const tg = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(flow())
    const env = createTestEnv(tg)

    const armed = (tg as unknown as {
      flow: { waitFor: (kind: string) => Promise<unknown> }
    }).flow.waitFor('message')

    const list = env.flow!.waiters()

    expect(list).toHaveLength(1)
    expect(list[0]?.kind).toBe('message')
    expect(typeof list[0]?.id).toBe('number')
    expect(typeof list[0]?.registeredAt).toBe('number')

    env.flow!.cancelAll()
    await expect(armed).rejects.toMatchObject({ name: 'WaitForCancelled' })
    await env.shutdown()
  })

  it('a matching update resolves the waiter and drains the registry', async () => {
    const tg = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(flow())
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const armed = (tg as unknown as {
      flow: {
        waitFor: (kind: string, opts?: { transform?: (m: unknown) => unknown }) => Promise<unknown>
      }
    }).flow.waitFor('message', {
      transform: (m: unknown) => (m as { raw?: { text?: string } }).raw?.text ?? ''
    })

    expect(env.flow!.waiters()).toHaveLength(1)

    const alice = env.createUser()

    await alice.sendMessage('answer')

    await expect(armed).resolves.toBe('answer')
    expect(env.flow!.waiters()).toEqual([])
  })

  it('cancelAll() rejects all pending waiters and drains the registry', async () => {
    const tg = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(flow())
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const armedA = (tg as unknown as {
      flow: { waitFor: (kind: string) => Promise<unknown> }
    }).flow.waitFor('message')

    const armedB = (tg as unknown as {
      flow: { waitFor: (kind: string) => Promise<unknown> }
    }).flow.waitFor('callback_query')

    expect(env.flow!.waiters()).toHaveLength(2)

    env.flow!.cancelAll()

    await expect(armedA).rejects.toMatchObject({ name: 'WaitForCancelled' })
    await expect(armedB).rejects.toMatchObject({ name: 'WaitForCancelled' })

    expect(env.flow!.waiters()).toEqual([])
  })
})
