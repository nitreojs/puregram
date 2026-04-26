import { describe, it, expect } from 'vitest'

describe('generated output smoke', () => {
  it('imports the package entrypoint without throwing', async () => {
    const mod = await import('../src/index')
    expect(mod).toBeDefined()
  })

  it('exposes canonical types', async () => {
    const types = await import('../src/generated/types')
    expect(types).toBeDefined()
  })

  it('exposes a User wrapper class', async () => {
    const { User } = await import('../src/generated/structures')
    const u = new User({ id: 1, is_bot: false, first_name: 'foo' })
    expect(u.id).toBe(1)
    expect(u.firstName).toBe('foo')
    expect(u.isBot).toBe(false)
  })

  it('User wrapper has fromPayload factory', async () => {
    const { User } = await import('../src/generated/structures')
    const u = User.fromPayload({ id: 7, is_bot: true, first_name: 'bot' })
    expect(u).toBeInstanceOf(User)
    expect(u.id).toBe(7)
  })

  it('exposes a MessageUpdate class with kind discriminant', async () => {
    const { MessageUpdate } = await import('../src/generated/updates')

    const fakeTg = { api: {} as any }
    const u = new MessageUpdate(
      { message_id: 1, date: 0, chat: { id: 100, type: 'private' } } as any,
      fakeTg as any
    )

    expect(u.kind).toBe('message')
    expect(u.is('message')).toBe(true)
    expect(u.is('callback_query')).toBe(false)
  })

  it('exposes the InputMedia factory if InputMedia objects are in schema', async () => {
    const factories = await import('../src/generated/factories')
    if ((factories as any).InputMedia) {
      const result = (factories as any).InputMedia.photo({ media: 'cat.jpg' })
      expect(result.type).toBe('photo')
      expect(result.media).toBe('cat.jpg')
    }
  })
})
