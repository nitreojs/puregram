import { FileUniqueId } from '../file-unique-id/class'
import { fileUniqueIdFromFileId } from '../file-unique-id/from-file-id'

import { parseFileId } from './parse'
import { serializeFileId } from './serialize'
import type { ParsedFileId } from './types'

const INSPECT = Symbol.for('nodejs.util.inspect.custom')

export class FileId {
  readonly raw: ParsedFileId

  constructor (raw: ParsedFileId) {
    this.raw = raw
  }

  get kind () {
    return this.raw.kind
  }

  get fileType () {
    return this.raw.fileType
  }

  get version () {
    return this.raw.version
  }

  get subVersion () {
    return this.raw.subVersion
  }

  get dcId () {
    return this.raw.dcId
  }

  get accessHash () {
    return this.raw.accessHash
  }

  get source () {
    return this.raw.source
  }

  get fileReference () {
    return this.raw.fileReference
  }

  get hasReference () {
    return this.raw.fileReference !== undefined
  }

  get hasWebLocation () {
    return this.raw.kind === 'web'
  }

  get id () {
    return this.raw.kind === 'web' ? undefined : this.raw.id
  }

  get photoSize () {
    return this.raw.kind === 'photo' ? this.raw.photoSize : undefined
  }

  get url () {
    return this.raw.kind === 'web' ? this.raw.url : undefined
  }

  static from (str: string) {
    return new FileId(parseFileId(str))
  }

  toString () {
    return serializeFileId(this.raw)
  }

  toUniqueId () {
    return new FileUniqueId(fileUniqueIdFromFileId(this.raw))
  }

  [INSPECT] (_depth: number, _options: unknown, inspect: (v: unknown) => string) {
    return `FileId ${inspect(this.raw)}`
  }
}
