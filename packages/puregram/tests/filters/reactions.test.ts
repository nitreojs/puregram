import { describe, expect, it } from 'vitest'

import { paidReaction, reaction, reactionAdded, reactionRemoved } from '../../src/filters/reactions'

const reactionUpdate = (oldList: unknown[], newList: unknown[]) => ({
  kind: 'message_reaction',
  raw: {
    chat: { id: 1, type: 'supergroup' },
    message_id: 1,
    date: 0,
    old_reaction: oldList,
    new_reaction: newList
  }
})

describe('reaction', () => {
  it('matches when an emoji-typed entry uses the supplied emoji', () => {
    const update = reactionUpdate([], [{ type: 'emoji', emoji: '👍' }])

    expect(reaction('👍')(update)).toBe(true)
    expect(reaction('🔥')(update)).toBe(false)
  })

  it('matches against the old_reaction snapshot too', () => {
    const update = reactionUpdate([{ type: 'emoji', emoji: '🔥' }], [])

    expect(reaction('🔥')(update)).toBe(true)
  })

  it('empty-args form matches any reaction in either snapshot', () => {
    expect(reaction()(reactionUpdate([], [{ type: 'emoji', emoji: '👍' }]))).toBe(true)
    expect(reaction()(reactionUpdate([], []))).toBe(false)
  })

  it('varargs match any of the supplied emojis', () => {
    expect(reaction('👍', '🔥')(reactionUpdate([], [{ type: 'emoji', emoji: '🔥' }]))).toBe(true)
  })
})

describe('paidReaction', () => {
  it('matches when a paid-type entry is present in either snapshot', () => {
    expect(paidReaction(reactionUpdate([], [{ type: 'paid' }]))).toBe(true)
    expect(paidReaction(reactionUpdate([{ type: 'paid' }], []))).toBe(true)
    expect(paidReaction(reactionUpdate([], [{ type: 'emoji', emoji: '👍' }]))).toBe(false)
  })
})

describe('reactionAdded / reactionRemoved', () => {
  it('reactionAdded matches when new is longer than old', () => {
    expect(reactionAdded(reactionUpdate([], [{ type: 'emoji', emoji: '👍' }]))).toBe(true)
    expect(reactionAdded(reactionUpdate([{ type: 'emoji', emoji: '👍' }], []))).toBe(false)
  })

  it('reactionRemoved matches when old is longer than new', () => {
    expect(reactionRemoved(reactionUpdate([{ type: 'emoji', emoji: '👍' }], []))).toBe(true)
    expect(reactionRemoved(reactionUpdate([], [{ type: 'emoji', emoji: '👍' }]))).toBe(false)
  })
})
