import { describe, it, expect } from 'vitest'

import { needsMultipart } from '../../src/http/multipart'
import { MediaSource } from '../../src/media-source'

describe('needsMultipart', () => {
  it('detects "media" key', () => {
    expect(needsMultipart({ media: [] })).toBe(true)
  })

  it('detects upload-eligible keys', () => {
    expect(needsMultipart({ photo: MediaSource.path('/tmp/x.png') })).toBe(true)
    expect(needsMultipart({ thumb: MediaSource.fileId('abc') })).toBe(true)
  })

  it('returns false for plain payloads', () => {
    expect(needsMultipart({ chat_id: 1, text: 'hi' })).toBe(false)
  })
})
