import { IncomingMessage } from 'node:http'
import { randomBytes } from 'node:crypto'
import { PassThrough, Readable } from 'node:stream'

import { MediaInput } from '../media-source'

export const applyMixins = (derivedCtor: any, baseCtors: any[]) => {
  for (const baseCtor of baseCtors) {
    for (const name of Object.getOwnPropertyNames(baseCtor.prototype)) {
      if (name === 'constructor') {
        continue
      }

      Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name)!
      )
    }
  }
}

export const isPlainObject = (object: object): object is Record<string, any> => (
  Object.prototype.toString.call(object) === '[object Object]'
)

export const filterPayload = (payload: Record<string, any>): Record<string, any> => {
  const filteredPayload: Record<string, any> = {}

  for (const [key, value] of Object.entries(payload)) {
    const notEmpty = value !== undefined && value !== null

    const isEmptyArray = (
      Array.isArray(value)
      && value!.length === 0
    )

    if (notEmpty && !isEmptyArray) {
      if (isPlainObject(value)) {
        filteredPayload[key] = filterPayload(value)
      } else {
        filteredPayload[key] = value
      }
    }
  }

  return filteredPayload
}

export const isParseable = (source: string): boolean => {
  try {
    JSON.parse(source)
  } catch (e) {
    return false
  }

  return true
}

export const delay = (delayed: number): Promise<void> => (
  new Promise(resolve => setTimeout(resolve, delayed))
)

const replaceRegexpChar = (char: string): string => (
  char
    .replace(/\//g, '\\/')
    .replace(/\\/g, '\\\\')
    .replace(/\[/g, '\\[')
    .replace(/]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\*/g, '\\*')
)

export const replaceChars = (source: string, chars: string[] | string): string => {
  let edited: string = source
  const actualChars: string[] = !Array.isArray(chars) ? chars.split('') : chars

  for (const char of actualChars) {
    edited = edited.replace(
      new RegExp(
        replaceRegexpChar(char),
        'g'
      ),
      `\\${char}`
    )
  }

  return edited
}

// https://github.com/negezor/vk-io/blob/c4db32cdd15e17e398e88fb780bbbbe0e8b61856/packages/vk-io/src/updates/helpers.ts
export const parseRequestJSON = async (req: IncomingMessage): Promise<Record<string, any>> => {
  const chunks = []
  let totalSize = 0

  for await (const chunk of req) {
    totalSize += chunk.length

    chunks.push(chunk)
  }

  return JSON.parse(
    Buffer.concat(chunks, totalSize).toString('utf8')
  )
}

/** Totally safe way to identify whether `obj` is `MediaInput` or not */
export const isMediaInput = (obj: Record<string, any>): obj is MediaInput => (
  obj.type !== undefined && ['path', 'url', 'file_id', 'buffer', 'stream'].includes(obj.type)
)

/** Converts complex values in `obj` into simple strings */
export const decomplexify = (obj: Record<string, any>) => {
  const result: Record<string, string> = {}
  const typesToSkip = ['undefined', 'function', 'symbol']

  for (const [key, value] of Object.entries(obj)) {
    const valueType = typeof value

    // INFO: skipping values that'll return [undefined] when serialized
    // INFO: skipping [media] keys since they must include an array of [MediaInput]
    // INFO: note that passing [BigInt] value (e.g. `1337n`) is still allowed but it will crash the app
    if (
      value === null ||
      typesToSkip.includes(valueType) ||
      isMediaInput(value) ||
      key === 'media'
    ) continue

    const fns: Record<string, (v: any) => string> = {
      string: (value: string) => value,
      number: (value: number) => value.toString(),
      boolean: (value: boolean) => String(value)
    }

    const fn = fns[valueType] || ((value: any) => JSON.stringify(value))

    result[key] = fn(value)
  }

  return result
}

export const generateAttachId = () => randomBytes(8).toString('hex')

export const convertStreamToBuffer = async (rawStream: Readable) => {
  const stream = new PassThrough()

  rawStream.pipe(stream)

  const chunks: Buffer[] = []
  let size = 0

  for await (const chunk of stream) {
    size += (chunk as Buffer).length

    chunks.push(chunk as Buffer)
  }

  return Buffer.concat(chunks, size)
}
