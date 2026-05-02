import { describe, it, expect } from 'vitest'

import { InlineQueryResult, InputMedia, InputMessageContent, MediaSource } from '../src'

describe('InputMedia', () => {
  it('inherits generated photo factory', () => {
    const r = InputMedia.photo({ media: 'attach://x' })

    expect(r).toEqual({ type: 'photo', media: 'attach://x' })
  })

  it('adds sticker synthetic variant', () => {
    const m = MediaSource.fileId('cat')
    const r = InputMedia.sticker({ media: m })

    expect(r.type).toBe('sticker')
    expect(r.media).toBe(m)
  })

  it('adds videoNote and voice synthetic variants', () => {
    expect(InputMedia.videoNote({ media: 'attach://vn' }).type).toBe('video_note')
    expect(InputMedia.voice({ media: 'attach://v' }).type).toBe('voice')
  })
})

describe('InlineQueryResult', () => {
  it('inherits generated article factory', () => {
    const r = InlineQueryResult.article({
      id: '1',
      title: 't',
      input_message_content: InputMessageContent.text('hi')
    })

    expect(r.type).toBe('article')
    expect(r.input_message_content).toEqual({ message_text: 'hi' })
  })

  it('exposes cached factories under .cached', () => {
    const r = InlineQueryResult.cached.audio({ id: '1', audio_file_id: 'fid' })

    expect(r).toEqual({ type: 'audio', id: '1', audio_file_id: 'fid' })
  })

  it('builds a results button', () => {
    const r = InlineQueryResult.button('open', { start_parameter: 'go' })

    expect(r).toEqual({ text: 'open', start_parameter: 'go' })
  })
})

describe('InputMessageContent', () => {
  it('text wraps message_text', () => {
    expect(InputMessageContent.text('hi', { parse_mode: 'HTML' }))
      .toEqual({ message_text: 'hi', parse_mode: 'HTML' })
  })

  it('location wraps lat/lng', () => {
    expect(InputMessageContent.location(55, 37, { horizontal_accuracy: 5 }))
      .toEqual({ latitude: 55, longitude: 37, horizontal_accuracy: 5 })
  })
})
