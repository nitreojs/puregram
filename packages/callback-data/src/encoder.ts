import { BitReader, BitWriter, bytesForBits } from './bitfield'
import { CallbackDataInvalid } from './errors'
import type { Accepted, FieldSpec } from './types'
import { decodeVarint, encodeVarint } from './varint'

const STRING_LENGTH_LIMIT = 127
// telegram round-trips callback_data as utf-8 — an unpaired surrogate comes back
// as U+FFFD, so the payload would silently unpack to different data (or to null)
const LONE_SURROGATE = /[\uD800-\uDFFF]/u

type CodeUnit = number

/**
 * worst-case header bit count for a schema. always-padded so the header byte
 * length is deterministic from the schema alone (no per-state ambiguity).
 *
 * bits per field:
 * - non-optional boolean: 1 (value)
 * - non-optional literal: ceil(log2(N))
 * - optional boolean: 1 (presence) + 1 (value, padded when absent)
 * - optional literal: 1 (presence) + ceil(log2(N)) (index, padded when absent)
 * - optional string/number: 1 (presence)
 * - non-optional string/number: 0
 */
export function staticHeaderBits (fields: readonly FieldSpec[]) {
  let total = 0

  for (const field of fields) {
    if (field.optional) {
      total += 1
    }

    if (field.type === 'boolean') {
      total += 1
    } else if (field.type === 'literal') {
      total += field.bits ?? 0
    }
  }

  return total
}

/** pack a state object into wire code units per the schema; throws on invalid field values */
export function packBody (fields: readonly FieldSpec[], state: Record<string, unknown>) {
  validateState(fields, state)

  const writer = new BitWriter()
  const tail: CodeUnit[] = []

  for (const field of fields) {
    const present = isPresent(field, state)

    if (field.optional) {
      writer.write(present ? 1 : 0)
    }

    if (field.type === 'boolean') {
      // pad even when absent so the header layout is fixed by the schema alone
      writer.write(present && (state[field.key] ?? field.default) === true ? 1 : 0)
    } else if (field.type === 'literal') {
      const bits = field.bits ?? 0

      if (present) {
        const raw = (state[field.key] ?? field.default) as string
        const idx = (field.values ?? []).indexOf(raw)

        writer.writeBits(idx, bits)
      } else {
        writer.writeBits(0, bits)
      }

      continue
    }

    if (!present) {
      continue
    }

    if (field.type === 'string') {
      const str = String(state[field.key] ?? field.default)

      if (LONE_SURROGATE.test(str)) {
        throw new CallbackDataInvalid(field.key, 'string contains an unpaired surrogate')
      }

      if (str.length > STRING_LENGTH_LIMIT) {
        throw new CallbackDataInvalid(field.key, `string is ${str.length} code units, max is ${STRING_LENGTH_LIMIT}`)
      }

      tail.push(str.length)

      for (let i = 0; i < str.length; i += 1) {
        tail.push(str.charCodeAt(i))
      }
    } else if (field.type === 'number') {
      const n = (state[field.key] ?? field.default) as number

      tail.push(...encodeVarint(n))
    }
  }

  return [...writer.finish(), ...tail]
}

/**
 * decode wire code units into a state object. returns `null` if the payload is
 * malformed (truncated, invalid literal index, leftover data)
 */
export function unpackBody (fields: readonly FieldSpec[], data: string) {
  try {
    const headerBitCount = staticHeaderBits(fields)
    const headerLen = bytesForBits(headerBitCount)

    if (data.length < headerLen) {
      return null
    }

    const headerBytes: number[] = []

    for (let i = 0; i < headerLen; i += 1) {
      headerBytes.push(data.charCodeAt(i))
    }

    const reader = new BitReader(headerBytes, 0)
    const presence = new Map<string, { present: boolean, value?: Accepted }>()

    for (const field of fields) {
      const present = field.optional ? reader.read() === 1 : true

      if (field.type === 'boolean') {
        const valueBit = reader.read()

        presence.set(field.key, present ? { present: true, value: valueBit === 1 } : { present: false })
      } else if (field.type === 'literal') {
        const idx = reader.readBits(field.bits ?? 0)

        if (present) {
          const value = field.values?.[idx]

          if (value === undefined) {
            return null
          }

          presence.set(field.key, { present: true, value })
        } else {
          presence.set(field.key, { present: false })
        }
      } else {
        presence.set(field.key, { present })
      }
    }

    let offset = headerLen
    const result: Record<string, Accepted> = {}

    for (const field of fields) {
      const decoded = presence.get(field.key)

      if (decoded === undefined || !decoded.present) {
        continue
      }

      if (field.type === 'boolean' || field.type === 'literal') {
        if (decoded.value === undefined) {
          return null
        }

        result[field.key] = decoded.value
        continue
      }

      if (field.type === 'string') {
        if (offset >= data.length) {
          return null
        }

        const len = data.charCodeAt(offset)

        offset += 1

        if (offset + len > data.length) {
          return null
        }

        result[field.key] = data.slice(offset, offset + len)
        offset += len
      } else if (field.type === 'number') {
        const view = collectVarintBytes(data, offset)
        const read = decodeVarint(view, 0)

        result[field.key] = read.value
        offset += read.length
      }
    }

    if (offset !== data.length) {
      return null
    }

    return result
  } catch {
    return null
  }
}

function collectVarintBytes (data: string, offset: number) {
  // collect through the first byte without the continuation bit so `decodeVarint` sees a complete sequence
  const out: number[] = []

  for (let i = offset; i < data.length; i += 1) {
    const code = data.charCodeAt(i)

    out.push(code)

    if ((code & 0x40) === 0) {
      break
    }
  }

  return out
}

function isPresent (field: FieldSpec, state: Record<string, unknown>) {
  const provided = Object.prototype.hasOwnProperty.call(state, field.key) && state[field.key] !== undefined

  if (provided) {
    return true
  }

  if (field.default !== undefined) {
    return true
  }

  if (!field.optional) {
    throw new CallbackDataInvalid(field.key, 'required field is missing')
  }

  return false
}

function validateState (fields: readonly FieldSpec[], state: Record<string, unknown>) {
  for (const field of fields) {
    const value = state[field.key]

    if (value === undefined) {
      continue
    }

    if (field.type === 'boolean') {
      if (typeof value !== 'boolean') {
        throw new CallbackDataInvalid(field.key, `expected boolean, got ${typeof value}`)
      }
    } else if (field.type === 'number') {
      if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isInteger(value)) {
        throw new CallbackDataInvalid(field.key, `expected finite integer, got ${String(value)}`)
      }

      if (!Number.isSafeInteger(value)) {
        throw new CallbackDataInvalid(field.key, `expected safe integer, got ${value}`)
      }
    } else if (field.type === 'literal') {
      if (typeof value !== 'string' || !field.values?.includes(value)) {
        throw new CallbackDataInvalid(
          field.key,
          `expected one of [${field.values?.join(', ') ?? ''}], got ${String(value)}`
        )
      }
    } else if (field.type === 'string') {
      if (typeof value !== 'string') {
        throw new CallbackDataInvalid(field.key, `expected string, got ${typeof value}`)
      }
    }
  }
}
