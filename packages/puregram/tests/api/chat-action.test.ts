import { describe, it, expect, vi, afterEach } from 'vitest'

import { ChatActionController } from '../../src/api/chat-action'

function recordingTg () {
  const calls: Record<string, unknown>[] = []

  const tg = {
    api: {
      sendChatAction: (params: Record<string, unknown>) => {
        calls.push(params)

        return Promise.resolve(true)
      }
    }
  }

  return { calls, tg: tg as never }
}

describe('ChatActionController', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('sends immediately, then every interval, until stop()', async () => {
    vi.useFakeTimers()

    const { calls, tg } = recordingTg()
    const controller = new ChatActionController(tg, 555, 'typing', { interval: 5000 })

    controller.start()
    expect(controller.started).toBe(true)

    await vi.advanceTimersByTimeAsync(0)
    expect(calls).toHaveLength(1)
    expect(calls[0]).toMatchObject({ chat_id: 555, action: 'typing' })

    await vi.advanceTimersByTimeAsync(5000)
    expect(calls).toHaveLength(2)

    await vi.advanceTimersByTimeAsync(5000)
    expect(calls).toHaveLength(3)

    controller.stop()
    expect(controller.started).toBe(false)

    await vi.advanceTimersByTimeAsync(20000)
    expect(calls).toHaveLength(3)
  })

  it('honors wait before the first send', async () => {
    vi.useFakeTimers()

    const { calls, tg } = recordingTg()
    const controller = new ChatActionController(tg, 1, 'typing', { interval: 5000, wait: 2000 })

    controller.start()

    await vi.advanceTimersByTimeAsync(1999)
    expect(calls).toHaveLength(0)

    await vi.advanceTimersByTimeAsync(1)
    expect(calls).toHaveLength(1)

    controller.stop()
  })

  it('stops once timeout elapses', async () => {
    vi.useFakeTimers()

    const { calls, tg } = recordingTg()
    const controller = new ChatActionController(tg, 1, 'typing', { interval: 1000, timeout: 2500 })

    controller.start()

    await vi.advanceTimersByTimeAsync(20000)
    expect(controller.started).toBe(false)

    const settled = calls.length

    expect(settled).toBeGreaterThan(1)

    await vi.advanceTimersByTimeAsync(20000)
    expect(calls).toHaveLength(settled)
  })

  it('stops on the first api error', async () => {
    vi.useFakeTimers()

    const calls: Record<string, unknown>[] = []
    const tg = {
      api: {
        sendChatAction: (params: Record<string, unknown>) => {
          calls.push(params)

          if (calls.length === 2) {
            return Promise.reject(new Error('chat not found'))
          }

          return Promise.resolve(true)
        }
      }
    } as never

    const controller = new ChatActionController(tg, 1, 'typing', { interval: 1000 })

    controller.start()

    await vi.advanceTimersByTimeAsync(10000)
    expect(calls).toHaveLength(2)
    expect(controller.started).toBe(false)
  })

  it('forwards extra sendChatAction params (e.g. message_thread_id)', async () => {
    vi.useFakeTimers()

    const { calls, tg } = recordingTg()
    const controller = new ChatActionController(tg, 1, 'upload_photo', { message_thread_id: 42 })

    controller.start()
    await vi.advanceTimersByTimeAsync(0)

    expect(calls[0]).toMatchObject({ chat_id: 1, action: 'upload_photo', message_thread_id: 42 })

    controller.stop()
  })
})
