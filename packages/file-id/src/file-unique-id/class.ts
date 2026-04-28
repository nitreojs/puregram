import { parseFileUniqueId } from './parse'
import { serializeFileUniqueId } from './serialize'
import type { ParsedFileUniqueId } from './types'

const INSPECT = Symbol.for('nodejs.util.inspect.custom')

export class FileUniqueId {
  readonly raw: ParsedFileUniqueId

  constructor (raw: ParsedFileUniqueId) {
    this.raw = raw
  }

  get kind () {
    return this.raw.kind
  }

  get source () {
    return this.raw.source
  }

  get id () {
    return 'id' in this.raw ? this.raw.id : undefined
  }

  get url () {
    return this.raw.kind === 'web' ? this.raw.url : undefined
  }

  get volumeId () {
    return this.raw.kind === 'photo' ? this.raw.volumeId : undefined
  }

  get localId () {
    return this.raw.kind === 'photo' ? this.raw.localId : undefined
  }

  static from (str: string) {
    return new FileUniqueId(parseFileUniqueId(str))
  }

  toString () {
    return serializeFileUniqueId(this.raw)
  }

  [INSPECT] (_depth: number, _options: unknown, inspect: (v: unknown) => string) {
    return `FileUniqueId ${inspect(this.raw)}`
  }
}
