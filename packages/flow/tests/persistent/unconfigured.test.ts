import { describe, expect, it } from 'vitest'

import { FlowPersistenceUnconfigured, flow } from '../../src'
import { makeTg } from '../helpers/make-tg'

describe('storage guard', () => {
  it('throws FlowPersistenceUnconfigured on flow.prompt({ id }) without storage', async () => {
    const { tg, mock } = await makeTg(t => t.extend(flow()))

    await tg.start()

    await expect(
      tg.flow.prompt(100, 'name?', { id: 'register:name' })
    ).rejects.toBeInstanceOf(FlowPersistenceUnconfigured)

    await tg.shutdown()
    await mock.stop()
  })

  it('throws FlowPersistenceUnconfigured on flow.waitFor({ id }) without storage', async () => {
    const { tg, mock } = await makeTg(t => t.extend(flow()))

    await tg.start()

    await expect(
      tg.flow.waitFor('message', { id: 'await:msg' })
    ).rejects.toBeInstanceOf(FlowPersistenceUnconfigured)

    await tg.shutdown()
    await mock.stop()
  })

  it('flow.handle registers regardless of storage', async () => {
    const { tg, mock } = await makeTg(t => t.extend(flow()))

    await tg.start()

    expect(() => {
      tg.flow.handle('register:name', { onAnswer: () => {} })
    }).not.toThrow()

    await tg.shutdown()
    await mock.stop()
  })
})
