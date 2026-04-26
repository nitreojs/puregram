import { describe, it, expect, vi, afterEach } from 'vitest'

import { defaultHttpClient } from '../../src/http/client'

describe('defaultHttpClient', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns status + json from a fetch response', async () => {
    const mockJson = { ok: true, result: { foo: 1 } }

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      status: 200,
      json: () => Promise.resolve(mockJson)
    }))

    const out = await defaultHttpClient.request({
      url: 'http://example.com/x',
      init: { method: 'GET' }
    })

    expect(out.status).toBe(200)
    expect(await out.json()).toEqual(mockJson)
  })
})
