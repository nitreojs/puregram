// bit 6 (not 7) carries the continuation flag — keeps every byte ≤ 0x7F so the
// wire stays single-byte ascii under utf-8
const CONTINUATION = 0x40
const DATA_MASK = 0x3F
const BASE = 64n

// internally varint walks bigint to round-trip the full ±MAX_SAFE_INTEGER range —
// number-space zigzag would lose 1 lsb at the boundary

/** zigzag-encode a signed safe integer into an unsigned bigint */
export function zigzagEncode (n: number) {
  const bn = BigInt(n)

  return bn >= 0n ? bn << 1n : ((-bn) << 1n) - 1n
}

/** inverse of `zigzagEncode` — returns a number (caller must stay in safe-int range) */
export function zigzagDecode (bn: bigint) {
  const value = (bn & 1n) === 0n ? bn >> 1n : -((bn + 1n) >> 1n)

  return Number(value)
}

/** encode a signed safe integer into 1+ bytes; each byte is in [0..127] */
export function encodeVarint (n: number) {
  let v = zigzagEncode(n)
  const out: number[] = []

  while (v >= BASE) {
    out.push(Number(v & 0x3Fn) | CONTINUATION)
    v >>= 6n
  }

  out.push(Number(v) & DATA_MASK)

  return out
}

export interface VarintRead {
  value: number
  length: number
}

/**
 * decode a varint starting at `bytes[offset]`. throws `RangeError` if the
 * sequence is truncated (no terminator before the end of input)
 */
export function decodeVarint (bytes: ArrayLike<number>, offset: number) {
  let value = 0n
  let shift = 0n
  let i = offset

  while (true) {
    const b = bytes[i]

    if (b === undefined) {
      throw new RangeError('varint truncated')
    }

    i += 1
    value |= BigInt(b & DATA_MASK) << shift

    if ((b & CONTINUATION) === 0) {
      break
    }

    shift += 6n
  }

  return { value: zigzagDecode(value), length: i - offset }
}
