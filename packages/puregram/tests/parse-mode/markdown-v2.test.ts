import { describe, it, expect } from 'vitest'

import { MarkdownV2 } from '../../src/parse-mode'

describe('MarkdownV2', () => {
  it('escapes reserved chars', () => {
    const escaped = MarkdownV2.escape('hello.world!')

    expect(escaped).toContain('\\.')
    expect(escaped).toContain('\\!')
  })
  it('bold wraps in *', () => {
    expect(MarkdownV2.bold('hi')).toBe('*hi*')
  })
})
