import { MemoryStorage } from '@puregram/storage'
import { Telegram } from 'puregram'
import { describe, expect, it, vi } from 'vitest'

import { FlowKindMismatch, flow } from '../../src'
import type { PersistedFlow } from '../../src/persistent/types'

const STUB_BOT = { id: 1, is_bot: true, first_name: 'stub', username: 'stubbot' } as any

describe('FlowKindMismatch', () => {
  it('throws when prompt kind does not match handle kind', async () => {
    const storage = new MemoryStorage<PersistedFlow>()
    const t = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(flow({ storage }))

    await t.start()

    ;(t as any).send = vi.fn().mockResolvedValue({ message_id: 1 })
    ;(t as any).flow.handle('confirm', { kind: 'callback_query', onAnswer: () => {} })

    // no kind override at the call site -> default 'message' -> mismatch with handle's 'callback_query'
    await expect(
      (t as any).flow.prompt(100, 'pick', { id: 'confirm' })
    ).rejects.toBeInstanceOf(FlowKindMismatch)

    await t.shutdown()
  })
})
