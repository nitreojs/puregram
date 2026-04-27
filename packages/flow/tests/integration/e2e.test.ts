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
    const matched = await tg.flow.waitFor('message')

    tg.stopPolling()
    await startPromise

    expect(matched?.kind).toBe('message')
    expect(matched?.raw.text).toBe('hello')

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
    const reply = await tg.flow.prompt(100, 'name?', { from: 7 })

    tg.stopPolling()
    await startPromise

    expect(reply?.raw.text).toBe('alice')

    await mock.stop()
  })

  it('mediaGroup buffers album messages and emits one composite', async () => {
    // window is huge so the natural timer never fires; we drive emission via tg.media_group.flush()
    const { tg, mock } = await makeTg(t => t.extend(mediaGroup({ window: 60_000 })))

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

    tg.on('media_group', (u) => {
      composites.push(u)
    })

    const singletons: unknown[] = []

    tg.on('message', (u) => {
      singletons.push(u)
    })

    const startPromise = tg.startPolling()

    // give polling enough real time to deliver the batch over loopback http
    await sleep(50)

    // force emission deterministically rather than waiting on the album window
    tg.media_group.flush()

    // let the synthesised media_group dispatch settle through the chain
    await new Promise(resolve => setImmediate(resolve))

    tg.stopPolling()
    await startPromise

    expect(singletons).toHaveLength(0)
    expect(composites).toHaveLength(1)
    expect(composites[0]?.kind).toBe('media_group')
    expect(composites[0]?.messages).toHaveLength(3)
    expect(composites[0]?.id).toBe('album-1')

    await mock.stop()
  })

  it('prompt resolves when called from inside a tg.on handler (no polling deadlock)', async () => {
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
            { update_id: 1, message: { message_id: 1, date: 0, chat: { id: 100, type: 'private' }, text: '/ask' } }
          ]
        }
      }

      if (pulls === 2) {
        return {
          ok: true,
          result: [
            { update_id: 2, message: { message_id: 2, date: 0, chat: { id: 100, type: 'private' }, text: 'alice' } }
          ]
        }
      }

      return { ok: true, result: [] }
    })

    let resolvedReply: any = null

    tg.on('message', async (msg) => {
      if (msg.raw.text !== '/ask') {
        return
      }

      // awaited prompt from inside a handler — must not deadlock
      resolvedReply = await tg.flow.prompt(msg.raw.chat.id, 'name?')
    })

    await tg.start()

    tg.startPolling().catch(() => {})

    // give polling a moment to deliver both batches and resolve the prompt
    const start = Date.now()

    // eslint-disable-next-line no-unmodified-loop-condition -- mutated by async handler closure
    while (resolvedReply === null && Date.now() - start < 2000) {
      await new Promise(resolve => setTimeout(resolve, 20))
    }

    tg.stopPolling()

    expect(resolvedReply).not.toBeNull()
    expect(resolvedReply.raw.text).toBe('alice')

    await mock.stop()
  })

  it('update.flow.prompt auto-fills chat + sender from the source message', async () => {
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
                message_id: 1,
                date: 0,
                from: { id: 7, is_bot: false, first_name: 'a' },
                chat: { id: 100, type: 'private' },
                text: '/ask'
              }
            }
          ]
        }
      }

      // intentionally include a second message from a different sender — it must
      // NOT match the prompt because the augment middleware pinned `from: 7`
      if (pulls === 2) {
        return {
          ok: true,
          result: [
            {
              update_id: 2,
              message: {
                message_id: 2,
                date: 0,
                from: { id: 8, is_bot: false, first_name: 'b' },
                chat: { id: 100, type: 'private' },
                text: 'wrong sender'
              }
            }
          ]
        }
      }

      if (pulls === 3) {
        return {
          ok: true,
          result: [
            {
              update_id: 3,
              message: {
                message_id: 3,
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

    let resolvedReply: any = null

    tg.on('message', async (msg) => {
      if (msg.raw.text !== '/ask') {
        return
      }

      resolvedReply = await msg.flow.prompt('name?')
    })

    await tg.start()

    tg.startPolling().catch(() => {})

    const start = Date.now()

    // eslint-disable-next-line no-unmodified-loop-condition -- mutated by async handler closure
    while (resolvedReply === null && Date.now() - start < 2000) {
      await new Promise(resolve => setTimeout(resolve, 20))
    }

    tg.stopPolling()

    expect(resolvedReply).not.toBeNull()
    expect(resolvedReply.raw.text).toBe('alice')
    expect(resolvedReply.raw.from.id).toBe(7)

    await mock.stop()
  })

  it('update.flow.waitFor scopes by chat (match: "chat") and matches a callback_query in same chat', async () => {
    const { tg, mock } = await makeTg(t => t.extend(flow()))

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
                from: { id: 7, is_bot: false, first_name: 'a' },
                chat: { id: 100, type: 'private' },
                text: '/wait'
              }
            }
          ]
        }
      }

      // callback_query from a different chat — must not match
      if (pulls === 2) {
        return {
          ok: true,
          result: [
            {
              update_id: 2,
              callback_query: {
                id: 'cq-other',
                from: { id: 9, is_bot: false, first_name: 'c' },
                message: { message_id: 1, date: 0, chat: { id: 999, type: 'private' } },
                chat_instance: 'inst',
                data: 'red'
              }
            }
          ]
        }
      }

      if (pulls === 3) {
        return {
          ok: true,
          result: [
            {
              update_id: 3,
              callback_query: {
                id: 'cq-match',
                from: { id: 8, is_bot: false, first_name: 'b' },
                message: { message_id: 1, date: 0, chat: { id: 100, type: 'private' } },
                chat_instance: 'inst',
                data: 'blue'
              }
            }
          ]
        }
      }

      return { ok: true, result: [] }
    })

    let resolvedCq: any = null

    tg.on('message', async (msg) => {
      if (msg.raw.text !== '/wait') {
        return
      }

      resolvedCq = await msg.flow.waitFor('callback_query', { match: 'chat' })
    })

    await tg.start()

    tg.startPolling().catch(() => {})

    const start = Date.now()

    // eslint-disable-next-line no-unmodified-loop-condition -- mutated by async handler closure
    while (resolvedCq === null && Date.now() - start < 2000) {
      await new Promise(resolve => setTimeout(resolve, 20))
    }

    tg.stopPolling()

    expect(resolvedCq).not.toBeNull()
    expect(resolvedCq.raw.id).toBe('cq-match')
    expect(resolvedCq.raw.data).toBe('blue')

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
    const matched = await tg.flow.waitFor('message')

    tg.stopPolling()
    await startPromise

    expect(matched?.raw.text).toBe('plain')

    await mock.stop()
  })
})
