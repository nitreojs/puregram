import { Telegram } from 'puregram'
import { afterEach, describe, expect, it } from 'vitest'

import { createTestEnv } from '../../src'

describe('media verbs', () => {
  let cleanup: (() => Promise<void>) | undefined

  afterEach(async () => {
    await cleanup?.()
    cleanup = undefined
  })

  it('user.sendPhoto(buffer) yields a deterministic file_id', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const events: { fileId: string }[] = []

    tg.onMessage((u) => {
      if (u.raw.photo !== undefined) {
        const photos = u.raw.photo as { file_id: string }[]

        events.push({ fileId: photos[0]?.file_id ?? '' })
      }
    })

    const alice = env.createUser()
    const buf = Buffer.from('photo content')

    await alice.sendPhoto({ source: 'buffer', value: buf })

    expect(events).toHaveLength(1)
    expect(events[0]?.fileId).toBeTruthy()

    await alice.sendPhoto({ source: 'buffer', value: buf })

    expect(events).toHaveLength(2)
    expect(events[1]?.fileId).toBe(events[0]?.fileId)
  })

  it('different buffers yield different file_ids', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const ids: string[] = []

    tg.onMessage((u) => {
      const photos = u.raw.photo as { file_id: string }[] | undefined

      if (photos?.[0] !== undefined) {
        ids.push(photos[0].file_id)
      }
    })

    const alice = env.createUser()

    await alice.sendPhoto({ source: 'buffer', value: Buffer.from('one') })
    await alice.sendPhoto({ source: 'buffer', value: Buffer.from('two') })

    expect(ids).toHaveLength(2)
    expect(ids[0]).not.toBe(ids[1])
  })

  it('user.sendDocument(buffer) attaches document field with deterministic file_id', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    let docFileId: string | undefined

    tg.onMessage((u) => {
      const doc = u.raw.document as { file_id: string } | undefined

      docFileId = doc?.file_id
    })

    const alice = env.createUser()
    const buf = Buffer.from('doc content')

    await alice.sendDocument({ source: 'buffer', value: buf })

    expect(docFileId).toBeTruthy()
  })

  it('bot tg.api.sendPhoto with MediaInput buffer registers a stable file_id', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser()
    const buf = Buffer.from('content xyz')

    const sent = await tg.api.sendPhoto({
      chat_id: alice.pmChat.id,
      photo: { type: 'buffer' as const, value: buf } as never
    }) as { photo: { file_id: string }[] }

    expect(sent.photo[0]?.file_id).toBeTruthy()

    const sent2 = await tg.api.sendPhoto({
      chat_id: alice.pmChat.id,
      photo: { type: 'buffer' as const, value: buf } as never
    }) as { photo: { file_id: string }[] }

    expect(sent2.photo[0]?.file_id).toBe(sent.photo[0]?.file_id)
  })

  it('user.sendLocation produces a location update', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const seen: { lat: number, lon: number }[] = []

    tg.onMessage((u) => {
      const loc = u.raw.location as { latitude: number, longitude: number } | undefined

      if (loc !== undefined) {
        seen.push({ lat: loc.latitude, lon: loc.longitude })
      }
    })

    const alice = env.createUser()

    await alice.sendLocation({ latitude: 40.7, longitude: -74 })

    expect(seen).toEqual([{ lat: 40.7, lon: -74 }])
  })
})
