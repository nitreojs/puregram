import { describe, expect, it } from 'vitest'

import { parseLenient, parseStrict } from '../src/formatted'

describe('formatted — parseLenient', () => {
  it('returns plain text when no parseMode is requested', async () => {
    const out = await parseLenient('hello', undefined)

    expect(out).toEqual({ text: 'hello' })
  })

  it('parses well-formed markdown', async () => {
    const out = await parseLenient('hello **world**', 'MarkdownV2')

    expect(out.text).toBe('hello world')
    expect(out.entities).toHaveLength(1)
    expect(out.entities![0]).toMatchObject({ type: 'bold', offset: 6, length: 5 })
  })

  it('falls back to raw text on malformed markdown', async () => {
    const out = await parseLenient('hello **world', 'MarkdownV2')

    expect(out.text).toBe('hello **world')
    expect(out.entities).toEqual([])
  })

  it('parses well-formed html', async () => {
    const out = await parseLenient('<b>bold</b>', 'HTML')

    expect(out.text).toBe('bold')
    expect(out.entities).toHaveLength(1)
  })

  it('falls back to raw text on malformed html', async () => {
    const out = await parseLenient('<b>bold', 'HTML')

    expect(out.text).toBe('<b>bold')
    expect(out.entities).toEqual([])
  })
})

describe('formatted — parseStrict', () => {
  it('parses well-formed markdown', async () => {
    const out = await parseStrict('**hi**', 'MarkdownV2')

    expect(out.text).toBe('hi')
    expect(out.entities).toHaveLength(1)
  })

  it('throws on malformed markdown', async () => {
    await expect(parseStrict('**unclosed', 'MarkdownV2')).rejects.toBeTruthy()
  })

  it('returns plain text when no parseMode is requested', async () => {
    const out = await parseStrict('hi', undefined)

    expect(out.text).toBe('hi')
    expect(out.entities).toBeUndefined()
  })
})
