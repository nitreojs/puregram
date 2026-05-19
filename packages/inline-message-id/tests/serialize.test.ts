import { describe, expect, it } from 'vitest'

import { base64urlDecode } from '../src/encoding'
import { serializeInlineMessageId } from '../src/serialize'

describe('serializeInlineMessageId', () => {
  it('emits 20 bytes for the legacy form', () => {
    const encoded = serializeInlineMessageId({
      kind: 'legacy',
      dcId: 2,
      id: 0x0000007B000001C8n,
      accessHash: 0x1234567890ABCDEFn
    })

    expect(base64urlDecode(encoded).byteLength).toBe(20)
  })

  it('emits 24 bytes for the modern form', () => {
    const encoded = serializeInlineMessageId({
      kind: 'modern',
      dcId: 5,
      ownerId: 7000000000n,
      messageId: 42,
      accessHash: 0x1EADBEEFCAFEBABEn
    })

    expect(base64urlDecode(encoded).byteLength).toBe(24)
  })

  it('produces url-safe base64 (no `+`, `/`, or `=` padding)', () => {
    const encoded = serializeInlineMessageId({
      kind: 'modern',
      dcId: 5,
      ownerId: -1n,
      messageId: -1,
      accessHash: -1n
    })

    expect(encoded).not.toMatch(/[+/=]/)
  })

  it('encodes legacy fields in the documented byte order', () => {
    const encoded = serializeInlineMessageId({
      kind: 'legacy',
      dcId: 0x01020304,
      id: 0x0506070800000000n,
      accessHash: 0x090A0B0C0D0E0F10n
    })
    const bytes = base64urlDecode(encoded)
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)

    expect(view.getInt32(0, true)).toBe(0x01020304)
    expect(view.getBigInt64(4, true)).toBe(0x0506070800000000n)
    expect(view.getBigInt64(12, true)).toBe(0x090A0B0C0D0E0F10n)
  })

  it('encodes modern fields in the documented byte order', () => {
    const encoded = serializeInlineMessageId({
      kind: 'modern',
      dcId: 0x01020304,
      ownerId: 0x05060708090A0B0Cn,
      messageId: 0x0D0E0F10,
      accessHash: 0x1112131415161718n
    })
    const bytes = base64urlDecode(encoded)
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)

    expect(view.getInt32(0, true)).toBe(0x01020304)
    expect(view.getBigInt64(4, true)).toBe(0x05060708090A0B0Cn)
    expect(view.getInt32(12, true)).toBe(0x0D0E0F10)
    expect(view.getBigInt64(16, true)).toBe(0x1112131415161718n)
  })
})
