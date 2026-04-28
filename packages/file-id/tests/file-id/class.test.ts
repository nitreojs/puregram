import { describe, expect, it } from 'vitest'

import { FileId, parseFileId, serializeFileId } from '../../src/file-id'
import { FileUniqueId } from '../../src/file-unique-id'
import { PHOTO_V4_30, STICKER_V4_22 } from '../fixtures/file-ids'

describe('FileId class', () => {
  it('FileId.from(str) round-trips identically to parseFileId/serializeFileId', () => {
    const wrapped = FileId.from(STICKER_V4_22.fileId)
    const parsed = parseFileId(STICKER_V4_22.fileId)

    expect(wrapped.raw).toEqual(parsed)
    expect(wrapped.toString()).toBe(STICKER_V4_22.fileId)
    expect(serializeFileId(wrapped.raw)).toBe(STICKER_V4_22.fileId)
  })

  it('new FileId(parsed) wraps an existing POJO', () => {
    const parsed = parseFileId(PHOTO_V4_30.fileId)
    const wrapped = new FileId(parsed)

    expect(wrapped.raw).toBe(parsed)
    expect(wrapped.toString()).toBe(PHOTO_V4_30.fileId)
  })

  it('exposes discriminant-aware getters that pass through to raw', () => {
    const fid = FileId.from(PHOTO_V4_30.fileId)

    expect(fid.kind).toBe(fid.raw.kind)
    expect(fid.fileType).toBe(fid.raw.fileType)
    expect(fid.version).toBe(4)
    expect(fid.subVersion).toBe(30)
    expect(fid.dcId).toBe(fid.raw.dcId)
    expect(fid.hasReference).toBe(true)
    expect(fid.hasWebLocation).toBe(false)
    expect(fid.source).toBe(PHOTO_V4_30.fileId)
  })

  it('toUniqueId() returns a FileUniqueId class instance', () => {
    const fid = FileId.from(STICKER_V4_22.fileId)
    const unique = fid.toUniqueId()

    expect(unique).toBeInstanceOf(FileUniqueId)
    expect(typeof unique.toString()).toBe('string')
    expect(unique.toString()).toBe(unique.toString())
  })

  it('inspect output prints class name + raw object', () => {
    const fid = FileId.from(STICKER_V4_22.fileId)
    const inspectFn = (fid as unknown as Record<symbol, (...a: unknown[]) => string>)[Symbol.for('nodejs.util.inspect.custom')]
    const out = inspectFn.call(fid, 0, { stylize: (s: string) => s }, () => '...')

    expect(out).toContain('FileId')
  })
})
