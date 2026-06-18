import type { Dialect, RichNode } from './node'
import { type RichContent, renderContent } from './render'
import { Rich } from './rich'

// strip the common leading indentation shared by the literal skeleton, then trim blank edges
function dedent (skeleton: string) {
  const lines = skeleton.split('\n')
  let min = Infinity

  for (const line of lines) {
    if (line.trim() === '') {
      continue
    }

    const indent = (/^[ \t]*/.exec(line) as RegExpExecArray)[0].length

    min = Math.min(min, indent)
  }

  if (!Number.isFinite(min)) {
    min = 0
  }

  return lines.map(line => line.slice(min)).join('\n').replace(/^\n+/, '').trimEnd()
}

export interface RichTemplate {
  (source: string): Rich
  (blocks: readonly RichNode[]): Rich
  (strings: TemplateStringsArray, ...values: RichContent[]): Rich
}

export function makeTemplate (dialect: Dialect) {
  return ((first: string | TemplateStringsArray | readonly RichNode[], ...values: RichContent[]) => {
    if (typeof first === 'string') {
      return new Rich(dialect, first)
    }

    // block-array form: rich.md([heading(...), list(...)]) — a plain array (no `.raw` template
    // marker) composes top-level blocks, joined by a blank line
    if (!('raw' in first)) {
      return new Rich(dialect, first.map(node => renderContent(node, dialect)).join('\n\n'))
    }

    // dedent the literal skeleton only (\x00 marks interpolation seams so values aren't dedented)
    const dedented = dedent(first.join('\x00')).split('\x00')

    let content = ''

    for (let i = 0; i < dedented.length; i++) {
      content += dedented[i]

      if (i < values.length) {
        content += renderContent(values[i] as RichContent, dialect)
      }
    }

    return new Rich(dialect, content)
  }) as RichTemplate
}
