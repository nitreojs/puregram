// 7 bits per byte (high bit 0) keeps the wire single-byte ascii under utf-8;
// bits within a byte are lsb-first, so `1, 0, 1, 1` becomes `0b0001101`
const BITS_PER_BYTE = 7

/** sequential bit writer — call `write` / `writeBits` to push, then `finish` for the byte stream */
export class BitWriter {
  private readonly bytes: number[] = []
  private current = 0
  private filled = 0

  /** push a single bit (0 or 1) */
  write (bit: number) {
    this.current |= (bit & 1) << this.filled
    this.filled += 1

    if (this.filled === BITS_PER_BYTE) {
      this.bytes.push(this.current)
      this.current = 0
      this.filled = 0
    }
  }

  /** push the low `count` bits of `value`, lsb first */
  writeBits (value: number, count: number) {
    for (let i = 0; i < count; i += 1) {
      this.write((value >>> i) & 1)
    }
  }

  /** flush any partial byte and return the packed stream */
  finish () {
    if (this.filled > 0) {
      this.bytes.push(this.current)
    }

    return this.bytes
  }
}

/** sequential bit reader, opposite end of `BitWriter` */
export class BitReader {
  private readonly bytes: ArrayLike<number>
  private byteIndex: number
  private bitIndex = 0

  constructor (bytes: ArrayLike<number>, offset = 0) {
    this.bytes = bytes
    this.byteIndex = offset
  }

  /** read a single bit; throws if the stream is exhausted */
  read () {
    const byte = this.bytes[this.byteIndex]

    if (byte === undefined) {
      throw new RangeError('bit stream exhausted')
    }

    const bit = (byte >> this.bitIndex) & 1

    this.bitIndex += 1

    if (this.bitIndex === BITS_PER_BYTE) {
      this.byteIndex += 1
      this.bitIndex = 0
    }

    return bit
  }

  /** read `count` bits and return them packed as an unsigned integer (lsb first) */
  readBits (count: number) {
    let value = 0

    for (let i = 0; i < count; i += 1) {
      value |= this.read() << i
    }

    return value >>> 0
  }
}

/** number of header bytes needed to fit `bitCount` packed bits */
export function bytesForBits (bitCount: number) {
  return Math.ceil(bitCount / BITS_PER_BYTE)
}
