import { describe, expect, it } from 'vitest'

import { parseFileId } from '../../src/file-id/parse'
import { FIXTURES } from '../fixtures/file-ids'

describe('parseFileId', () => {
  it('parses a v2 sticker (document family)', () => {
    const file = parseFileId(FIXTURES.STICKER_V2)

    expect(file.kind).toBe('document')
    expect(file.version).toBe(2)
    expect(file.subVersion).toBe(0)
    expect(file.fileType).toBe(8)
    expect(file.dcId).toBe(4)

    if (file.kind !== 'document') {
      throw new Error('expected document')
    }

    expect(file.id).toBe(984697977903775939n)
    expect(file.accessHash).toBe(-8653026958495010306n)
    expect(file.fileReference).toBeUndefined()
  })

  it('parses a v4.22 sticker', () => {
    const file = parseFileId(FIXTURES.STICKER_V4_22)

    expect(file.kind).toBe('document')
    expect(file.version).toBe(4)
    expect(file.subVersion).toBe(22)
  })

  it('parses a v4.27 sticker with file_reference', () => {
    const file = parseFileId(FIXTURES.STICKER_V4_27)

    expect(file.kind).toBe('document')
    expect(file.version).toBe(4)
    expect(file.subVersion).toBe(27)
    expect(file.fileReference).toBeDefined()
    expect(file.fileReference!.byteLength).toBeGreaterThan(0)
  })

  it('parses a v2 photo with legacy source', () => {
    const file = parseFileId(FIXTURES.PHOTO_V2)

    expect(file.kind).toBe('photo')

    if (file.kind !== 'photo') {
      throw new Error('expected photo')
    }

    expect(file.id).toBe(5262785666339678789n)
    expect(file.accessHash).toBe(6602691427396197215n)
    expect(file.photoSize.type).toBe('legacy')
    expect(file.photoSize.volumeId).toBe(257017715n)

    if (file.photoSize.type !== 'legacy') {
      throw new Error('expected legacy')
    }

    expect(file.photoSize.secret).toBe(8510641140621971213n)
    expect(file.photoSize.localId).toBe(110700)
  })

  it('parses a v4.22 photo with thumbnail source', () => {
    const file = parseFileId(FIXTURES.PHOTO_V4_22)

    expect(file.kind).toBe('photo')

    if (file.kind !== 'photo') {
      throw new Error('expected photo')
    }

    expect(file.photoSize.type).toBe('thumbnail')

    if (file.photoSize.type !== 'thumbnail') {
      throw new Error('expected thumbnail')
    }

    expect(file.photoSize.fileType).toBe(2)
    expect(file.photoSize.thumbnailType).toBe('x')
    expect(file.photoSize.localId).toBe(110699)
  })

  it('parses a v4.32 photo with thumbnail source (no outer volume_id, no outer local_id)', () => {
    // synthesize a modern (RemovePhotoVolumeAndLocalId) photo file_id with thumbnail_type='m' —
    // this is the layout Telegram Desktop uses for newly-uploaded photos. previously the parser
    // misaligned and read 'm' (0x6D = 109) as sourceType, throwing "unknown photo size source type 109"
    const fileId = 'AgADBAADewAHyAEABgEAAwIAA20AAyAE'
    const file = parseFileId(fileId)

    expect(file.kind).toBe('photo')

    if (file.kind !== 'photo') {
      throw new Error('expected photo')
    }

    expect(file.dcId).toBe(4)
    expect(file.version).toBe(4)
    expect(file.subVersion).toBe(32)
    expect(file.photoSize.type).toBe('thumbnail')

    if (file.photoSize.type !== 'thumbnail') {
      throw new Error('expected thumbnail')
    }

    expect(file.photoSize.fileType).toBe(2)
    expect(file.photoSize.thumbnailType).toBe('m')
    // modern layout has no outer volume_id / local_id
    expect(file.photoSize.volumeId).toBeUndefined()
    expect(file.photoSize.localId).toBeUndefined()
  })

  it('parses a v4.30 photo with file_reference and thumbnail source', () => {
    const file = parseFileId(FIXTURES.PHOTO_V4_30)

    expect(file.kind).toBe('photo')

    if (file.kind !== 'photo') {
      throw new Error('expected photo')
    }

    expect(file.version).toBe(4)
    expect(file.subVersion).toBe(30)
    expect(file.id).toBe(5276068161940205621n)
    expect(file.accessHash).toBe(-4806637671890540673n)
    expect(file.fileReference).toBeDefined()
    expect(file.photoSize.type).toBe('thumbnail')

    if (file.photoSize.type !== 'thumbnail') {
      throw new Error('expected thumbnail')
    }

    expect(file.photoSize.localId).toBe(265446)
    expect(file.photoSize.thumbnailType).toBe('x')
  })
})
