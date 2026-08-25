import { createTestEnv } from '@puregram/test'
import { Telegram } from 'puregram'
import { describe, expect, it } from 'vitest'

import { stream } from '../src/plugin'

const RAW = {
  update_id: 1,
  stopped_message_generation: { chat: { id: 42, type: 'private' as const, first_name: 'u' }, draft_id: 7 }
}

// the plugin registers its own stopped_message_generation handler so `allowedUpdates: 'auto'`
// subscribes the kind; a handler that skips next() halts the chain, which would silently kill the
// bot's own handler depending on which registered first
describe('the stream plugin never shadows a stopped_message_generation handler', () => {
  it('the bot handler fires when registered after extend', async () => {
    const tg = new Telegram({ token: 'X' }).extend(stream())
    const env = createTestEnv(tg)
    const seen: number[] = []

    tg.onStoppedMessageGeneration(update => void seen.push(update.draftId))

    await env.inject(RAW)

    expect(seen).toEqual([7])

    await env.shutdown()
  })

  it('the bot handler fires when registered before extend', async () => {
    const tg = new Telegram({ token: 'X' })
    const seen: number[] = []

    tg.onStoppedMessageGeneration(update => void seen.push(update.draftId))
    tg.extend(stream())

    const env = createTestEnv(tg)

    await env.inject(RAW)

    expect(seen).toEqual([7])

    await env.shutdown()
  })

  it('still declares the kind so allowedUpdates auto subscribes it', () => {
    const tg = new Telegram({ token: 'X' }).extend(stream())

    createTestEnv(tg)
    tg.onMessage(() => {})

    expect(tg.resolveAllowedUpdates('auto').sort()).toEqual(['message', 'stopped_message_generation'])
  })
})
