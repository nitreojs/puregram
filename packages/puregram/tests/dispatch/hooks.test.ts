import { describe, it, expect } from 'vitest'
import { HookRegistry } from '../../src/dispatch/hooks'

describe('HookRegistry', () => {
  it('registers and runs request-stage hooks in order', async () => {
    const reg = new HookRegistry()
    const trace: string[] = []

    reg.add('onBeforeRequest', async (_ctx, next) => {
      trace.push('a-pre')
      await next()
      trace.push('a-post')
    })
    reg.add('onBeforeRequest', async (_ctx, next) => {
      trace.push('b-pre')
      await next()
      trace.push('b-post')
    })

    await reg.run('onBeforeRequest', { method: 'getMe', params: undefined })
    expect(trace).toEqual(['a-pre', 'b-pre', 'b-post', 'a-post'])
  })

  it('priority-aware onUpdate: high before normal before low', async () => {
    const reg = new HookRegistry()
    const trace: string[] = []

    reg.add('onUpdate', async (_, next) => { trace.push('low'); await next() }, { priority: 'low' })
    reg.add('onUpdate', async (_, next) => { trace.push('high'); await next() }, { priority: 'high' })
    reg.add('onUpdate', async (_, next) => { trace.push('normal'); await next() })

    await reg.run('onUpdate', {} as any)
    expect(trace).toEqual(['high', 'normal', 'low'])
  })

  it('short-circuits when a hook does not call next', async () => {
    const reg = new HookRegistry()
    const trace: string[] = []

    reg.add('onUpdate', async () => { trace.push('a') })
    reg.add('onUpdate', async (_, next) => { trace.push('b'); await next() })

    await reg.run('onUpdate', {} as any)
    expect(trace).toEqual(['a'])
  })

  it('onError returns possibly-replaced error', async () => {
    const reg = new HookRegistry()
    reg.add('onError', (err) => new Error(`wrapped: ${err.message}`))

    const result = await reg.runError(new Error('original'), {} as any)
    expect(result.message).toBe('wrapped: original')
  })
})
