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

  it('on(kinds[]) registers a handler against multiple update kinds', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const trace: string[] = []

    tg.onMessage((u) => {
      trace.push(u.kind)
    })
    tg.onEditedMessage((u) => {
      trace.push(u.kind)
    })

    await (tg as any).dispatch({
      kind: 'message',
      raw: { message_id: 1, date: 0, chat: { id: 100, type: 'private' } }
    })
    await (tg as any).dispatch({
      kind: 'edited_message',
      raw: { message_id: 1, date: 0, chat: { id: 100, type: 'private' } }
    })

    expect(trace).toEqual(['message', 'edited_message'])
  })

  it('use(fn) registers a middleware that runs before tg.on handlers', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const trace: string[] = []

    tg.use((_update, next) => {
      trace.push('use')

      return next()
    })
    tg.onMessage(() => {
      trace.push('handler')
    })

    await (tg as any).dispatch({
      kind: 'message',
      raw: { message_id: 1, date: 0, chat: { id: 100, type: 'private' } }
    })

    expect(trace).toEqual(['use', 'handler'])
  })

  it('command(name) matches `/<name>` and the canonical variants, passes others to next()', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const seen: string[] = []
    const fellThrough: string[] = []

    tg.command('hello', (message) => {
      seen.push(message.raw.text!)
    })
    tg.onMessage((message) => {
      fellThrough.push(message.raw.text!)
    })

    const dispatch = (text: string) => (tg as any).dispatch({
      kind: 'message',
      raw: { message_id: 1, date: 0, chat: { id: 100, type: 'private' }, text }
    })

    await dispatch('/hello')
    await dispatch('/hello world')
    await dispatch('/hello@stubbot')
    await dispatch('/hello@StubBot args')
    await dispatch('/HELLO')
    await dispatch('/hi')
    await dispatch('not a command')

    expect(seen).toEqual(['/hello', '/hello world', '/hello@stubbot', '/hello@StubBot args', '/HELLO'])
    expect(fellThrough).toEqual(['/hi', 'not a command'])
  })

  it('command(name) skips `/<name>@<otherbot>` so commands addressed to other bots fall through', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const seen: string[] = []
    const fellThrough: string[] = []

    tg.command('ask', (message) => {
      seen.push(message.raw.text!)
    })
    tg.onMessage((message) => {
      fellThrough.push(message.raw.text!)
    })

    const dispatch = (text: string) => (tg as any).dispatch({
      kind: 'message',
      raw: { message_id: 1, date: 0, chat: { id: 100, type: 'private' }, text }
    })

    await dispatch('/ask@otherbot')
    await dispatch('/ask@OtherBot args')
    await dispatch('/ask@stubbot')

    expect(seen).toEqual(['/ask@stubbot'])
    expect(fellThrough).toEqual(['/ask@otherbot', '/ask@OtherBot args'])
  })

  it('command(regex) attaches RegExpMatchArray to message.match while the handler runs', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    let captured: string | undefined

    tg.command(/^\/say(?:\s+(?<text>.+))?$/i, (message) => {
      captured = message.match?.groups?.text
    })

    await (tg as any).dispatch({
      kind: 'message',
      raw: { message_id: 1, date: 0, chat: { id: 100, type: 'private' }, text: '/say hello world' }
    })

    expect(captured).toBe('hello world')
  })

  it('command(name) does nothing when message.text is missing (e.g. photo-only message)', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const seen: string[] = []
    let fellThrough = false

    tg.command('hello', () => {
      seen.push('matched')
    })
    tg.onMessage(() => {
      fellThrough = true
    })

    await (tg as any).dispatch({
      kind: 'message',
      raw: { message_id: 1, date: 0, chat: { id: 100, type: 'private' } }
    })

    expect(seen).toEqual([])
    expect(fellThrough).toBe(true)
  })

  it('routes handler errors through onDispatchError with raw payload', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const seen: { msg: string, raw: Record<string, unknown> }[] = []

    tg.useHook('onDispatchError', (err, ctx) => {
      seen.push({ msg: err.message, raw: ctx.raw })
    })

    tg.onMessage(() => {
      throw new Error('handler boom')
    })

    const raw = {
      update_id: 42,
      message: { message_id: 1, date: 0, chat: { id: 100, type: 'private' }, text: 'hi' }
    }

    const callback = tg.getWebhookCallback()
    const noopRes = {
      writeHead: () => undefined,
      end: () => undefined
    } as any
    const req: any = { method: 'POST', headers: {} }

    req[Symbol.asyncIterator] = function * () {
      yield Buffer.from(JSON.stringify(raw))
    }

    await callback(req, noopRes)
    // webhook dispatches inside setImmediate; let it flush
    await new Promise(resolve => setImmediate(resolve))
    await new Promise(resolve => setImmediate(resolve))

    expect(seen).toHaveLength(1)
    expect(seen[0]?.msg).toBe('handler boom')
    expect(seen[0]?.raw).toEqual(raw)
  })

  it('falls through to uncaughtException when no onDispatchError is registered', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })

    const caught: Error[] = []
    const listener = (err: Error) => {
      caught.push(err)
    }
    const previous = process.listeners('uncaughtException')

    process.removeAllListeners('uncaughtException')
    process.on('uncaughtException', listener)

    try {
      const internal = tg as unknown as {
        reportDispatchError: (err: Error, raw: Record<string, unknown>) => void
      }

      internal.reportDispatchError(new Error('uncaught boom'), { update_id: 1 })

      // microtask schedules the rethrow; let it run
      await new Promise(resolve => setImmediate(resolve))
      await new Promise(resolve => setImmediate(resolve))

      expect(caught.map(e => e.message)).toContain('uncaught boom')
    } finally {
      process.removeListener('uncaughtException', listener)

      for (const fn of previous) {
        process.on('uncaughtException', fn as (err: Error) => void)
      }
    }
  })
})
