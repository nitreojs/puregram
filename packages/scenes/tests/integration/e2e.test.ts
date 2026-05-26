import { session } from '@puregram/session'
import { MemoryStorage } from '@puregram/storage'
import { describe, expect, it, vi } from 'vitest'

import { scenes, StepScene } from '../../src'
import { makeTg } from '../helpers/make-tg'

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

describe('@puregram/scenes — e2e', () => {
  it('user enters scene → next message reenters it', async () => {
    const storage = new MemoryStorage()
    const enter = vi.fn()
    const wizard = new StepScene('wizard', { enterHandler: enter, steps: [() => {}] })

    const { tg, mock } = await makeTg(t => t
      .extend(session({ storage }))
      .extend(scenes({ scenes: [wizard] }))
    )

    let pulls = 0

    mock.expect('getUpdates', () => {
      pulls++

      if (pulls === 1) {
        return {
          ok: true,
          result: [
            { update_id: 1, message: { message_id: 1, date: 0, from: { id: 7, is_bot: false, first_name: 'a' }, chat: { id: 100, type: 'private' }, text: '/start' } }
          ]
        }
      }

      if (pulls === 2) {
        return {
          ok: true,
          result: [
            { update_id: 2, message: { message_id: 2, date: 0, from: { id: 7, is_bot: false, first_name: 'a' }, chat: { id: 100, type: 'private' }, text: 'alice' } }
          ]
        }
      }

      return { ok: true, result: [] }
    })

    let userHandlerHits = 0

    tg.on('message', async (u) => {
      userHandlerHits++

      if (u.raw.text === '/start') {
        await u.scene.enter('wizard')
      }
    })

    const startPromise = tg.startPolling()

    while (enter.mock.calls.length < 2) {
      await sleep(10)
    }

    tg.stopPolling()
    await startPromise

    expect(enter).toHaveBeenCalledTimes(2)
    expect(userHandlerHits).toBe(1)

    await mock.stop()
    await tg.shutdown()
  })

  it('scene.leave() drops session.__scene; subsequent updates run user handler', async () => {
    const storage = new MemoryStorage()
    const wizard = new StepScene('wizard', {
      steps: [async (p) => {
        await p.scene.leave()
      }]
    })

    const { tg, mock } = await makeTg(t => t
      .extend(session({ storage }))
      .extend(scenes({ scenes: [wizard] }))
    )

    let pulls = 0

    mock.expect('getUpdates', () => {
      pulls++

      if (pulls === 1) {
        return {
          ok: true,
          result: [
            { update_id: 1, message: { message_id: 1, date: 0, from: { id: 7, is_bot: false, first_name: 'a' }, chat: { id: 100, type: 'private' }, text: 'enter' } }
          ]
        }
      }

      if (pulls === 2) {
        return {
          ok: true,
          result: [
            { update_id: 2, message: { message_id: 2, date: 0, from: { id: 7, is_bot: false, first_name: 'a' }, chat: { id: 100, type: 'private' }, text: 'after-leave' } }
          ]
        }
      }

      return { ok: true, result: [] }
    })

    const userHits: string[] = []

    tg.on('message', async (u) => {
      userHits.push(u.raw.text!)

      if (u.raw.text === 'enter') {
        await u.scene.enter('wizard')
      }
    })

    const startPromise = tg.startPolling()

    while (userHits.length < 2) {
      await sleep(10)
    }

    tg.stopPolling()
    await startPromise

    expect(userHits).toEqual(['enter', 'after-leave'])

    const stored = await storage.get('user:7:chat:100') as { __scene?: unknown } | undefined

    expect(stored?.__scene).toBeUndefined()

    await mock.stop()
    await tg.shutdown()
  })

  it('step.next() advances to the next handler on the next update', async () => {
    const storage = new MemoryStorage()
    const step0 = vi.fn().mockImplementation(p => p.scene.step.next({ silent: true }))
    const step1 = vi.fn()
    const wizard = new StepScene('wizard', [step0, step1])

    const { tg, mock } = await makeTg(t => t
      .extend(session({ storage }))
      .extend(scenes({ scenes: [wizard] }))
    )

    let pulls = 0

    mock.expect('getUpdates', () => {
      pulls++

      if (pulls === 1) {
        return {
          ok: true,
          result: [
            { update_id: 1, message: { message_id: 1, date: 0, from: { id: 7, is_bot: false, first_name: 'a' }, chat: { id: 100, type: 'private' }, text: '/wizard' } }
          ]
        }
      }

      if (pulls === 2) {
        return {
          ok: true,
          result: [
            { update_id: 2, message: { message_id: 2, date: 0, from: { id: 7, is_bot: false, first_name: 'a' }, chat: { id: 100, type: 'private' }, text: 'next' } }
          ]
        }
      }

      return { ok: true, result: [] }
    })

    tg.on('message', async (u) => {
      if (u.raw.text === '/wizard') {
        await u.scene.enter('wizard')
      }
    })

    const startPromise = tg.startPolling()

    while (step1.mock.calls.length === 0) {
      await sleep(10)
    }

    tg.stopPolling()
    await startPromise

    expect(step0).toHaveBeenCalled()
    expect(step1).toHaveBeenCalled()

    await mock.stop()
    await tg.shutdown()
  })
})
