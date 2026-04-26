import { describe, it, expect } from 'vitest'
import { Writable } from 'node:stream'
import { MediaSource, MediaSourceTo, MediaSourceType } from '../src/media-source'

describe('MediaSource', () => {
  it('path returns tagged source', () => {
    const r = MediaSource.path('/tmp/foo.png')
    expect(r.type).toBe(MediaSourceType.Path)
    expect(r.value).toBe('/tmp/foo.png')
  })

  it('url accepts forceUpload option', () => {
    const r = MediaSource.url('https://example.com/x.gif', { forceUpload: true })
    expect(r.type).toBe(MediaSourceType.Url)
    expect(r.forceUpload).toBe(true)
  })

  it('buffer rejects non-Buffer', () => {
    expect(() => MediaSource.buffer('not a buffer' as unknown as Buffer)).toThrow(TypeError)
  })

  it('base64 produces a buffer source', () => {
    const r = MediaSource.base64(Buffer.from('hi').toString('base64'))
    expect(r.type).toBe(MediaSourceType.Buffer)
    expect(r.value.toString()).toBe('hi')
  })
})

describe('MediaSourceTo', () => {
  it('buffer to-source has no value field', () => {
    const r = MediaSourceTo.buffer()
    expect(r.type).toBe(MediaSourceType.Buffer)
  })

  it('stream to-source carries the writable', () => {
    const noop = new Writable({ write (_chunk, _enc, cb) { cb() } })
    const r = MediaSourceTo.stream(noop)
    expect(r.type).toBe(MediaSourceType.Stream)
    expect(r.value).toBe(noop)
  })
})
