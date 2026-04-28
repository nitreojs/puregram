import { MediaSourceType } from 'puregram'
import { describe, expect, it } from 'vitest'

import { ALLOWED_MEDIA_TYPES, MEDIA_METHOD_TO_KEY_MAP } from '../src/method-map'

describe('MEDIA_METHOD_TO_KEY_MAP', () => {
  it('covers all seven cacheable upload methods', () => {
    expect(MEDIA_METHOD_TO_KEY_MAP).toEqual({
      sendPhoto: 'photo',
      sendVideo: 'video',
      sendAnimation: 'animation',
      sendVideoNote: 'video_note',
      sendAudio: 'audio',
      sendDocument: 'document',
      sendSticker: 'sticker'
    })
  })
})

describe('ALLOWED_MEDIA_TYPES', () => {
  it('only Path and Url are cacheable', () => {
    expect([...ALLOWED_MEDIA_TYPES]).toEqual([MediaSourceType.Path, MediaSourceType.Url])
  })
})
