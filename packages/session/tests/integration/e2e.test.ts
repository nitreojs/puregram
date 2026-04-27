import { describe, expect, it } from 'vitest'

import { MemoryStorage, session, ttl } from '../../src'
import { makeTg } from '../helpers/make-tg'

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

describe('@puregram/session — e2e', () => {
  it('persists session across two real polled updates from the same user', async () => {
    const storage = new MemoryStorage()
    const { tg, mock } = await makeTg(t => t.extend(session({ storage })))

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
                text: 'hi'
              }
            }
          ]
        }
      }

      if (pulls === 2) {
        return {
          ok: true,
          result: [
            {
              update_id: 2,
              message: {
                message_id: 2,
                date: 0,
                from: { id: 7, is_bot: false, first_name: 'a' },
                chat: { id: 100, type: 'private' },
                text: 'again'
              }
            }
          ]
        }
      }

      return { ok: true, result: [] }
    })

    const observed: number[] = []

    tg.on('message', (u) => {
      const counter = ((u.session.counter as number | undefined) ?? 0) + 1

      u.session.counter = counter
      observed.push(counter)
    })

    const startPromise = tg.startPolling()

    while (observed.length < 2) {
      await sleep(10)
    }

    tg.stopPolling()
    await startPromise

    expect(observed).toEqual([1, 2])
    expect(await storage.get('7')).toEqual({ counter: 2 })

    await mock.stop()
    await tg.shutdown()
  })

  it('tg.session.{get,set,delete} round-trips against the configured storage', async () => {
    const storage = new MemoryStorage()
    const { tg, mock } = await makeTg(t => t.extend(session({ storage })))

    await tg.start()

    await tg.session.set('user:1', { foo: 'bar' })
    expect(await tg.session.get('user:1')).toEqual({ foo: 'bar' })
    expect(await storage.get('user:1')).toEqual({ foo: 'bar' })

    await tg.session.delete('user:1')
    expect(await tg.session.get('user:1')).toBeUndefined()

    await tg.shutdown()
    await mock.stop()
  })

  it('tracks nested writes and persists the mutated shape', async () => {
    const storage = new MemoryStorage()
    const { tg, mock } = await makeTg(t => t.extend(session({ storage })))

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
                from: { id: 11, is_bot: false, first_name: 'a' },
                chat: { id: 100, type: 'private' },
                text: 'a'
              }
            }
          ]
        }
      }

      if (pulls === 2) {
        return {
          ok: true,
          result: [
            {
              update_id: 2,
              message: {
                message_id: 2,
                date: 0,
                from: { id: 11, is_bot: false, first_name: 'a' },
                chat: { id: 100, type: 'private' },
                text: 'b'
              }
            }
          ]
        }
      }

      return { ok: true, result: [] }
    })

    const processed: number[] = []

    tg.on('message', (u) => {
      const profile = (u.session.profile as { hits: number } | undefined) ?? { hits: 0 }

      profile.hits++
      u.session.profile = profile
      processed.push(profile.hits)
    })

    const startPromise = tg.startPolling()

    while (processed.length < 2) {
      await sleep(10)
    }

    tg.stopPolling()
    await startPromise

    expect(await storage.get('11')).toEqual({ profile: { hits: 2 } })

    await mock.stop()
    await tg.shutdown()
  })

  it('ttl()-wrapped values expire on read after the window', async () => {
    const storage = new MemoryStorage()
    const { tg, mock } = await makeTg(t => t.extend(session({ storage })))

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
                from: { id: 5, is_bot: false, first_name: 'b' },
                chat: { id: 50, type: 'private' },
                text: 'set'
              }
            }
          ]
        }
      }

      return { ok: true, result: [] }
    })

    const snapshot: { initial?: unknown, expired?: unknown, done?: boolean } = {}

    tg.on('message', async (u) => {
      u.session.token = ttl('s3cret', 50)
      snapshot.initial = u.session.token

      // wait past the ttl window
      await sleep(120)

      // re-read — should be undefined
      snapshot.expired = u.session.token
      snapshot.done = true
    })

    const startPromise = tg.startPolling()

    while (!snapshot.done) {
      await sleep(10)
    }

    tg.stopPolling()
    await startPromise

    expect(snapshot.initial).toBe('s3cret')
    expect(snapshot.expired).toBeUndefined()

    await mock.stop()
    await tg.shutdown()
  })

  it('uses a custom getStorageKey when supplied', async () => {
    const storage = new MemoryStorage()
    const { tg, mock } = await makeTg(t => t.extend(session({
      storage,
      getStorageKey: () => 'global'
    })))

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
                text: 'a'
              }
            }
          ]
        }
      }

      if (pulls === 2) {
        return {
          ok: true,
          result: [
            {
              update_id: 2,
              message: {
                message_id: 2,
                date: 0,
                from: { id: 9, is_bot: false, first_name: 'b' },
                chat: { id: 200, type: 'private' },
                text: 'b'
              }
            }
          ]
        }
      }

      return { ok: true, result: [] }
    })

    const seen: number[] = []

    tg.on('message', (u) => {
      u.session.hits = ((u.session.hits as number | undefined) ?? 0) + 1
      seen.push(u.session.hits as number)
    })

    const startPromise = tg.startPolling()

    while (seen.length < 2) {
      await sleep(10)
    }

    tg.stopPolling()
    await startPromise

    // both messages — different from.id — share the same key
    expect(await storage.get('global')).toEqual({ hits: 2 })
    expect(await storage.get('7')).toBeUndefined()
    expect(await storage.get('9')).toBeUndefined()

    await mock.stop()
    await tg.shutdown()
  })
})
