import { type Entity, Formatted } from '../formatted'
import { interpolate, type Piece } from '../interpolate'
import { isTemplateStringsArray, pieceFromInterp } from '../parsers/sentinel'

export type WrapInterp =
  | string
  | number
  | Formatted
  | { text: string, entities?: readonly Entity[] }
  | null
  | undefined
  | false

export interface WrapFn {
  (text: string): Formatted
  (formatted: Formatted | { text: string, entities?: readonly Entity[] }): Formatted
  (strings: TemplateStringsArray, ...rest: readonly WrapInterp[]): Formatted
}

/** resolves a wrap builder's call args into the inner content as a Formatted */
export function resolveWrapArgs (args: readonly unknown[]) {
  if (args.length === 0) {
    throw new TypeError('wrap builder called with no arguments')
  }

  const first = args[0]

  if (typeof first === 'string') {
    return new Formatted(first)
  }

  if (first instanceof Formatted) {
    return first
  }

  if (isTemplateStringsArray(first)) {
    const rest = args.slice(1) as readonly WrapInterp[]
    const pieces: Piece[] = []

    for (let i = 0; i < first.length; i++) {
      const literal = first[i] ?? ''

      if (literal !== '') {
        pieces.push({ kind: 'text', value: literal })
      }

      if (i < rest.length) {
        pieces.push(pieceFromInterp(rest[i]))
      }
    }

    const { text, entities } = interpolate(pieces)

    return new Formatted(text, entities)
  }

  if (typeof first === 'object' && first !== null && 'text' in first) {
    return Formatted.from(first as { text: string, entities?: readonly Entity[] })
  }

  throw new TypeError('wrap builder called with unsupported argument type')
}

/** builds a callable that wraps inner content with a single entity factored from the resolved text */
export function makeWrap (makeEntity: (text: string) => Entity) {
  const fn = (...args: readonly unknown[]) => {
    const inner = resolveWrapArgs(args)
    const entity = makeEntity(inner.text)

    return new Formatted(inner.text, [entity, ...inner.entities])
  }

  return fn as WrapFn
}
