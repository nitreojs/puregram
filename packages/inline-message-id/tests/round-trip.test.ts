import { describe, expect, it } from 'vitest'

import { parseInlineMessageId } from '../src/parse'
import { serializeInlineMessageId } from '../src/serialize'
import type { ParsedInlineMessageId } from '../src/types'

const fixtures: ParsedInlineMessageId[] = [
  { kind: 'legacy', dcId: 1, id: 0n, accessHash: 0n },
  { kind: 'legacy', dcId: 2, id: 0x0000007B000001C8n, accessHash: 0x1234567890ABCDEFn },
  { kind: 'legacy', dcId: 4, id: -1n, accessHash: -1n },
  { kind: 'legacy', dcId: 5, id: 0x7FFFFFFFFFFFFFFFn, accessHash: -0x8000000000000000n },
  { kind: 'modern', dcId: 1, ownerId: 0n, messageId: 0, accessHash: 0n },
  { kind: 'modern', dcId: 2, ownerId: 7000000000n, messageId: 42, accessHash: 0x1EADBEEFCAFEBABEn },
  { kind: 'modern', dcId: 5, ownerId: -1n, messageId: -1, accessHash: -1n },
  { kind: 'modern', dcId: 5, ownerId: 0x7FFFFFFFFFFFFFFFn, messageId: 0x7FFFFFFF, accessHash: -0x8000000000000000n }
]

describe('parse / serialize round-trip', () => {
  for (const fixture of fixtures) {
    it(`round-trips ${fixture.kind} #${fixtures.indexOf(fixture)}`, () => {
      const encoded = serializeInlineMessageId(fixture)
      const reparsed = parseInlineMessageId(encoded)

      expect(reparsed).toEqual(fixture)
      expect(serializeInlineMessageId(reparsed)).toBe(encoded)
    })
  }
})
