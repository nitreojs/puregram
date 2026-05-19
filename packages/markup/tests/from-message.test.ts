import { describe, it, expect } from 'vitest'

import { Formatted } from '../src/formatted'

describe('Formatted.fromMessage', () => {
  it('picks text + entities when both are present', () => {
    const f = Formatted.fromMessage({
      text: 'hello world',
      entities: [{ type: 'bold', offset: 0, length: 5 }]
    })

    expect(f.text).toBe('hello world')
    expect(f.entities).toEqual([{ type: 'bold', offset: 0, length: 5 }])
  })

  it('falls back to caption + caption_entities when text is missing', () => {
    const f = Formatted.fromMessage({
      caption: 'a photo',
      caption_entities: [{ type: 'italic', offset: 2, length: 5 }]
    })

    expect(f.text).toBe('a photo')
    expect(f.entities).toEqual([{ type: 'italic', offset: 2, length: 5 }])
  })

  it('prefers text over caption when both are present', () => {
    const f = Formatted.fromMessage({
      text: 'real text',
      entities: [],
      caption: 'unused',
      caption_entities: [{ type: 'bold', offset: 0, length: 6 }]
    })

    expect(f.text).toBe('real text')
    expect(f.entities).toEqual([])
  })

  it('handles missing entities array', () => {
    const f = Formatted.fromMessage({ text: 'plain' })

    expect(f.text).toBe('plain')
    expect(f.entities).toEqual([])
  })

  it('produces empty Formatted when neither text nor caption exist', () => {
    const f = Formatted.fromMessage({})

    expect(f.text).toBe('')
    expect(f.entities).toEqual([])
  })

  it('round-trips through toPayload() unchanged', () => {
    const source = {
      text: 'hi there',
      entities: [
        { type: 'bold' as const, offset: 0, length: 2 },
        { type: 'italic' as const, offset: 3, length: 5 }
      ]
    }

    const f = Formatted.fromMessage(source)
    const payload = f.toPayload()

    expect(payload).toEqual({ text: source.text, entities: source.entities })
  })

  it('round-trips a text_link entity', () => {
    const source = {
      text: 'go here',
      entities: [{ type: 'text_link' as const, offset: 0, length: 7, url: 'https://example.com' }]
    }

    const f = Formatted.fromMessage(source)

    expect(f.toPayload()).toEqual(source)
  })

  it('round-trips a custom_emoji entity', () => {
    const source = {
      text: 'X',
      entities: [{ type: 'custom_emoji' as const, offset: 0, length: 1, custom_emoji_id: '5448765217123141' }]
    }

    const f = Formatted.fromMessage(source)

    expect(f.toPayload()).toEqual(source)
  })

  it('round-trips a text_mention with user', () => {
    const source = {
      text: 'Alice',
      entities: [{
        type: 'text_mention' as const,
        offset: 0,
        length: 5,
        user: { id: 42, is_bot: false, first_name: 'Alice' }
      }]
    }

    const f = Formatted.fromMessage(source)

    expect(f.toPayload()).toEqual(source)
  })

  it('round-trips a pre entity with language', () => {
    const source = {
      text: 'console.log(1)',
      entities: [{ type: 'pre' as const, offset: 0, length: 14, language: 'js' }]
    }

    const f = Formatted.fromMessage(source)

    expect(f.toPayload()).toEqual(source)
  })

  it('round-trips a date_time entity', () => {
    const source = {
      text: 'soon',
      entities: [{
        type: 'date_time' as const, offset: 0, length: 4, unix_time: 1_700_000_000, date_time_format: 'r'
      }]
    }

    const f = Formatted.fromMessage(source)

    expect(f.toPayload()).toEqual(source)
  })

  it('normalizes camelCase fields from MessageEntity-like instances', () => {
    const source = {
      text: 'X',
      entities: [{
        type: 'custom_emoji' as const,
        offset: 0,
        length: 1,
        customEmojiId: '123'
      }]
    }

    const f = Formatted.fromMessage(source as any)

    expect(f.entities[0]).toMatchObject({ type: 'custom_emoji', custom_emoji_id: '123' })
  })
})
