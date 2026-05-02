import { describe, expect, it } from 'vitest'

import { InterceptingHttpClient } from '../src/http/intercept'

describe('InterceptingHttpClient', () => {
  it('returns the canned response', async () => {
    const client = new InterceptingHttpClient((method, params) => ({
      ok: true,
      result: { method, params }
    }))

    const res = await client.request({
      url: 'http://api/botX/sendMessage',
      init: { method: 'GET' }
    })

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({
      ok: true,
      result: { method: 'sendMessage', params: {} }
    })
  })

  it('parses query-string params', async () => {
    const seen: { method: string, params: Record<string, unknown> }[] = []
    const client = new InterceptingHttpClient((method, params) => {
      seen.push({ method, params })

      return { ok: true, result: true }
    })

    await client.request({
      url: 'http://api/botX/sendMessage?chat_id=42&text=hi',
      init: { method: 'GET' }
    })

    expect(seen).toEqual([{ method: 'sendMessage', params: { chat_id: 42, text: 'hi' } }])
  })

  it('parses application/json body', async () => {
    let seen: Record<string, unknown> | undefined
    const client = new InterceptingHttpClient((_method, params) => {
      seen = params

      return { ok: true, result: true }
    })

    await client.request({
      url: 'http://api/botX/sendMessage',
      init: {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id: 42, text: 'hi' })
      }
    })

    expect(seen).toEqual({ chat_id: 42, text: 'hi' })
  })

  it('treats multipart bodies as opaque (params come from snapshot)', async () => {
    let seen: Record<string, unknown> | undefined
    const client = new InterceptingHttpClient((_method, params) => {
      seen = params

      return { ok: true, result: true }
    })

    await client.request({
      url: 'http://api/botX/sendPhoto',
      init: {
        method: 'POST',
        headers: { 'content-type': 'multipart/form-data; boundary=---x' },
        body: '----xchat_id=1...'
      }
    })

    expect(seen).toEqual({})
  })
})
