import { describe, expect, it } from 'vitest'

import { caption, command, contains, endsWith, regex, start, startsWith, text } from '../../src/filters/content'

// fixtures expose both top-level (camelCase wrapper getter) and `raw` fields,
// matching how update classes look at dispatch time. handcrafted text/caption
// filters read the top-level field; `command()` reads `raw.text`
const messageWithText = (value: string) => ({
  kind: 'message',
  text: value,
  raw: {
    message_id: 1,
    date: 0,
    chat: { id: 100, type: 'private' },
    text: value
  }
})

const messageWithCaption = (value: string) => ({
  kind: 'message',
  caption: value,
  raw: {
    message_id: 1,
    date: 0,
    chat: { id: 100, type: 'private' },
    caption: value
  }
})

describe('text', () => {
  it('string form matches exact equality', () => {
    expect(text('hello')(messageWithText('hello'))).toBe(true)
    expect(text('hello')(messageWithText('world'))).toBe(false)
  })

  it('regex form matches and attaches RegExpMatchArray as match', () => {
    const update = messageWithText('order 42') as Record<string, unknown>
    const f = text(/^order (?<id>\d+)$/)

    expect(f(update)).toBe(true)
    expect((update as { match?: RegExpMatchArray }).match?.groups?.id).toBe('42')
  })

  it('regex form returns false without attaching when input lacks text', () => {
    expect(text(/x/)({ kind: 'message', raw: { message_id: 1, date: 0, chat: { id: 1, type: 'private' } } })).toBe(false)
  })
})

describe('caption', () => {
  it('string form matches exact equality', () => {
    expect(caption('hi')(messageWithCaption('hi'))).toBe(true)
    expect(caption('hi')(messageWithCaption('bye'))).toBe(false)
  })

  it('regex form attaches match', () => {
    const update = messageWithCaption('caption 7') as Record<string, unknown>
    const f = caption(/(?<n>\d+)/)

    expect(f(update)).toBe(true)
    expect((update as { match?: RegExpMatchArray }).match?.groups?.n).toBe('7')
  })
})

describe('command', () => {
  const cmdMessage = (raw: string) => ({
    kind: 'message',
    raw: {
      message_id: 1,
      date: 0,
      chat: { id: 100, type: 'private' },
      text: raw
    }
  })

  it('matches /name', () => {
    expect(command('start')(cmdMessage('/start'))).toBe(true)
  })

  it('matches /name args', () => {
    expect(command('start')(cmdMessage('/start foo bar'))).toBe(true)
  })

  it('matches /name@bot', () => {
    expect(command('start')(cmdMessage('/start@stubbot'))).toBe(true)
  })

  it('matches /name followed by newline', () => {
    expect(command('start')(cmdMessage('/start\nstuff'))).toBe(true)
  })

  it('rejects /othername', () => {
    expect(command('start')(cmdMessage('/help'))).toBe(false)
  })

  it('attaches RegExpMatchArray as match on success', () => {
    const update = cmdMessage('/say hello') as Record<string, unknown>

    expect(command(/^\/say(?:\s+(?<text>.+))?$/i)(update)).toBe(true)
    expect((update as { match?: RegExpMatchArray }).match?.groups?.text).toBe('hello')
  })
})

describe('regex', () => {
  it('matches against text and attaches match', () => {
    const update = messageWithText('hello world') as Record<string, unknown>

    expect(regex(/(?<word>world)/)(update)).toBe(true)
    expect((update as { match?: RegExpMatchArray }).match?.groups?.word).toBe('world')
  })

  it('falls back to caption when text is absent', () => {
    const update = messageWithCaption('caption text') as Record<string, unknown>

    expect(regex(/caption/)(update)).toBe(true)
  })
})

describe('startsWith / endsWith / contains', () => {
  it('startsWith default auto picks text first', () => {
    expect(startsWith('/foo')(messageWithText('/foo bar'))).toBe(true)
    expect(startsWith('/foo')(messageWithText('not it'))).toBe(false)
  })

  it('endsWith default auto picks text first', () => {
    expect(endsWith('!')(messageWithText('hello!'))).toBe(true)
    expect(endsWith('!')(messageWithText('hello'))).toBe(false)
  })

  it('contains default auto picks text first', () => {
    expect(contains('hello')(messageWithText('say hello there'))).toBe(true)
    expect(contains('hello')(messageWithText('nope'))).toBe(false)
  })

  it('field: caption explicitly scans the caption field', () => {
    expect(startsWith('cap', { field: 'caption' })(messageWithCaption('cap-text'))).toBe(true)
    expect(startsWith('cap', { field: 'caption' })(messageWithText('cap-text'))).toBe(false)
  })

  it('contains with auto falls back to caption when text is absent', () => {
    expect(contains('hello')(messageWithCaption('hello world'))).toBe(true)
  })
})

describe('start', () => {
  it('no-arg form matches plain /start', () => {
    expect(start()(messageWithText('/start'))).toBe(true)
  })

  it('no-arg form matches /start with payload', () => {
    expect(start()(messageWithText('/start abc'))).toBe(true)
  })

  it('no-arg form rejects non-/start text', () => {
    expect(start()(messageWithText('/started'))).toBe(false)
    expect(start()(messageWithText('hello'))).toBe(false)
  })

  it('string form matches exact payload', () => {
    expect(start('promo')(messageWithText('/start promo'))).toBe(true)
    expect(start('promo')(messageWithText('/start other'))).toBe(false)
    expect(start('promo')(messageWithText('/start'))).toBe(false)
  })

  it('regex form attaches inner match groups', () => {
    const update = messageWithText('/start utm-source:42') as Record<string, unknown>

    expect(start(/^(?<source>[^:]+):(?<id>\d+)$/)(update)).toBe(true)

    const m = (update as { match?: RegExpMatchArray }).match

    expect(m?.groups?.source).toBe('utm-source')
    expect(m?.groups?.id).toBe('42')
  })

  it('regex form rejects when payload absent', () => {
    expect(start(/x/)(messageWithText('/start'))).toBe(false)
  })

  it('attaches the full match for the no-arg form', () => {
    const update = messageWithText('/start hello') as Record<string, unknown>

    expect(start()(update)).toBe(true)
    expect((update as { match?: RegExpMatchArray }).match?.groups?.payload).toBe('hello')
  })

  it('matches /start@bot variants', () => {
    expect(start()(messageWithText('/start@SomeBot'))).toBe(true)
    expect(start()(messageWithText('/start@SomeBot payload'))).toBe(true)
  })
})
