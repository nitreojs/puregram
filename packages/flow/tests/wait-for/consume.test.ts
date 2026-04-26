import { Telegram } from 'puregram'
import { describe, expect, it, vi } from 'vitest'

import { flow } from '../../src'

// declare-module-merge a test-local kind into UpdateKindMap so tg.on('probe', h) typechecks
// (UpdateKind = keyof UpdateKindMap, so this widens both)
declare module '@puregram/api' {
  interface UpdateKindMap {
    probe: { kind: 'probe', x: number }
  }
}

describe('waitFor — consume semantics', () => {
  it('consume: true (default) prevents user tg.on handler from firing', async () => {
    const t = new Telegram({ token: 'TEST' }).extend(flow())

    await t.start()

    t.defineUpdate('probe')

    const userHandler = vi.fn()

    t.on('probe', userHandler)

    const waitForPromise = (t as any).flow.waitFor('probe')

    t.emit('probe', { x: 1 })

    // emit fires-and-forgets via Promise.catch; await microtasks
    await new Promise(resolve => setImmediate(resolve))

    await expect(waitForPromise).resolves.toMatchObject({ kind: 'probe' })
    expect(userHandler).not.toHaveBeenCalled()

    await t.shutdown()
  })

  it('consume: false lets the user handler fire AND resolves the waiter', async () => {
    const t = new Telegram({ token: 'TEST' }).extend(flow())

    await t.start()

    t.defineUpdate('probe')

    const userHandler = vi.fn()

    t.on('probe', userHandler)

    const waitForPromise = (t as any).flow.waitFor('probe', { consume: false })

    t.emit('probe', { x: 1 })

    await new Promise(resolve => setImmediate(resolve))

    await expect(waitForPromise).resolves.toMatchObject({ kind: 'probe' })
    expect(userHandler).toHaveBeenCalledOnce()

    await t.shutdown()
  })

  it('unmatched updates always propagate to user handlers', async () => {
    const t = new Telegram({ token: 'TEST' }).extend(flow())

    await t.start()

    t.defineUpdate('probe')

    const userHandler = vi.fn()

    t.on('probe', userHandler)

    // no waitFor pending
    t.emit('probe', { x: 1 })

    await new Promise(resolve => setImmediate(resolve))

    expect(userHandler).toHaveBeenCalledOnce()

    await t.shutdown()
  })
})
