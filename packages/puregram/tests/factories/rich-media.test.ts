import { describe, expect, it } from 'vitest'

import { MediaSource, RichMedia } from '../../src'

describe('RichMedia', () => {
  it('builds a media[] entry without a hand-written discriminator', () => {
    expect(RichMedia.document('d1', 'https://x/f.zip')).toEqual({
      id: 'd1',
      media: { type: 'document', media: 'https://x/f.zip' }
    })
  })

  it('covers every kind the InputRichMessageMedia union allows', () => {
    const src = 'https://x/f'

    expect(RichMedia.photo('a', src).media).toMatchObject({ type: 'photo' })
    expect(RichMedia.video('a', src).media).toMatchObject({ type: 'video' })
    expect(RichMedia.audio('a', src).media).toMatchObject({ type: 'audio' })
    expect(RichMedia.animation('a', src).media).toMatchObject({ type: 'animation' })
    expect(RichMedia.document('a', src).media).toMatchObject({ type: 'document' })
    expect(RichMedia.voiceNote('a', src).media).toMatchObject({ type: 'voice_note' })
  })

  it('passes a MediaSource envelope through for the client to resolve', () => {
    const upload = MediaSource.text('hi\n', { filename: 'note.txt' })

    expect(RichMedia.document('d1', upload).media).toEqual({ type: 'document', media: upload })
  })

  it('uncamelizes the extras', () => {
    expect(RichMedia.document('d1', 'https://x/f.zip', { disableContentTypeDetection: true }).media)
      .toMatchObject({ disable_content_type_detection: true })
  })

  it('builds the four documented link forms', () => {
    expect(RichMedia.link('photo', 'p')).toBe('tg://photo?id=p')
    expect(RichMedia.link('video', 'v')).toBe('tg://video?id=v')
    expect(RichMedia.link('document', 'd')).toBe('tg://document?id=d')
    expect(RichMedia.link('audio', 'a')).toBe('tg://audio?id=a')
  })
})
