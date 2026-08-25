// the stop watcher must fire when a real stopped_message_generation update travels the actual
// dispatch pipeline — stop.test.ts invokes the middleware by hand, which cannot catch a wiring bug
import { createTestEnv } from '@puregram/test'
import { Telegram } from 'puregram'
import { describe, expect, it } from 'vitest'

import { stream } from '../src/plugin'

const CHAT = 8780552344
const MESSAGE_ID = 79

describe('stop watcher through real dispatch', () => {
  it('a hook registered via useHook sees the update', async () => {
    const tg = new Telegram({ token: 'X' }).extend(stream())
    const env = createTestEnv(tg)
    const kinds: string[] = []

    tg.useHook('onUpdate', async (update, next) => {
      kinds.push((update as { kind: string }).kind)

      await next()
    }, { priority: 'high' })

    await env.inject({
      update_id: 2,
      stopped_message_generation: { chat: { id: 1, type: 'private', first_name: 'u' }, draft_id: 7 }
    })

    expect(kinds).toEqual(['stopped_message_generation'])

    await env.shutdown()
  })

  it('stops an in-flight update.stream run when the matching update arrives', async () => {
    const tg = new Telegram({ token: 'X' }).extend(stream())
    const env = createTestEnv(tg)

    env.onApi('sendMessageDraft', true)
    env.onApi('sendMessage', { message_id: 1, date: 0, chat: { id: CHAT, type: 'private' }, text: 'x' })
    const gate = Promise.withResolvers<void>()
    const started = Promise.withResolvers<void>()
    let run: Promise<{ stopped: boolean }> | undefined

    tg.onMessage((message) => {
      const source = (async function * () {
        yield 'partial'

        await gate.promise

        yield ' tail'
      })()

      // the exact call shape live-stop.ts uses
      run = (message as unknown as {
        stream: (s: AsyncIterable<string>, o: Record<string, unknown>) => Promise<{ stopped: boolean }>
      }).stream(source, { canStop: true, keepOnStop: true, thinkingPlaceholder: false, editIntervalMs: 0 })

      started.resolve()
    })

    await env.inject({
      update_id: 1,
      message: {
        message_id: MESSAGE_ID,
        date: 0,
        chat: { id: CHAT, type: 'private', first_name: 'u' },
        from: { id: CHAT, is_bot: false, first_name: 'u' },
        text: '/keep'
      }
    })

    await started.promise

    while (env.callsTo('sendMessageDraft').length === 0) {
      await new Promise(resolve => setImmediate(resolve))
    }

    const draftId = (env.callsTo('sendMessageDraft')[0] as { params: { draft_id: number } }).params.draft_id

    await env.inject({
      update_id: 2,
      stopped_message_generation: {
        chat: { id: CHAT, type: 'private', first_name: 'u' },
        draft_id: draftId
      }
    })

    gate.resolve()

    const result = await run!

    expect({ draftId, stopped: result.stopped }).toEqual({ draftId, stopped: true })

    await env.shutdown()
  })
  it('stops the run with the thinking placeholder enabled, as live-stop.ts uses it', async () => {
    const tg = new Telegram({ token: 'X' }).extend(stream())
    const env = createTestEnv(tg)

    env.onApi('sendMessageDraft', true)
    env.onApi('sendMessage', { message_id: 1, date: 0, chat: { id: CHAT, type: 'private' }, text: 'x' })
    const gate = Promise.withResolvers<void>()
    const started = Promise.withResolvers<void>()
    let run: Promise<{ stopped: boolean }> | undefined

    tg.onMessage((message) => {
      const source = (async function * () {
        yield 'partial'

        await gate.promise

        yield ' tail'
      })()

      // the exact call shape live-stop.ts uses
      run = (message as unknown as {
        stream: (s: AsyncIterable<string>, o: Record<string, unknown>) => Promise<{ stopped: boolean }>
      }).stream(source, { canStop: true, keepOnStop: true, editIntervalMs: 0 })

      started.resolve()
    })

    await env.inject({
      update_id: 1,
      message: {
        message_id: MESSAGE_ID,
        date: 0,
        chat: { id: CHAT, type: 'private', first_name: 'u' },
        from: { id: CHAT, is_bot: false, first_name: 'u' },
        text: '/keep'
      }
    })

    await started.promise

    while (env.callsTo('sendMessageDraft').length === 0) {
      await new Promise(resolve => setImmediate(resolve))
    }

    const draftId = (env.callsTo('sendMessageDraft')[0] as { params: { draft_id: number } }).params.draft_id

    await env.inject({
      update_id: 2,
      stopped_message_generation: {
        chat: { id: CHAT, type: 'private', first_name: 'u' },
        draft_id: draftId
      }
    })

    gate.resolve()

    const result = await run!

    expect({ draftId, stopped: result.stopped }).toEqual({ draftId, stopped: true })

    await env.shutdown()
  })
})
