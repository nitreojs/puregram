import type { TelegramLike, TelegramMessage } from '@puregram/api'
import { MessageUpdate } from '@puregram/api'
import { describe, expect, it, vi } from 'vitest'

function makeTg () {
  return {
    api: {} as TelegramLike['api'],
    download: vi.fn().mockResolvedValue(Buffer.from('bytes')),
    downloadStream: vi.fn().mockResolvedValue('stream'),
    downloadIterable: vi.fn().mockResolvedValue('iter'),
    downloadToFile: vi.fn().mockResolvedValue(undefined),
    getFileURL: vi.fn().mockResolvedValue('url')
  }
}

function messageWith (raw: Partial<TelegramMessage>) {
  return {
    message_id: 1,
    date: 0,
    chat: { id: 1, type: 'private' },
    ...raw
  } as TelegramMessage
}

describe('MessageUpdate.download (codegen shortcut)', () => {
  it('routes to tg.download with the picked attachment', async () => {
    const tg = makeTg()
    const doc = { file_id: 'd1', file_unique_id: 'u1' }
    const update = new MessageUpdate(messageWith({ document: doc }), tg as never)

    await update.download()

    expect(tg.download).toHaveBeenCalledWith(doc)
  })

  it('returns null when the message has no attachment', async () => {
    const tg = makeTg()
    const update = new MessageUpdate(messageWith({ text: 'plain' }), tg as never)

    expect(await update.download()).toBeNull()
    expect(tg.download).not.toHaveBeenCalled()
  })

  it('prefers document over video, audio, photo, sticker (priority order)', async () => {
    const tg = makeTg()
    const document = { file_id: 'd', file_unique_id: 'd' }
    const update = new MessageUpdate(messageWith({
      document,
      video: { file_id: 'v', file_unique_id: 'v', width: 1, height: 1, duration: 1 },
      photo: [{ file_id: 'p', file_unique_id: 'p', width: 1, height: 1 }],
      sticker: { file_id: 's', file_unique_id: 's' } as never
    }), tg as never)

    await update.download()

    expect(tg.download).toHaveBeenCalledWith(document)
  })

  it('picks photo array when only photo is present (resolver picks largest)', async () => {
    const tg = makeTg()
    const photo = [
      { file_id: 'small', file_unique_id: 's', width: 90, height: 90, file_size: 1000 },
      { file_id: 'big', file_unique_id: 'b', width: 800, height: 800, file_size: 50_000 }
    ]
    const update = new MessageUpdate(messageWith({ photo }), tg as never)

    await update.download()

    expect(tg.download).toHaveBeenCalledWith(photo)
  })

  it('forwards path through downloadToFile', async () => {
    const tg = makeTg()
    const doc = { file_id: 'd', file_unique_id: 'd' }
    const update = new MessageUpdate(messageWith({ document: doc }), tg as never)

    await update.downloadToFile('/tmp/out.bin')

    expect(tg.downloadToFile).toHaveBeenCalledWith('/tmp/out.bin', doc)
  })

  it('downloadToFile returns null when the message has no attachment', async () => {
    const tg = makeTg()
    const update = new MessageUpdate(messageWith({ text: 'plain' }), tg as never)

    expect(await update.downloadToFile('/tmp/out.bin')).toBeNull()
    expect(tg.downloadToFile).not.toHaveBeenCalled()
  })
})
