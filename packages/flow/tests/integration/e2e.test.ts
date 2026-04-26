import { describe, expect, it } from 'vitest'

import type { MediaGroupUpdate } from '../../src'
import { flow, mediaGroup } from '../../src'
import { makeTg } from '../helpers/make-tg'

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

describe('@puregram/flow — e2e', () => {
  it('waitFor resolves on the next matching update from polling', async () => {
    const { tg, mock } = await makeTg(t => t.extend(flow()))

    let pulls = 0

    mock.expect('getUpdates', () => {
      pulls++

      if (pulls === 1) {
        return {
          ok: true,
          result: [
            { update_id: 1, message: { message_id: 1, date: 0, chat: { id: 100, type: 'private' }, text: 'hello' } }
          ]
        }
      }

      return { ok: true, result: [] }
    })

    await tg.start()

    const startPromise = tg.startPolling()
    const matched = await (tg as any).flow.waitFor('message')

    tg.stopPolling()
    await startPromise

    expect(matched.kind).toBe('message')
    expect(matched.raw.text).toBe('hello')

    await mock.stop()
  })

  it('prompt sends + waits for the user reply', async () => {
    const { tg, mock } = await makeTg(t => t.extend(flow()))

    mock.expect('sendMessage', params => ({
      ok: true,
      result: { message_id: 99, date: 0, chat: { id: params.chat_id, type: 'private' }, text: params.text }
    }))

    let pulls = 0

    mock.expect('getUpdates', () => {
      pulls++

      if (pulls === 1) {
        return {
          ok: true,
          result: [
            {
              update_id: 1,
              message: {
                message_id: 2,
                date: 0,
                from: { id: 7, is_bot: false, first_name: 'a' },
                chat: { id: 100, type: 'private' },
                text: 'alice'
              }
            }
          ]
        }
      }

      return { ok: true, result: [] }
    })

    await tg.start()

    const startPromise = tg.startPolling()
    const reply = await (tg as any).flow.prompt(100, 'name?', { from: 7 })

    tg.stopPolling()
    await startPromise

    expect(reply.raw.text).toBe('alice')

    await mock.stop()
  })

  it('mediaGroup buffers album messages and emits one composite', async () => {
    const { tg, mock } = await makeTg(t => t.extend(mediaGroup({ window: 50 })))

    let pulls = 0

    mock.expect('getUpdates', () => {
      pulls++

      if (pulls === 1) {
        return {
          ok: true,
          result: [
            {
              update_id: 1,
              message: {
                message_id: 1,
                date: 0,
                chat: { id: 100, type: 'private' },
                text: 'a',
                media_group_id: 'album-1'
              }
            },
            {
              update_id: 2,
              message: {
                message_id: 2,
                date: 0,
                chat: { id: 100, type: 'private' },
                text: 'b',
                media_group_id: 'album-1'
              }
            },
            {
              update_id: 3,
              message: {
                message_id: 3,
                date: 0,
                chat: { id: 100, type: 'private' },
                text: 'c',
                media_group_id: 'album-1'
              }
            }
          ]
        }
      }

      return { ok: true, result: [] }
    })

    await tg.start()

    const composites: MediaGroupUpdate[] = []

    tg.on('media_group', u => {
      composites.push(u)
    })

    const singletons: unknown[] = []

    tg.on('message', u => {
      singletons.push(u)
    })

    const startPromise = tg.startPolling()

    // wait long enough for polling to deliver the batch and the 50ms window to elapse
    await sleep(200)

    tg.stopPolling()
    await startPromise

    expect(singletons).toHaveLength(0)
    expect(composites).toHaveLength(1)
    expect(composites[0]?.kind).toBe('media_group')
    expect(composites[0]?.messages).toHaveLength(3)
    expect(composites[0]?.id).toBe('album-1')

    await mock.stop()
  })

  it('flow + mediaGroup compose: waitFor("message") still works for non-album messages', async () => {
    const { tg, mock } = await makeTg(t => t.extend(flow()).extend(mediaGroup({ window: 100 })))

    let pulls = 0

    mock.expect('getUpdates', () => {
      pulls++

      if (pulls === 1) {
        return {
          ok: true,
          result: [
            { update_id: 1, message: { message_id: 1, date: 0, chat: { id: 100, type: 'private' }, text: 'plain' } }
          ]
        }
      }

      return { ok: true, result: [] }
    })

    await tg.start()

    const startPromise = tg.startPolling()
    const matched = await (tg as any).flow.waitFor('message')

    tg.stopPolling()
    await startPromise

    expect(matched.raw.text).toBe('plain')

    await mock.stop()
  })
})
