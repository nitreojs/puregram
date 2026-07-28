import { MemoryStorage } from '@puregram/storage'
import { MediaSource, MediaSourceType, type RequestContext, type Telegram } from 'puregram'
import { beforeEach, describe, expect, it } from 'vitest'

import { mediaCacher, type MediaCacherExtension } from '../src/cacher'

type Hook = (ctx: unknown, next: () => Promise<void>) => unknown

interface MockTg {
  tg: Telegram
  run: (name: string, ctx: unknown) => Promise<void>
}

function mockTg () {
  const hooks: Record<string, Hook[]> = { onBeforeRequest: [], onResponseIntercept: [] }
  const tg = {
    useHook (name: string, fn: Hook) {
      const bucket = hooks[name]

      if (bucket !== undefined) {
        bucket.push(fn)
      }

      return tg
    }
  } as unknown as Telegram

  const noop = () => Promise.resolve()

  return {
    tg,
    run: async (name: string, ctx: unknown) => {
      const bucket = hooks[name] ?? []

      for (const h of bucket) {
        await h(ctx, noop)
      }
    }
  } satisfies MockTg
}

function setup (storage = new MemoryStorage<string>()) {
  const fixture = mockTg()
  const ext = mediaCacher({ storage }).install(fixture.tg) as MediaCacherExtension

  return { ...fixture, storage, ext }
}

describe('mediaCacher plugin', () => {
  let env: ReturnType<typeof setup>

  beforeEach(() => {
    env = setup()
  })

  it('cache miss on first send leaves params untouched and persists file_id from response', async () => {
    const ctx: RequestContext = {
      method: 'sendPhoto',
      params: { chat_id: 42, photo: MediaSource.path('/tmp/a.jpg') }
    }

    await env.run('onBeforeRequest', ctx)

    expect(ctx.params!.photo).toMatchObject({ type: MediaSourceType.Path, value: '/tmp/a.jpg' })

    ctx.json = { ok: true, result: { photo: [{ file_id: 'small' }, { file_id: 'large' }] } }
    await env.run('onResponseIntercept', ctx)

    expect(await env.storage.get('42:/tmp/a.jpg')).toBe('large')
  })

  it('cache hit on second send replaces media with MediaSource.fileId', async () => {
    await env.storage.set('42:/tmp/a.jpg', 'cached_id')

    const ctx: RequestContext = {
      method: 'sendPhoto',
      params: { chat_id: 42, photo: MediaSource.path('/tmp/a.jpg', { filename: 'a.jpg' }) }
    }

    await env.run('onBeforeRequest', ctx)

    expect(ctx.params!.photo).toEqual({
      type: MediaSourceType.FileId,
      value: 'cached_id',
      filename: 'a.jpg'
    })
  })

  it('animation responses come back as document — extract file_id from there', async () => {
    const ctx: RequestContext = {
      method: 'sendAnimation',
      params: { chat_id: 7, animation: MediaSource.url('https://x/a.gif') }
    }

    await env.run('onBeforeRequest', ctx)
    ctx.json = { ok: true, result: { document: { file_id: 'anim_id' } } }
    await env.run('onResponseIntercept', ctx)

    expect(await env.storage.get('7:https://x/a.gif')).toBe('anim_id')
  })

  it('skips caching for non-Path/Url media (e.g. fileId, buffer)', async () => {
    const ctx: RequestContext = {
      method: 'sendPhoto',
      params: { chat_id: 1, photo: MediaSource.fileId('already_cached') }
    }

    await env.run('onBeforeRequest', ctx)
    ctx.json = { ok: true, result: { photo: [{ file_id: 'response_id' }] } }
    await env.run('onResponseIntercept', ctx)

    expect(await env.storage.has('1:already_cached')).toBe(false)
  })

  it('does nothing when method is not in the upload map', async () => {
    const ctx: RequestContext = {
      method: 'sendMessage',
      params: { chat_id: 1, text: 'hi' }
    }

    await env.run('onBeforeRequest', ctx)
    await env.run('onResponseIntercept', ctx)

    expect(await env.storage.has('1:hi')).toBe(false)
  })

  it('leaves a bare file_id string untouched and never caches it', async () => {
    const ctx: RequestContext = {
      method: 'sendPhoto',
      params: { chat_id: 1, photo: 'AgACAgIAAxkBAAIB' }
    }

    await env.run('onBeforeRequest', ctx)

    expect(ctx.params!.photo).toBe('AgACAgIAAxkBAAIB')

    ctx.json = { ok: true, result: { photo: [{ file_id: 'response_id' }] } }
    await env.run('onResponseIntercept', ctx)

    expect(await env.storage.has('1:AgACAgIAAxkBAAIB')).toBe(false)
  })

  it('leaves a bare http url string untouched', async () => {
    const ctx: RequestContext = {
      method: 'sendPhoto',
      params: { chat_id: 1, photo: 'https://x/cat.png' }
    }

    await env.run('onBeforeRequest', ctx)

    expect(ctx.params!.photo).toBe('https://x/cat.png')
    expect(await env.storage.has('1:https://x/cat.png')).toBe(false)
  })

  it('caches and reuses the file_id of a sendVoice path upload', async () => {
    const first: RequestContext = {
      method: 'sendVoice',
      params: { chat_id: 9, voice: MediaSource.path('/tmp/hi.ogg') }
    }

    await env.run('onBeforeRequest', first)
    first.json = { ok: true, result: { voice: { file_id: 'voice_id' } } }
    await env.run('onResponseIntercept', first)

    expect(await env.storage.get('9:/tmp/hi.ogg')).toBe('voice_id')

    const second: RequestContext = {
      method: 'sendVoice',
      params: { chat_id: 9, voice: MediaSource.path('/tmp/hi.ogg') }
    }

    await env.run('onBeforeRequest', second)

    expect(second.params!.voice).toEqual({ type: MediaSourceType.FileId, value: 'voice_id' })
  })

  it('does not persist when response is not ok', async () => {
    const ctx: RequestContext = {
      method: 'sendPhoto',
      params: { chat_id: 1, photo: MediaSource.path('/tmp/x.jpg') }
    }

    await env.run('onBeforeRequest', ctx)
    ctx.json = { ok: false, error_code: 400, description: 'bad request' }
    await env.run('onResponseIntercept', ctx)

    expect(await env.storage.has('1:/tmp/x.jpg')).toBe(false)
  })
})

describe('mediaCacher extension', () => {
  it('exposes get / invalidate / storage on the install return', async () => {
    const env = setup()

    await env.storage.set('chat:src', 'fid_1')

    expect(await env.ext.get('chat', 'src')).toBe('fid_1')

    await env.ext.invalidate('chat', 'src')

    expect(await env.ext.get('chat', 'src')).toBeUndefined()
    expect(env.ext.storage).toBe(env.storage)
  })
})
