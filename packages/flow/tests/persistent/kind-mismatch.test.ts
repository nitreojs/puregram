import { MemoryStorage } from '@puregram/storage'
import { describe, expect, it, vi } from 'vitest'

import { FlowKindMismatch, flow } from '../../src'
import type { PersistedFlow } from '../../src/persistent/types'
import { makeTg } from '../helpers/make-tg'

describe('FlowKindMismatch', () => {
  it('throws when prompt kind does not match handle kind', async () => {
    const storage = new MemoryStorage<PersistedFlow>()
    const { tg, mock } = await makeTg(t => t.extend(flow({ storage })))

    await tg.start()

    // override send to skip the wire — we only care about the kind-mismatch guard
    ;(tg as { send: unknown }).send = vi.fn().mockResolvedValue({ message_id: 1 })

    tg.flow.handle('confirm', { kind: 'callback_query', onAnswer: () => {} })

    // no kind override at the call site -> default 'message' -> mismatch with handle's 'callback_query'
    await expect(
      tg.flow.prompt(100, 'pick', { id: 'confirm' })
    ).rejects.toBeInstanceOf(FlowKindMismatch)

    await tg.shutdown()
    await mock.stop()
  })
})
