// packages/rich/tests/index.test.ts
import { describe, expect, it } from 'vitest'

import { rich, Rich, RichError } from '../src/index'

describe('rich namespace', () => {
  it('exposes the three template tags', () => {
    expect(rich.md`# hi`.dialect).toBe('markdown')
    expect(rich.markdown`# hi`.dialect).toBe('markdown')
    expect(rich.html`<h1>hi</h1>`.dialect).toBe('html')
  })

  it('exposes builders that compose inside templates', () => {
    const r = rich.md`
      # ${'report'}

      what's up ${rich.bold('guys')} ${rich.math('E=mc^2')}

      ${rich.list(['one', 'two'])}
    `

    expect(r.content).toBe("# report\n\nwhat's up **guys** $E=mc^2$\n\n- one\n- two")
    expect(r.toInputRichMessage()).toEqual({
      markdown: "# report\n\nwhat's up **guys** $E=mc^2$\n\n- one\n- two"
    })
  })

  it('re-exports Rich and RichError', () => {
    expect(rich.md`x`).toBeInstanceOf(Rich)
    expect(() => rich.md`${rich.html`y`}`).toThrow(RichError)
  })
})
