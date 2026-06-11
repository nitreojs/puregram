export type Dialect = 'markdown' | 'html'

const RICH_NODE = Symbol.for('puregram.rich.node')

/** a builder result — knows its block/inline level and how to render into either dialect */
export interface RichNode {
  readonly [RICH_NODE]: true
  readonly level: 'inline' | 'block'
  render: (dialect: Dialect) => string
}

/** construct a rich node from a level + a per-dialect renderer */
export function makeNode (level: 'inline' | 'block', render: (dialect: Dialect) => string) {
  return { [RICH_NODE]: true, level, render } as RichNode
}

export function isRichNode (value: unknown): value is RichNode {
  return typeof value === 'object' && value !== null && (value as Record<symbol, unknown>)[RICH_NODE] === true
}
