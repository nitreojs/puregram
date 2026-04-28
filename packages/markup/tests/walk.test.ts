import { describe, it, expect } from 'vitest'

import { Formatted } from '../src/formatted'
import { unwrapFormatted, type FormattableFields } from '../src/walk'

const FIELDS: FormattableFields = {
  sendMessage: [{ path: ['text'], textKey: 'text', entitiesKey: 'entities' }],
  sendMediaGroup: [{ path: ['media', '*', 'caption'], textKey: 'caption', entitiesKey: 'caption_entities' }]
}

describe('unwrapFormatted', () => {
  it('replaces Formatted text with plain string and writes entities', () => {
    const params: Record<string, unknown> = {
      chat_id: 1,
      text: new Formatted('hi', [{ type: 'bold', offset: 0, length: 2 }])
    }

    unwrapFormatted('sendMessage', params, FIELDS)

    expect(params.text).toBe('hi')
    expect(params.entities).toEqual([{ type: 'bold', offset: 0, length: 2 }])
  })

  it('leaves plain-string params untouched', () => {
    const params: Record<string, unknown> = { chat_id: 1, text: 'plain' }

    unwrapFormatted('sendMessage', params, FIELDS)

    expect(params.text).toBe('plain')
    expect(params.entities).toBeUndefined()
  })

  it('walks array paths with `*`', () => {
    const params: Record<string, unknown> = {
      chat_id: 1,
      media: [
        { type: 'photo', media: 'file_id_1', caption: new Formatted('cap1', [{ type: 'bold', offset: 0, length: 4 }]) },
        { type: 'photo', media: 'file_id_2', caption: 'plain cap' }
      ]
    }

    unwrapFormatted('sendMediaGroup', params, FIELDS)

    const media = params.media as Record<string, unknown>[]

    expect(media[0].caption).toBe('cap1')
    expect(media[0].caption_entities).toEqual([{ type: 'bold', offset: 0, length: 4 }])
    expect(media[1].caption).toBe('plain cap')
  })

  it('does nothing when method has no descriptor', () => {
    const params: Record<string, unknown> = { whatever: 1 }

    unwrapFormatted('getMe', params, FIELDS)

    expect(params).toEqual({ whatever: 1 })
  })

  it('coerces raw {text, entities} objects via Formatted.from', () => {
    const params: Record<string, unknown> = {
      text: { text: 'x', entities: [{ type: 'italic', offset: 0, length: 1 }] }
    }

    unwrapFormatted('sendMessage', params, FIELDS)

    expect(params.text).toBe('x')
    expect(params.entities).toEqual([{ type: 'italic', offset: 0, length: 1 }])
  })
})
