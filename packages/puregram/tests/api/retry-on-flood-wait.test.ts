import { describe, it, expect, vi } from 'vitest'

import { runRequest } from '../../src/api/lifecycle'
import { HookRegistry } from '../../src/dispatch/hooks'
import { defaultHttpClient } from '../../src/http/client'
import type { HttpClient } from '../../src/http/client'
import type { ResolvedTelegramOptions } from '../../src/options'

const baseOptions = (overrides: Partial<ResolvedTelegramOptions> = {}) => {
  const out: ResolvedTelegramOptions = {
    token: 'TEST',
    httpClient: undefined,
    apiBaseUrl: 'https://api.telegram.org/bot',
    apiTimeout: 5000,
    apiWait: 1000,
    apiRetryLimit: 0,
    apiHeaders: {},
    useTestDc: false,
    useLocal: false,
    allowedUpdates: [],
    retryOnFloodWait: false,
    swallowDispatchErrors: false,
    ...overrides
  }

  return out
}

const baseDeps = (httpClient: HttpClient = defaultHttpClient, overrides: Partial<ResolvedTelegramOptions> = {}) => ({
  options: baseOptions(overrides),
  hooks: new HookRegistry(),
  httpClient
})

const flood = (retryAfter: number) => ({
  status: 200,
  json: () => Promise.resolve({
    ok: false,
    error_code: 429,
    description: 'too many requests',
    parameters: { retry_after: retryAfter }
  })
})

const ok = (result: unknown) => ({
  status: 200,
  json: () => Promise.resolve({ ok: true, result })
})

describe('runRequest retryOnFloodWait', () => {
  it('does not retry by default — propagates ApiError', async () => {
    const request = vi.fn().mockResolvedValueOnce(flood(1))
    const deps = baseDeps({ request })

    await expect(runRequest(deps, 'sendMessage', { chat_id: 1, text: 'hi' })).rejects.toMatchObject({
      code: 429
    })

    expect(request).toHaveBeenCalledTimes(1)
  })

  it('retries once when retryOnFloodWait: true', async () => {
    const request = vi.fn()
      .mockResolvedValueOnce(flood(0))
      .mockResolvedValueOnce(ok({ message_id: 7 }))

    const deps = baseDeps({ request }, { retryOnFloodWait: true })

    const result = await runRequest(deps, 'sendMessage', { chat_id: 1, text: 'hi' })

    expect(result).toEqual({ message_id: 7 })
    expect(request).toHaveBeenCalledTimes(2)
  })

  it('respects max retries — gives up after max attempts', async () => {
    const request = vi.fn().mockResolvedValue(flood(0))

    const deps = baseDeps({ request }, { retryOnFloodWait: { max: 2 } })

    await expect(runRequest(deps, 'sendMessage', { chat_id: 1, text: 'hi' })).rejects.toMatchObject({
      code: 429
    })

    // initial + 2 retries
    expect(request).toHaveBeenCalledTimes(3)
  })

  it('gives up immediately when retry_after * 1000 > maxWaitMs', async () => {
    const request = vi.fn().mockResolvedValueOnce(flood(5))

    const deps = baseDeps({ request }, { retryOnFloodWait: { max: 5, maxWaitMs: 1000 } })

    await expect(runRequest(deps, 'sendMessage', { chat_id: 1, text: 'hi' })).rejects.toMatchObject({
      code: 429
    })

    expect(request).toHaveBeenCalledTimes(1)
  })

  it('does not retry non-429 errors', async () => {
    const request = vi.fn().mockResolvedValueOnce({
      status: 200,
      json: () => Promise.resolve({ ok: false, error_code: 400, description: 'bad' })
    })

    const deps = baseDeps({ request }, { retryOnFloodWait: true })

    await expect(runRequest(deps, 'sendMessage', { chat_id: 1 })).rejects.toMatchObject({
      code: 400
    })

    expect(request).toHaveBeenCalledTimes(1)
  })

  it('sleeps roughly retry_after seconds before retrying', async () => {
    const request = vi.fn()
      .mockResolvedValueOnce(flood(1))
      .mockResolvedValueOnce(ok({ message_id: 1 }))

    const deps = baseDeps({ request }, { retryOnFloodWait: true })

    const started = Date.now()

    await runRequest(deps, 'sendMessage', { chat_id: 1, text: 'hi' })

    const elapsed = Date.now() - started

    // allow some slack for timer jitter; the floor is what matters
    expect(elapsed).toBeGreaterThanOrEqual(900)
  })
})

describe('runRequest broadened retry', () => {
  const serverError = () => ({
    status: 200,
    json: () => Promise.resolve({ ok: false, error_code: 500, description: 'internal' })
  })

  it('retries 5xx when on includes "server"', async () => {
    const request = vi.fn()
      .mockResolvedValueOnce(serverError())
      .mockResolvedValueOnce(ok({ message_id: 1 }))

    const deps = baseDeps({ request }, { retryOnFloodWait: { max: 1, on: ['server'], backoff: { base: 10 } } })

    const result = await runRequest(deps, 'sendMessage', { chat_id: 1, text: 'hi' })

    expect(result).toEqual({ message_id: 1 })
    expect(request).toHaveBeenCalledTimes(2)
  })

  it('does not retry 5xx with the default flood-only config', async () => {
    const request = vi.fn().mockResolvedValueOnce(serverError())

    const deps = baseDeps({ request }, { retryOnFloodWait: true })

    await expect(runRequest(deps, 'sendMessage', { chat_id: 1 })).rejects.toMatchObject({ code: 500 })
    expect(request).toHaveBeenCalledTimes(1)
  })

  it('retries transport errors when on includes "network"', async () => {
    const request = vi.fn()
      .mockRejectedValueOnce(new Error('socket hang up'))
      .mockResolvedValueOnce(ok({ message_id: 7 }))

    const deps = baseDeps({ request }, { retryOnFloodWait: { max: 1, on: ['network'], backoff: { base: 10 } } })

    const result = await runRequest(deps, 'sendMessage', { chat_id: 1, text: 'hi' })

    expect(result).toEqual({ message_id: 7 })
    expect(request).toHaveBeenCalledTimes(2)
  })

  it('does not retry transport errors with the default flood-only config', async () => {
    const request = vi.fn().mockRejectedValueOnce(new Error('socket hang up'))

    const deps = baseDeps({ request }, { retryOnFloodWait: true })

    await expect(runRequest(deps, 'sendMessage', { chat_id: 1 })).rejects.toThrow('socket hang up')
    expect(request).toHaveBeenCalledTimes(1)
  })
})
