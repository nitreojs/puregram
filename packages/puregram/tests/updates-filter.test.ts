import { UPDATE_KINDS } from '@puregram/api'
import { describe, expect, it } from 'vitest'

import { UpdatesFilter } from '../src/updates-filter'

describe('UpdatesFilter', () => {
  it('all() returns every update kind', () => {
    const all = UpdatesFilter.all()

    expect(all).toEqual([...UPDATE_KINDS])
    expect(all).toHaveLength(UPDATE_KINDS.length)
  })

  it('all() returns a fresh array — mutating the result does not affect UPDATE_KINDS', () => {
    const all = UpdatesFilter.all()

    all.pop()

    expect(UPDATE_KINDS.length).toBeGreaterThan(all.length)
    expect(UpdatesFilter.all()).toHaveLength(UPDATE_KINDS.length)
  })

  it('except(kind) drops a single kind', () => {
    const out = UpdatesFilter.except('chat_member')

    expect(out).not.toContain('chat_member')
    expect(out).toHaveLength(UPDATE_KINDS.length - 1)
    expect(out).toContain('message')
  })

  it('except(kinds[]) drops all listed kinds', () => {
    const out = UpdatesFilter.except(['business_connection', 'business_message'])

    expect(out).not.toContain('business_connection')
    expect(out).not.toContain('business_message')
    expect(out).toHaveLength(UPDATE_KINDS.length - 2)
  })

  it('except([]) returns every kind', () => {
    const out = UpdatesFilter.except([])

    expect(out).toEqual([...UPDATE_KINDS])
  })

  it('preserves UPDATE_KINDS order', () => {
    const out = UpdatesFilter.except(['chat_member'])
    const expected = UPDATE_KINDS.filter(k => k !== 'chat_member')

    expect(out).toEqual(expected)
  })
})
