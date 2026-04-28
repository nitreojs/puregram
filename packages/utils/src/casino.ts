/** slot-machine icon names */
export const CasinoValue = {
  Bar: 'bar',
  Grapes: 'grapes',
  Lemon: 'lemon',
  Seven: 'seven'
} as const

export type CasinoValue = (typeof CasinoValue)[keyof typeof CasinoValue]

export type SlotMachineValue = readonly [CasinoValue, CasinoValue, CasinoValue]

const ORDER: readonly CasinoValue[] = [
  CasinoValue.Bar,
  CasinoValue.Grapes,
  CasinoValue.Lemon,
  CasinoValue.Seven
]

/** decodes the slot-machine dice value (1..64) into its 3-symbol display */
export function getCasinoValues (source: number | string) {
  const input = typeof source === 'string' ? Number.parseInt(source, 10) : source
  const base4 = Number.parseInt(toBase4Digits(input).join(''), 10) - 1
  const padded = String(base4).padStart(3, '0')
  const out: CasinoValue[] = []

  for (const ch of padded) {
    const digit = Math.min(Number.parseInt(ch, 10), 3)

    out.push(ORDER[digit % 4] as CasinoValue)
  }

  out.reverse()

  return [out[0] as CasinoValue, out[1] as CasinoValue, out[2] as CasinoValue]
}

function toBase4Digits (n: number) {
  const digits: number[] = []
  let cur = n

  while (cur > 0) {
    digits.push(cur % 4)
    cur = Math.floor(cur / 4)
  }

  digits.reverse()

  return digits
}
