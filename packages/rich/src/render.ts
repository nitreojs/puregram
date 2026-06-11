import { RichError } from './error'
import { escapeHtml, escapeMarkdown } from './escape'
import { type Dialect, type RichNode, isRichNode } from './node'
import { Rich } from './rich'

/** anything a builder or template accepts as content */
export type RichContent = string | number | RichNode | Rich | null | undefined | false | RichContent[]

export function escape (text: string, dialect: Dialect) {
  return dialect === 'markdown' ? escapeMarkdown(text) : escapeHtml(text)
}

/** resolve one piece of content into a dialect string (strings escaped, nodes rendered) */
export function renderContent (value: RichContent, dialect: Dialect): string {
  if (value === null || value === undefined || value === false) {
    return ''
  }

  if (typeof value === 'string') {
    return escape(value, dialect)
  }

  if (typeof value === 'number') {
    return escape(String(value), dialect)
  }

  if (Array.isArray(value)) {
    return value.map(v => renderContent(v, dialect)).join('')
  }

  if (value instanceof Rich) {
    if (value.dialect !== dialect) {
      throw new RichError(`cannot inline a ${value.dialect} Rich into a ${dialect} template`)
    }

    return value.content
  }

  if (isRichNode(value)) {
    return value.render(dialect)
  }

  throw new RichError(`unsupported rich content: ${typeof value}`)
}
