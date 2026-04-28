import { describe, expect, it } from 'vitest'

import { parseFileUniqueId } from '../../src/file-unique-id/parse'
import { serializeFileUniqueId } from '../../src/file-unique-id/serialize'

const FIXTURES = [
  'AgADegAD997LEQ',
  'AgADBAsAAgKLowAB'
]

describe('FileUniqueId round-trip', () => {
  for (const raw of FIXTURES) {
    it(raw, () => {
      const u = parseFileUniqueId(raw)

      expect(serializeFileUniqueId(u)).toBe(raw)
    })
  }
})
