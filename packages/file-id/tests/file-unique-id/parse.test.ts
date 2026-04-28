import { describe, expect, it } from 'vitest'

import { parseFileUniqueId } from '../../src/file-unique-id/parse'

describe('parseFileUniqueId', () => {
  it('parses a document unique_id', () => {
    const u = parseFileUniqueId('AgADegAD997LEQ')

    expect(u.kind).toBe('document')

    if (u.kind !== 'document') {
      throw new Error('expected document')
    }

    expect(u.id).toBe(1282363671355326586n)
  })

  it('parses a document unique_id from luckydonald fixture', () => {
    const u = parseFileUniqueId('AgADBAsAAgKLowAB')

    expect(u.kind).toBe('document')

    if (u.kind !== 'document') {
      throw new Error('expected document')
    }

    expect(u.id).toBe(46033261910035204n)
  })
})
