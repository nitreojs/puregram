import type { Dialect } from './node'
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

  return lines.map(line => line.slice(min)).join('\n').replace(/^\n+/, '').replace(/\s+$/, '')
}

export interface RichTemplate {
  (source: string): Rich
  (strings: TemplateStringsArray, ...values: RichContent[]): Rich
}

export function makeTemplate (dialect: Dialect) {
  return ((first: string | TemplateStringsArray, ...values: RichContent[]) => {
    if (typeof first === 'string') {
      return new Rich(dialect, first)
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
