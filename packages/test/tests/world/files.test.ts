import { describe, expect, it } from 'vitest'

import { FileStore } from '../../src/world/files'

describe('FileStore', () => {
  it('registers a buffer with a deterministic file_id', () => {
    const store = new FileStore()
    const buf = Buffer.from('hello world')
    const a = store.registerBuffer(buf)

    expect(typeof a.file_id).toBe('string')
    expect(a.file_id.length).toBeGreaterThan(20)
    expect(a.file_unique_id).toBe(a.file_id.slice(0, 16))
  })

  it('same buffer twice yields the same file_id', () => {
    const store = new FileStore()
    const buf = Buffer.from('same content')
    const a = store.registerBuffer(buf)
    const b = store.registerBuffer(buf)

    expect(a.file_id).toBe(b.file_id)
    expect(a.file_unique_id).toBe(b.file_unique_id)
  })

  it('different buffers yield different file_ids', () => {
    const store = new FileStore()
    const a = store.registerBuffer(Buffer.from('one'))
    const b = store.registerBuffer(Buffer.from('two'))

    expect(a.file_id).not.toBe(b.file_id)
  })

  it('registerFileId round-trips', () => {
    const store = new FileStore()
    const r = store.registerFileId('AgACAgIAAxkBAAEFY8tn...')

    expect(r.file_id).toBe('AgACAgIAAxkBAAEFY8tn...')
    expect(r.file_unique_id).toBe('AgACAgIAAxkBAAEF')
  })

  it('registerUrl hashes the URL string', () => {
    const store = new FileStore()
    const a = store.registerUrl('https://example.com/x.png')
    const b = store.registerUrl('https://example.com/x.png')
    const c = store.registerUrl('https://example.com/y.png')

    expect(a.file_id).toBe(b.file_id)
    expect(a.file_id).not.toBe(c.file_id)
  })

  it('file_unique_id is exactly 16 chars (slice prefix)', () => {
    const store = new FileStore()
    const r = store.registerBuffer(Buffer.from('xxx'))

    expect(r.file_unique_id).toHaveLength(16)
  })
})
