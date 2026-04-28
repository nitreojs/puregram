export function rleEncode (input: Uint8Array) {
  const out: number[] = []
  let zeros = 0

  for (const byte of input) {
    if (byte === 0) {
      zeros += 1
      continue
    }

    if (zeros > 0) {
      out.push(0, zeros)
      zeros = 0
    }

    out.push(byte)
  }

  if (zeros > 0) {
    out.push(0, zeros)
  }

  return new Uint8Array(out)
}

export function rleDecode (input: Uint8Array) {
  const out: number[] = []
  let prev: number | null = null

  for (const byte of input) {
    if (prev === 0) {
      for (let i = 0; i < byte; i += 1) {
        out.push(0)
      }

      prev = null
      continue
    }

    if (prev !== null) {
      out.push(prev)
    }

    prev = byte
  }

  if (prev !== null) {
    out.push(prev)
  }

  return new Uint8Array(out)
}
