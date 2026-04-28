export class BinaryReader {
  private readonly buffer: Uint8Array
  private readonly view: DataView
  private offset = 0

  constructor (buffer: Uint8Array) {
    this.buffer = buffer
    this.view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)
  }

  get position () {
    return this.offset
  }

  get remaining () {
    return this.buffer.byteLength - this.offset
  }

  readI32 () {
    const value = this.view.getInt32(this.offset, true)

    this.offset += 4

    return value
  }

  readU32 () {
    const value = this.view.getUint32(this.offset, true)

    this.offset += 4

    return value
  }

  readI64 () {
    const value = this.view.getBigInt64(this.offset, true)

    this.offset += 8

    return value
  }

  readU8 () {
    const value = this.view.getUint8(this.offset)

    this.offset += 1

    return value
  }

  readBytes (count: number) {
    const slice = this.buffer.slice(this.offset, this.offset + count)

    this.offset += count

    return slice
  }

  skip (count: number) {
    this.offset += count
  }
}

export class BinaryWriter {
  private readonly chunks: Uint8Array[] = []

  writeI32 (value: number) {
    const buffer = new ArrayBuffer(4)

    new DataView(buffer).setInt32(0, value, true)
    this.chunks.push(new Uint8Array(buffer))
  }

  writeU32 (value: number) {
    const buffer = new ArrayBuffer(4)

    new DataView(buffer).setUint32(0, value, true)
    this.chunks.push(new Uint8Array(buffer))
  }

  writeI64 (value: bigint) {
    const buffer = new ArrayBuffer(8)

    new DataView(buffer).setBigInt64(0, value, true)
    this.chunks.push(new Uint8Array(buffer))
  }

  writeU8 (value: number) {
    this.chunks.push(new Uint8Array([value]))
  }

  writeBytes (bytes: Uint8Array) {
    this.chunks.push(bytes)
  }

  toBytes () {
    let length = 0

    for (const chunk of this.chunks) {
      length += chunk.byteLength
    }

    const out = new Uint8Array(length)
    let offset = 0

    for (const chunk of this.chunks) {
      out.set(chunk, offset)
      offset += chunk.byteLength
    }

    return out
  }
}
