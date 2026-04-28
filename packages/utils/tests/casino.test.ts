import { describe, expect, it } from 'vitest'

import { CasinoValue, getCasinoValues } from '../src/casino'

describe('getCasinoValues', () => {
  it('1 → all bars (jackpot)', () => {
    expect(getCasinoValues(1)).toEqual([CasinoValue.Bar, CasinoValue.Bar, CasinoValue.Bar])
  })

  it('64 → all sevens (max value)', () => {
    expect(getCasinoValues(64)).toEqual([CasinoValue.Seven, CasinoValue.Seven, CasinoValue.Seven])
  })

  it('accepts string input', () => {
    expect(getCasinoValues('1')).toEqual(getCasinoValues(1))
    expect(getCasinoValues('64')).toEqual(getCasinoValues(64))
  })

  it('returns a 3-tuple of CasinoValue members', () => {
    const result = getCasinoValues(22)
    const allowed = new Set<string>(Object.values(CasinoValue))

    expect(result).toHaveLength(3)

    for (const symbol of result) {
      expect(allowed.has(symbol)).toBe(true)
    }
  })
})
