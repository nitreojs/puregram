import { describe, expect, it } from 'vitest'

import { callbackData } from '../../src/filters/callback'
import { chosenInlineResult, inlineQuery } from '../../src/filters/inline'

const callbackUpdate = (data: string) => ({
  kind: 'callback_query',
  raw: {
    id: 'cb1',
    from: { id: 1, is_bot: false, first_name: 'x' },
    chat_instance: 'ci',
    data
  }
})

const inlineQueryUpdate = (query: string) => ({
  kind: 'inline_query',
  raw: {
    id: 'iq1',
    from: { id: 1, is_bot: false, first_name: 'x' },
    query,
    offset: ''
  }
})

const chosenResultUpdate = (result_id: string) => ({
  kind: 'chosen_inline_result',
  raw: {
    result_id,
    from: { id: 1, is_bot: false, first_name: 'x' },
    query: ''
  }
})

describe('callbackData', () => {
  it('matches exact data string', () => {
    expect(callbackData('buy')(callbackUpdate('buy'))).toBe(true)
    expect(callbackData('buy')(callbackUpdate('sell'))).toBe(false)
  })

  it('regex form attaches RegExpMatchArray as match', () => {
    const update = callbackUpdate('buy:42') as Record<string, unknown>
    const f = callbackData(/^buy:(?<id>\d+)$/)

    expect(f(update)).toBe(true)
    expect((update as { match?: RegExpMatchArray }).match?.groups?.id).toBe('42')
  })
})

describe('inlineQuery', () => {
  it('matches exact query string', () => {
    expect(inlineQuery('search')(inlineQueryUpdate('search'))).toBe(true)
    expect(inlineQuery('search')(inlineQueryUpdate('other'))).toBe(false)
  })

  it('regex form attaches match', () => {
    const update = inlineQueryUpdate('search hello') as Record<string, unknown>
    const f = inlineQuery(/^search\s+(?<term>.+)$/i)

    expect(f(update)).toBe(true)
    expect((update as { match?: RegExpMatchArray }).match?.groups?.term).toBe('hello')
  })
})

describe('chosenInlineResult', () => {
  it('matches exact result_id', () => {
    expect(chosenInlineResult('a')(chosenResultUpdate('a'))).toBe(true)
    expect(chosenInlineResult('a')(chosenResultUpdate('b'))).toBe(false)
  })

  it('regex form attaches match', () => {
    const update = chosenResultUpdate('article:42') as Record<string, unknown>
    const f = chosenInlineResult(/^article:(?<n>\d+)$/)

    expect(f(update)).toBe(true)
    expect((update as { match?: RegExpMatchArray }).match?.groups?.n).toBe('42')
  })
})
