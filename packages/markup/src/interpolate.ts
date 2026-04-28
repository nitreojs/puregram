import { type Entity, Formatted } from './formatted'

export type Piece =
  | { kind: 'text', value: string }
  | { kind: 'formatted', value: Formatted }
  | { kind: 'skip' }

export interface Interpolated {
  text: string
  entities: Entity[]
}

export function interpolate (pieces: readonly Piece[]): Interpolated {
  let text = ''
  const entities: Entity[] = []

  for (const piece of pieces) {
    if (piece.kind === 'skip') {
      continue
    }

    if (piece.kind === 'text') {
      text += piece.value
      continue
    }

    const offset = text.length

    text += piece.value.text

    for (const e of piece.value.entities) {
      entities.push({ ...e, offset: e.offset + offset })
    }
  }

  return { text, entities }
}
