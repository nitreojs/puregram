import type { Entity } from '../formatted'

/** a tag span — start/end positions, the entity that introduced it, and any nested children */
export interface TagNode {
  start: number
  end: number
  entity: Entity
  children: TagNode[]
}

interface Piece {
  start: number
  end: number
  entity: Entity
}

/**
 * splits each entity into pieces that nest cleanly inside other entities.
 * for the easy case (nested entities like `<b><i>hi</i></b>`) the output preserves nesting.
 * for non-rectangular overlap (`A` starts inside `B` and extends past it), `A` is split at `B`'s end
 * so the resulting tree always nests; reverse parsing reproduces the original entity set
 */
export function layout (text: string, entities: readonly Entity[]) {
  const roots: TagNode[] = []

  if (entities.length === 0) {
    return roots
  }

  const points = new Set<number>([0, text.length])

  for (const e of entities) {
    points.add(e.offset)
    points.add(e.offset + e.length)
  }

  const sortedPoints = [...points].sort((a, b) => a - b)
  const pieces: Piece[] = []

  for (const e of entities) {
    const start = e.offset
    const end = e.offset + e.length

    for (let i = 0; i < sortedPoints.length - 1; i++) {
      const a = sortedPoints[i]
      const b = sortedPoints[i + 1]

      if (a === undefined || b === undefined) {
        continue
      }

      if (a >= start && b <= end && a < b) {
        pieces.push({ start: a, end: b, entity: e })
      }
    }
  }

  // outer wrappers first at each position; ties broken by original entity order
  const entityOrder = new Map<Entity, number>()

  entities.forEach((e, i) => entityOrder.set(e, i))

  pieces.sort((a, b) => {
    if (a.start !== b.start) {
      return a.start - b.start
    }

    if (a.end !== b.end) {
      return b.end - a.end
    }

    return (entityOrder.get(a.entity) ?? 0) - (entityOrder.get(b.entity) ?? 0)
  })

  const stack: TagNode[] = []

  for (const piece of pieces) {
    while (stack.length > 0) {
      const top = stack[stack.length - 1]

      if (top === undefined) {
        break
      }

      if (piece.start >= top.end) {
        stack.pop()
        continue
      }

      break
    }

    const node: TagNode = { start: piece.start, end: piece.end, entity: piece.entity, children: [] }
    const parent = stack[stack.length - 1]

    if (parent === undefined) {
      roots.push(node)
    } else {
      parent.children.push(node)
    }

    stack.push(node)
  }

  return roots
}
