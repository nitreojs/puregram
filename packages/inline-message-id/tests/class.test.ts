import { inspect } from 'node:util'

import { describe, expect, it } from 'vitest'

import { InlineMessageId } from '../src/class'
import { serializeInlineMessageId } from '../src/serialize'

describe('InlineMessageId class', () => {
  it('exposes derived chatId and messageId for legacy ids', () => {
    const packed = (BigInt.asUintN(32, -100n) << 32n) | BigInt.asUintN(32, 42n)
    const raw = { kind: 'legacy' as const, dcId: 2, id: packed, accessHash: 7n }
    const encoded = serializeInlineMessageId(raw)

    const id = InlineMessageId.from(encoded)

    expect(id.kind).toBe('legacy')
    expect(id.dcId).toBe(2)
    expect(id.chatId).toBe(-100)
    expect(id.messageId).toBe(42)
    expect(id.accessHash).toBe(7n)
    expect(id.ownerId).toBeUndefined()
  })

  it('exposes ownerId for modern ids and undefined chatId', () => {
    const raw = { kind: 'modern' as const, dcId: 5, ownerId: 7000000000n, messageId: 99, accessHash: 1n }
    const encoded = serializeInlineMessageId(raw)

    const id = InlineMessageId.from(encoded)

    expect(id.kind).toBe('modern')
    expect(id.ownerId).toBe(7000000000n)
    expect(id.chatId).toBeUndefined()
    expect(id.messageId).toBe(99)
  })

  it('round-trips via toString', () => {
    const raw = { kind: 'modern' as const, dcId: 2, ownerId: 12345n, messageId: 1, accessHash: 0n }
    const encoded = serializeInlineMessageId(raw)
    const id = InlineMessageId.from(encoded)

    expect(id.toString()).toBe(encoded)
  })

  it('uses a friendly node inspect representation', () => {
    const raw = { kind: 'modern' as const, dcId: 2, ownerId: 12345n, messageId: 1, accessHash: 0n }
    const id = new InlineMessageId(raw)

    expect(inspect(id)).toMatch(/^InlineMessageId /)
  })
})
