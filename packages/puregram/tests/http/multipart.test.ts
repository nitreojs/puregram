import { describe, it, expect } from 'vitest'

import { needsMultipart, resolveMediaInput } from '../../src/http/multipart'
import { MediaSource } from '../../src/media-source'

describe('needsMultipart', () => {
  it('detects "media" key', () => {
    expect(needsMultipart({ media: [] })).toBe(true)
  })

  it('detects upload-eligible keys', () => {
    expect(needsMultipart({ photo: MediaSource.path('/tmp/x.png') })).toBe(true)
    expect(needsMultipart({ thumb: MediaSource.fileId('abc') })).toBe(true)
  })

  it('detects a local source on a media key', () => {
    expect(needsMultipart({ video: MediaSource.local('/srv/x.mp4') })).toBe(true)
  })

  it('returns false for plain payloads', () => {
    expect(needsMultipart({ chat_id: 1, text: 'hi' })).toBe(false)
  })
})

describe('resolveMediaInput — local', () => {
  it('resolves to a file:// uri when useLocal is on', async () => {
    const resolved = await resolveMediaInput(MediaSource.local('/srv/media/clip.mp4'), true)

    expect(resolved).toBe('file:///srv/media/clip.mp4')
  })

  it('throws when local mode is off', async () => {
    await expect(resolveMediaInput(MediaSource.local('/srv/x.mp4'))).rejects.toThrow(TypeError)
  })
})
