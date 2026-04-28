import { describe, expect, it } from 'vitest'

import { FileId } from '../../src/file-id'
import { FileUniqueId, parseFileUniqueId, serializeFileUniqueId } from '../../src/file-unique-id'
import { STICKER_NEW, STICKER_OLD } from '../fixtures/file-ids'

describe('FileUniqueId class', () => {
  it('FileUniqueId.from(str) round-trips identically to parse/serialize', () => {
    const expected = 'AgADegAD997LEQ'
    const wrapped = FileUniqueId.from(expected)

    expect(wrapped.raw).toEqual(parseFileUniqueId(expected))
    expect(wrapped.toString()).toBe(expected)
    expect(serializeFileUniqueId(wrapped.raw)).toBe(expected)
  })

  it('FileId.from(STICKER_OLD).toUniqueId().toString() matches STICKER_NEW.toUniqueId().toString()', () => {
    const fromOld = FileId.from(STICKER_OLD.fileId).toUniqueId().toString()
    const fromNew = FileId.from(STICKER_NEW.fileId).toUniqueId().toString()

    expect(fromOld).toBe(fromNew)
  })

  it('exposes discriminant-aware getters that pass through to raw', () => {
    const fid = FileId.from(STICKER_OLD.fileId)
    const uid = fid.toUniqueId()

    expect(uid.kind).toBe(uid.raw.kind)
    expect(typeof uid.toString()).toBe('string')
  })
})
