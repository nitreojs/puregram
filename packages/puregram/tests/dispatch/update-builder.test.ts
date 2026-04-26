import { describe, it, expect } from 'vitest'
import { buildUpdate } from '../../src/dispatch/update-builder'

const fakeTg: any = { api: {} }

describe('buildUpdate', () => {
  it('builds MessageUpdate from message payload', () => {
    const update = buildUpdate(
      { update_id: 1, message: { message_id: 1, date: 0, chat: { id: 100, type: 'private' } } } as any,
      fakeTg
    )
    expect(update.kind).toBe('message')
  })

  it('builds CallbackQueryUpdate from callback_query payload', () => {
    const update = buildUpdate(
      { update_id: 2, callback_query: { id: 'q1', from: { id: 1, is_bot: false, first_name: 'a' }, chat_instance: 'x' } } as any,
      fakeTg
    )
    expect(update.kind).toBe('callback_query')
  })

  it('derives service event when message has new_chat_members', () => {
    const update = buildUpdate(
      {
        update_id: 3,
        message: {
          message_id: 1, date: 0, chat: { id: 100, type: 'group' },
          new_chat_members: [{ id: 1, is_bot: false, first_name: 'a' }]
        }
      } as any,
      fakeTg
    )
    expect(update.kind).toBe('new_chat_members')
  })

  it('returns UnsupportedUpdate for unknown kinds', () => {
    const update = buildUpdate(
      { update_id: 99, future_unknown_kind: { foo: 'bar' } } as any,
      fakeTg
    )
    expect(update.kind).toBe('unknown')
    expect((update as any).rawKey).toBe('future_unknown_kind')
  })
})
