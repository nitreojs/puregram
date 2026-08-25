import { describe, expect, it } from 'vitest'

import { RichParseError } from '../src/error'
import { rich } from '../src/namespace'
import { parseHtml } from '../src/parsers/html'

describe('tg:// media links', () => {
  it('carries a document media entry through the raw markdown path', () => {
    const message = rich.raw.md('![](tg://document?id=doc1)', {
      media: [{ id: 'doc1', media: { type: 'document', media: 'BQACAgIAAx...' } }]
    })

    expect(message.toInputRichMessage()).toEqual({
      markdown: '![](tg://document?id=doc1)',
      media: [{ id: 'doc1', media: { type: 'document', media: 'BQACAgIAAx...' } }]
    })
  })

  it('carries a document media entry through the raw html path', () => {
    const message = rich.raw.html('<tg-document src="tg://document?id=doc1"></tg-document>', {
      media: [{ id: 'doc1', media: { type: 'document', media: 'file-id' } }]
    })

    expect(message.toInputRichMessage()).toMatchObject({
      html: '<tg-document src="tg://document?id=doc1"></tg-document>',
      media: [{ id: 'doc1' }]
    })
  })

  it('rejects a tg:// media link on the parsed block path, naming the raw route', () => {
    expect(() => parseHtml('<tg-document src="tg://document?id=doc1"></tg-document>'))
      .toThrow(/only work in raw dialect with media entries/)
    expect(() => parseHtml('<img src="tg://photo?id=p1"/>')).toThrow(RichParseError)
  })

  it('still treats tg://emoji as an inline entity, not a media link', () => {
    expect(parseHtml('<p><img src="tg://emoji?id=5368324170671202286" alt="👍"/></p>')).toEqual([
      {
        type: 'paragraph',
        text: { type: 'custom_emoji', custom_emoji_id: '5368324170671202286', alternative_text: '👍' }
      }
    ])
  })
})
