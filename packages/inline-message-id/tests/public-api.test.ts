import { describe, expect, it } from 'vitest'

import * as api from '../src'

describe('public api surface', () => {
  it('exports every documented function and class', () => {
    const required = [
      'parseInlineMessageId',
      'serializeInlineMessageId',
      'InlineMessageId',
      'InlineMessageIdParseError',
      'isLegacyInlineMessageId',
      'isModernInlineMessageId'
    ] as const

    for (const name of required) {
      expect(api).toHaveProperty(name)
    }
  })
})
