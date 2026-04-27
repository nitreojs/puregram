import { describe, it, expect } from 'vitest'

import { createPlugin } from '../src/plugins/plugin'
import { Telegram } from '../src/telegram'

const STUB_BOT = { id: 1, is_bot: true, first_name: 'stub', username: 'stubbot' } as any

describe('Telegram', () => {
  it('constructs with token + applies defaults', () => {
    const tg = new Telegram({ token: 'TEST' })

    expect(tg.options.token).toBe('TEST')
    expect(tg.options.apiBaseUrl).toBe('https://api.telegram.org/bot')
  })

  it('fromToken factory', () => {
    const tg = Telegram.fromToken('X')

    expect(tg.options.token).toBe('X')
  })

  it('isErrorResponse type guard', () => {
    expect(Telegram.isErrorResponse({ ok: false, error_code: 400, description: 'bad' })).toBe(true)
    expect(Telegram.isErrorResponse({ ok: true, result: 'x' })).toBe(false)
    expect(Telegram.isErrorResponse(null)).toBe(false)
  })

  it('.extend chains plugins and types', async () => {
    const session = createPlugin({
      name: 'session',
      install: () => ({ get: (k: string) => k.toUpperCase() })
    })

    const tg = new Telegram({ token: 'X', bot: STUB_BOT }).extend(session)

    await tg.start()
    expect((tg as any).session.get('hello')).toBe('HELLO')
  })

  it('.start runs onInit hooks', async () => {
    const trace: string[] = []
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })

    tg.useHook('onInit', () => {
      trace.push('init')
    })
    await tg.start()
    expect(trace).toEqual(['init'])
  })

  it('.shutdown runs onShutdown hooks', async () => {
    const trace: string[] = []
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })

    tg.useHook('onShutdown', () => {
      trace.push('shutdown')
    })
    await tg.start()
    await tg.shutdown()
    expect(trace).toEqual(['shutdown'])
  })

  it('.has reflects installed plugins', async () => {
    const session = createPlugin({ name: 'session', install: () => ({}) })
    const tg = new Telegram({ token: 'X', bot: STUB_BOT }).extend(session)

    expect(tg.has('session')).toBe(false)
    await tg.start()
    expect(tg.has('session')).toBe(true)
  })

  it('throws PluginConflict on duplicate plugin', async () => {
    const a = createPlugin({ name: 'session', install: () => ({}) })
    const b = createPlugin({ name: 'session', install: () => ({}) })
    const tg = new Telegram({ token: 'X', bot: STUB_BOT }).extend(a).extend(b)

    await expect(tg.start()).rejects.toThrow(/conflict/)
  })

  it('pre-populates tg.bot from options.bot, no getMe call', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })

    expect(tg.bot).toBe(STUB_BOT)
    await tg.start()
    expect(tg.bot).toBe(STUB_BOT)
  })

  it('use(fn) registers a middleware that runs before tg.on handlers', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const trace: string[] = []

    tg.use((_update, next) => {
      trace.push('use')

      return next()
    })
    tg.on('message', () => {
      trace.push('handler')
    })

    await (tg as any).dispatch({
      kind: 'message',
      raw: { message_id: 1, date: 0, chat: { id: 100, type: 'private' } }
    })

    expect(trace).toEqual(['use', 'handler'])
  })
})
