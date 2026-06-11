import { describe, expect, it } from 'vitest'

import { Rich } from '../src/rich'

describe('Rich', () => {
  it('unwraps to an InputRichMessage keyed by dialect', () => {
    expect(new Rich('markdown', '# hi').toInputRichMessage()).toEqual({ markdown: '# hi' })
    expect(new Rich('html', '<h1>hi</h1>').toInputRichMessage()).toEqual({ html: '<h1>hi</h1>' })
  })

  it('includes is_rtl / skip_entity_detection only when set', () => {
    const r = new Rich('markdown', 'x').rtl().noEntityDetection()

    expect(r.toInputRichMessage()).toEqual({ markdown: 'x', is_rtl: true, skip_entity_detection: true })
  })

  it('rtl(false) writes the explicit false', () => {
    expect(new Rich('markdown', 'x').rtl(false).toInputRichMessage()).toEqual({ markdown: 'x', is_rtl: false })
  })

  it('toJSON mirrors toInputRichMessage', () => {
    const r = new Rich('html', 'x')

    expect(r.toJSON()).toEqual(r.toInputRichMessage())
  })
})
