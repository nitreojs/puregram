import { hasAnimation, hasPhoto, hasSticker, hasVideo } from '@puregram/api'
import { describe, expect, it } from 'vitest'

import { animation, photo, sticker, video } from '../../src/filters/media'

describe('semantic media re-exports', () => {
  it('photo is the same reference as hasPhoto', () => {
    expect(photo).toBe(hasPhoto)
  })

  it('video is the same reference as hasVideo', () => {
    expect(video).toBe(hasVideo)
  })

  it('sticker is the same reference as hasSticker', () => {
    expect(sticker).toBe(hasSticker)
  })

  it('animation is the same reference as hasAnimation', () => {
    expect(animation).toBe(hasAnimation)
  })
})

describe('presence detection on a synthesised update', () => {
  // codegen'd `hasX` filters check `(u as { x? }).x != null` — fixtures expose the
  // camelCase top-level field as the wrapped update class would
  it('photo matches updates with a photo field', () => {
    expect(photo({ kind: 'message', photo: [{ file_id: 'a' }] })).toBe(true)
    expect(photo({ kind: 'message' })).toBe(false)
  })

  it('video matches updates with a video field', () => {
    expect(video({ kind: 'message', video: { file_id: 'v' } })).toBe(true)
  })

  it('sticker matches updates with a sticker field', () => {
    expect(sticker({ kind: 'message', sticker: { file_id: 's' } })).toBe(true)
  })
})
