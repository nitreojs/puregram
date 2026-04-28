import { inspect } from 'node:util'

import { describe, expect, it } from 'vitest'

import { ChatMember, User } from '../src/generated/structures'
import { MessageUpdate } from '../src/generated/updates'

const ESC = String.fromCharCode(27)

describe('makeInspect runtime output', () => {
  it('renders the wrapper class name + camelCase getters (not raw snake_case)', () => {
    const u = new User({ id: 42, is_bot: false, first_name: 'Anna', last_name: 'K' })
    const out = inspect(u, { colors: false })

    expect(out).toContain('User {')
    expect(out).toContain('id: 42')
    expect(out).toContain('isBot: false')
    expect(out).toContain("firstName: 'Anna'")
    expect(out).toContain("lastName: 'K'")

    expect(out).not.toContain('is_bot')
    expect(out).not.toContain('first_name')
    expect(out).not.toContain('last_name')
  })

  it('uses js-style object syntax (unquoted keys, single-quoted strings)', () => {
    const u = new User({ id: 42, is_bot: false, first_name: 'Anna' })
    const out = inspect(u, { colors: false })

    expect(out).not.toContain('"id"')
    expect(out).not.toContain('"firstName"')
  })

  it('includes hand-rolled getters (User.displayName) in the output', () => {
    const u = new User({ id: 1, is_bot: false, first_name: 'Anna', last_name: 'K' })
    const out = inspect(u, { colors: false })

    expect(out).toContain("displayName: 'Anna K'")
  })

  it('walks nested wrappers — User inside MessageUpdate stays a User block', () => {
    const update = new MessageUpdate({
      message_id: 1,
      date: 0,
      from: { id: 2, is_bot: false, first_name: 'Bob' },
      chat: { id: 3, type: 'private' }
    } as any, { api: {} } as any)
    const out = inspect(update, { colors: false, depth: 4 })

    expect(out).toContain('MessageUpdate {')
    expect(out).toContain('from: User {')
    expect(out).toContain('chat: Chat {')
    expect(out).not.toContain("kind: 'message'")
  })

  it('falls back to raw payload for wrapper classes with no schema fields', () => {
    const cm = new ChatMember({ status: 'administrator', can_invite_users: true } as any)
    const out = inspect(cm, { colors: false })

    expect(out).toContain('ChatMember {')
    expect(out).toContain("status: 'administrator'")
    expect(out).toContain('can_invite_users: true')
  })

  it('emits ansi escape codes around the class name when colors are on', () => {
    const u = new User({ id: 1, is_bot: false, first_name: 'A' })
    const out = inspect(u, { colors: true })

    expect(out.includes(ESC)).toBe(true)
    expect(out).toContain('User')
  })

  it('emits no ansi escapes when colors are off', () => {
    const u = new User({ id: 1, is_bot: false, first_name: 'A' })
    const out = inspect(u, { colors: false })

    expect(out.includes(ESC)).toBe(false)
  })

  it('collapses to just the stylized class name when depth has been exhausted', () => {
    const u = new User({ id: 1, is_bot: false, first_name: 'A' })
    const out = inspect({ wrapper: u }, { colors: false, depth: 0 })

    expect(out).toBe('{ wrapper: User }')
  })

  it('omits raw, tg, and underscore-prefixed cache fields from the rendered body', () => {
    const update = new MessageUpdate({
      message_id: 1,
      date: 0,
      chat: { id: 3, type: 'private' }
    } as any, { api: {} } as any)
    const out = inspect(update, { colors: false, depth: 4 })

    expect(out).not.toContain('raw:')
    expect(out).not.toContain('tg:')
    expect(out).not.toMatch(/_chat:/)
  })
})
