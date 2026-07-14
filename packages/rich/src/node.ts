import type { TelegramInputRichBlock, TelegramRichText } from '@puregram/api'

/** raw dialects a string can pass through as, and the serializer targets */
export type Dialect = 'markdown' | 'html'

/** structured result of a node emission — `RichText` for inline nodes, block(s) for block nodes */
export type RichEmit = TelegramRichText | TelegramInputRichBlock | TelegramInputRichBlock[]

const RICH_NODE = Symbol.for('puregram.rich.node')

/** a builder result — knows its block/inline level and emits native rich-message structures */
export interface RichNode {
  readonly [RICH_NODE]: true
  readonly level: 'inline' | 'block'
  emit: () => RichEmit
}

/** construct a rich node from a level + a native emitter */
export function makeNode (level: 'inline' | 'block', emit: () => RichEmit) {
  return { [RICH_NODE]: true, level, emit } as RichNode
}

export function isRichNode (value: unknown): value is RichNode {
  return typeof value === 'object' && value !== null && (value as Record<symbol, unknown>)[RICH_NODE] === true
}
