export function base64urlDecode (input: string) {
  return new Uint8Array(Buffer.from(input, 'base64url'))
}

export function base64urlEncode (input: Uint8Array) {
  return Buffer.from(input).toString('base64url')
}

/** minimal little-endian reader for the fields we care about (int32, int64) */
export class BinaryReader {
  private readonly view: DataView
  private offset = 0

  constructor (buffer: Uint8Array) {
    this.view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)
  }

  readI32 () {
    const value = this.view.getInt32(this.offset, true)

    this.offset += 4

    return value
  }

  readI64 () {
    const value = this.view.getBigInt64(this.offset, true)

    this.offset += 8

    return value
  }
}

/** minimal little-endian writer with a known-size buffer */
export class BinaryWriter {
  private readonly buffer: Uint8Array
  private readonly view: DataView
  private offset = 0

  constructor (size: number) {
    this.buffer = new Uint8Array(size)
    this.view = new DataView(this.buffer.buffer, this.buffer.byteOffset, this.buffer.byteLength)
  }

  writeI32 (value: number) {
    this.view.setInt32(this.offset, value, true)
    this.offset += 4
  }

  writeI64 (value: bigint) {
    this.view.setBigInt64(this.offset, value, true)
    this.offset += 8
  }

  toBytes () {
    return this.buffer
  }
}
