type CasinoValue = 'bar' | 'grapes' | 'lemon' | 'seven'
type SlotMachineValue = [CasinoValue, CasinoValue, CasinoValue]

const casinoValues: CasinoValue[] = ['bar', 'grapes', 'lemon', 'seven']

/** Converts base-10 number to base-4 */
const toBase4 = (number: number): number => {
  let result: number[] = []

  while (number > 0) {
    result.push(number % 4)

    number = Math.floor(number / 4)
  }

  result = result.reverse()

  return Number.parseInt(result.join('')) - 1
}

/** Returns slot machine's values */
export const getCasinoValues = (source: number | string): SlotMachineValue => {
  const rawNumber: number = toBase4(
    typeof source === 'string'
      ? Number.parseInt(source)
      : source
  )

  const number: string = String(rawNumber).padStart(3, '0')
  let result: SlotMachineValue = [] as unknown as SlotMachineValue

  for (const char of number) {
    let int: number = Number.parseInt(char)

    if (int > 3) {
      int = 3
    }

    result.push(casinoValues[int % 4])
  }

  result = result.reverse() as SlotMachineValue

  return result
}
