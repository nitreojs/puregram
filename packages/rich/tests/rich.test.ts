import { describe, expect, it } from 'vitest'

import { rich } from '../src/namespace'
import { Rich } from '../src/rich'

describe('rich()', () => {
  it('composes content into a blocks envelope', () => {
    const r = rich(['hi ', rich.bold('there')])

    expect(r).toBeInstanceOf(Rich)
    expect(r.dialect).toBe('blocks')
    expect(r.blocks).toEqual([{ type: 'paragraph', text: ['hi ', { type: 'bold', text: 'there' }] }])
  })

  it('raw envelopes expose no blocks', () => {
    expect(rich.raw.md('# x').blocks).toBeUndefined()
  })
})

describe('toInputRichMessage', () => {
  it('keys native envelopes by blocks', () => {
    expect(rich('hi').toInputRichMessage()).toEqual({ blocks: [{ type: 'paragraph', text: 'hi' }] })
  })

  it('keys raw envelopes by dialect', () => {
    expect(rich.raw.md('# x').toInputRichMessage()).toEqual({ markdown: '# x' })
    expect(rich.raw.markdown('# x').toInputRichMessage()).toEqual({ markdown: '# x' })
    expect(rich.raw.html('<b>x</b>').toInputRichMessage()).toEqual({ html: '<b>x</b>' })
  })

  it('includes media only when non-empty', () => {
    expect(rich.raw.md('x', { media: [] }).toInputRichMessage()).toEqual({ markdown: 'x' })

    const entries = [{ id: 'p1', media: { type: 'photo' as const, media: 'https://x/p.jpg' } }]

    expect(rich.raw.md('![p](tg://photo?id=p1)', { media: entries }).toInputRichMessage()).toEqual({
      markdown: '![p](tg://photo?id=p1)',
      media: entries
    })
  })

  it('chains rtl and noEntityDetection', () => {
    const r = rich.raw.md('x').rtl().noEntityDetection()

    expect(r.toInputRichMessage()).toEqual({ markdown: 'x', is_rtl: true, skip_entity_detection: true })
  })

  it('rtl(false) writes the explicit false', () => {
    expect(rich('x').rtl(false).toInputRichMessage()).toEqual({
      blocks: [{ type: 'paragraph', text: 'x' }],
      is_rtl: false
    })
  })

  it('toJSON mirrors toInputRichMessage', () => {
    const r = rich('x').rtl()

    expect(r.toJSON()).toEqual(r.toInputRichMessage())
  })
})
