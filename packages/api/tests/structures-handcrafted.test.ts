import { describe, expect, it } from 'vitest'

import { Photo, PhotoSize, VideoQualities, VideoQuality } from '../src/index'

const PHOTO_SIZES = [
  { file_id: 's', file_unique_id: 'su', width: 90, height: 90, file_size: 1000 },
  { file_id: 'm', file_unique_id: 'mu', width: 320, height: 320, file_size: 10000 },
  { file_id: 'x', file_unique_id: 'xu', width: 800, height: 800, file_size: 100000 }
]

const VIDEO_QUALITIES = [
  { file_id: 'h', file_unique_id: 'hu', width: 480, height: 360, codec: 'h264', file_size: 5000 },
  { file_id: 'a', file_unique_id: 'au', width: 1080, height: 720, codec: 'av01', file_size: 50000 }
]

describe('Photo', () => {
  it('biggest picks the largest by file_size', () => {
    const photo = new Photo(PHOTO_SIZES)

    expect(photo.biggest).toBeInstanceOf(PhotoSize)
    expect(photo.biggest.fileId).toBe('x')
  })

  it('smallest picks the smallest by file_size', () => {
    const photo = new Photo(PHOTO_SIZES)

    expect(photo.smallest.fileId).toBe('s')
  })

  it('byMin returns the smallest size with width ≥ minWidth', () => {
    const photo = new Photo(PHOTO_SIZES)

    expect(photo.byMin(200).fileId).toBe('m')
    expect(photo.byMin(500).fileId).toBe('x')
  })

  it('byMin falls back to biggest when no size qualifies', () => {
    const photo = new Photo(PHOTO_SIZES)

    expect(photo.byMin(99999).fileId).toBe('x')
  })

  it('length matches the raw array length', () => {
    expect(new Photo(PHOTO_SIZES).length).toBe(3)
  })

  it('iterating yields wrapped PhotoSize in payload order', () => {
    const photo = new Photo(PHOTO_SIZES)
    const widths = [...photo].map(s => s.width)

    expect(widths).toEqual([90, 320, 800])
  })

  it('memoizes wrapped sizes between accesses', () => {
    const photo = new Photo(PHOTO_SIZES)

    expect(photo.sizes).toBe(photo.sizes)
  })

  it('falls back to width × height when file_size is missing', () => {
    const photo = new Photo([
      { file_id: 's', file_unique_id: 'su', width: 90, height: 90 },
      { file_id: 'l', file_unique_id: 'lu', width: 800, height: 800 }
    ])

    expect(photo.biggest.fileId).toBe('l')
    expect(photo.smallest.fileId).toBe('s')
  })

  it('fromPayload returns a new Photo wrapping the array', () => {
    const photo = Photo.fromPayload(PHOTO_SIZES)

    expect(photo).toBeInstanceOf(Photo)
    expect(photo.raw).toBe(PHOTO_SIZES)
  })
})

describe('VideoQualities', () => {
  it('biggest picks the highest-resolution quality', () => {
    const qualities = new VideoQualities(VIDEO_QUALITIES)

    expect(qualities.biggest).toBeInstanceOf(VideoQuality)
    expect(qualities.biggest.codec).toBe('av01')
  })

  it('smallest picks the lowest-resolution quality', () => {
    expect(new VideoQualities(VIDEO_QUALITIES).smallest.codec).toBe('h264')
  })

  it('byCodec finds a quality by codec name', () => {
    const qualities = new VideoQualities(VIDEO_QUALITIES)

    expect(qualities.byCodec('h264')?.width).toBe(480)
    expect(qualities.byCodec('vp9')).toBeUndefined()
  })

  it('byMin returns the smallest qualifying quality, biggest as fallback', () => {
    const qualities = new VideoQualities(VIDEO_QUALITIES)

    expect(qualities.byMin(720).codec).toBe('av01')
    expect(qualities.byMin(99999).codec).toBe('av01')
  })

  it('iterates wrapped VideoQuality in payload order', () => {
    const qualities = new VideoQualities(VIDEO_QUALITIES)
    const codecs = [...qualities].map(q => q.codec)

    expect(codecs).toEqual(['h264', 'av01'])
  })
})
