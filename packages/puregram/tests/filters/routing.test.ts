import { kind } from '@puregram/api'
import { describe, expect, it } from 'vitest'

import { CustomUpdate } from '../../src/dispatch/custom-updates'
import { customKind, kindIn } from '../../src/filters/routing'

describe('kind callable + shorthand', () => {
  it('kind("message") matches updates with kind=message', () => {
    expect(kind('message')({ kind: 'message' })).toBe(true)
    expect(kind('message')({ kind: 'callback_query' })).toBe(false)
  })

  it('kind.message shorthand is identical to kind("message")', () => {
    expect(kind.message({ kind: 'message' })).toBe(true)
    expect(kind.message({ kind: 'callback_query' })).toBe(false)
  })

  it('attaches kinds metadata limited to the matched kind', () => {
    expect(kind('message').kinds).toEqual(['message'])
    expect(kind.callbackQuery.kinds).toEqual(['callback_query'])
  })
})

describe('kindIn', () => {
  it('matches any of the supplied kinds via varargs', () => {
    const f = kindIn('message', 'callback_query')

    expect(f({ kind: 'message' })).toBe(true)
    expect(f({ kind: 'callback_query' })).toBe(true)
    expect(f({ kind: 'inline_query' })).toBe(false)
  })

  it('matches via array form', () => {
    const f = kindIn(['message', 'callback_query'])

    expect(f({ kind: 'message' })).toBe(true)
    expect(f({ kind: 'callback_query' })).toBe(true)
    expect(f({ kind: 'inline_query' })).toBe(false)
  })

  it('exposes kinds metadata as the supplied list', () => {
    const f = kindIn('message', 'callback_query')

    expect(f.kinds).toEqual(['message', 'callback_query'])
  })
})

describe('customKind', () => {
  it('matches CustomUpdate instances dispatched under the same kind', () => {
    const update = new CustomUpdate('jobs', { jobId: 'a' })

    expect(customKind('jobs')(update)).toBe(true)
  })

  it('rejects bot-api updates with a different kind', () => {
    expect(customKind('jobs')({ kind: 'message' })).toBe(false)
  })

  it('exposes kinds metadata equal to the custom name', () => {
    expect(customKind('jobs').kinds).toEqual(['jobs'])
  })
})
