import { describe, it, expect, vi } from 'vitest'
import { createApiProxy, type ApiCaller } from '../../src/api/proxy'

describe('createApiProxy', () => {
  it('routes named method calls to the caller', async () => {
    const caller: ApiCaller = vi.fn().mockResolvedValue({ id: 1, is_bot: true })
    const api = createApiProxy(caller)

    const result = await (api as any).getMe()
    expect(caller).toHaveBeenCalledWith('getMe', undefined)
    expect(result).toEqual({ id: 1, is_bot: true })
  })

  it('routes call("name", params)', async () => {
    const caller: ApiCaller = vi.fn().mockResolvedValue('ok')
    const api = createApiProxy(caller)

    await api.call('sendMessage', { chat_id: 1, text: 'hi' })
    expect(caller).toHaveBeenCalledWith('sendMessage', { chat_id: 1, text: 'hi' })
  })

  it('passes the suppress flag through', async () => {
    const caller: ApiCaller = vi.fn().mockResolvedValue({ ok: false, error_code: 400, description: 'bad' })
    const api = createApiProxy(caller)

    await (api as any).sendMessage({ chat_id: 1, text: 'hi', suppress: true })
    expect(caller).toHaveBeenCalledWith('sendMessage', { chat_id: 1, text: 'hi', suppress: true })
  })
})
