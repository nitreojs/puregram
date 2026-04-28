import { describe, expect, it } from 'vitest'

import { parseFileId } from '../../src/file-id/parse'
import { serializeFileId } from '../../src/file-id/serialize'
import { FIXTURES } from '../fixtures/file-ids'

describe('FileId round-trip (parse → serialize == original)', () => {
  for (const [name, raw] of Object.entries(FIXTURES)) {
    it(name, () => {
      const file = parseFileId(raw)

      expect(serializeFileId(file)).toBe(raw)
    })
  }
})
