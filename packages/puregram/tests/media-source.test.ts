import { describe, it, expect } from 'vitest'

import { MediaSource, MediaSourceType } from '../src/media-source'

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

  it('text encodes utf-8 and forwards filename', () => {
    const r = MediaSource.text('héllo', { filename: 'note.txt' })

    expect(r.type).toBe(MediaSourceType.Buffer)
    expect(r.value.toString('utf8')).toBe('héllo')
    expect(r.filename).toBe('note.txt')
  })

  it('text rejects non-string', () => {
    expect(() => MediaSource.text(123 as unknown as string)).toThrow(TypeError)
  })

  it('json serializes and respects space option', () => {
    const r = MediaSource.json({ a: 1 }, { filename: 'x.json', space: 2 })

    expect(r.type).toBe(MediaSourceType.Buffer)
    expect(r.value.toString('utf8')).toBe('{\n  "a": 1\n}')
    expect(r.filename).toBe('x.json')
  })

  it('bytes wraps Uint8Array preserving content', () => {
    const u8 = new Uint8Array([0x68, 0x69])
    const r = MediaSource.bytes(u8, { filename: 'raw.bin' })

    expect(r.type).toBe(MediaSourceType.Buffer)
    expect(r.value.toString('utf8')).toBe('hi')
    expect(r.filename).toBe('raw.bin')
  })

  it('bytes rejects a plain object', () => {
    expect(() => MediaSource.bytes({} as unknown as Uint8Array)).toThrow(TypeError)
  })
})
