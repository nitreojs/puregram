import type { Entity, Formatted } from '../formatted'

import { layout, type TagNode } from './layout'

const HTML_ESCAPE_RE = /[<>&"]/g
const HTML_ESCAPE_MAP: Readonly<Record<string, string>> = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  '"': '&quot;'
}

function escapeHtml (text: string) {
  return text.replace(HTML_ESCAPE_RE, ch => HTML_ESCAPE_MAP[ch] ?? ch)
}

// inside <code>/<pre>: telegram still parses entity refs there; quotes are safe in element bodies
const HTML_BODY_ESCAPE_RE = /[<>&]/g

function escapeHtmlBody (text: string) {
  return text.replace(HTML_BODY_ESCAPE_RE, ch => HTML_ESCAPE_MAP[ch] ?? ch)
}

function openTag (entity: Entity) {
  switch (entity.type) {
    case 'bold': return '<b>'
    case 'italic': return '<i>'
    case 'underline': return '<u>'
    case 'strikethrough': return '<s>'
    case 'spoiler': return '<tg-spoiler>'
    case 'code': return '<code>'
    case 'pre': {
      if (entity.language !== undefined && entity.language !== '') {
        return `<pre><code class="language-${escapeHtml(entity.language)}">`
      }

      return '<pre>'
    }
    case 'blockquote': return '<blockquote>'
    case 'expandable_blockquote': return '<blockquote expandable>'
    case 'text_link': return `<a href="${escapeHtml(entity.url ?? '')}">`
    case 'text_mention': return `<a href="tg://user?id=${entity.user?.id ?? 0}">`
    case 'custom_emoji': return `<tg-emoji emoji-id="${escapeHtml(entity.custom_emoji_id ?? '')}">`
    case 'date_time': {
      const unix = entity.unix_time ?? 0
      const fmt = entity.date_time_format

      if (fmt !== undefined && fmt !== '') {
        return `<tg-time unix="${unix}" format="${escapeHtml(fmt)}">`
      }

      return `<tg-time unix="${unix}">`
    }
    default: return null
  }
}

function closeTag (entity: Entity) {
  switch (entity.type) {
    case 'bold': return '</b>'
    case 'italic': return '</i>'
    case 'underline': return '</u>'
    case 'strikethrough': return '</s>'
    case 'spoiler': return '</tg-spoiler>'
    case 'code': return '</code>'
    case 'pre': {
      if (entity.language !== undefined && entity.language !== '') {
        return '</code></pre>'
      }

      return '</pre>'
    }
    case 'blockquote':
    case 'expandable_blockquote': return '</blockquote>'
    case 'text_link':
    case 'text_mention': return '</a>'
    case 'custom_emoji': return '</tg-emoji>'
    case 'date_time': return '</tg-time>'
    default: return null
  }
}

function isRaw (entity: Entity) {
  return entity.type === 'code' || entity.type === 'pre'
}

function renderRange (text: string, start: number, end: number, nodes: TagNode[], rawMode: boolean) {
  let out = ''
  let cursor = start
  const esc = rawMode ? escapeHtmlBody : escapeHtml

  for (const node of nodes) {
    if (node.start > cursor) {
      out += esc(text.slice(cursor, node.start))
    }

    const open = openTag(node.entity)
    const close = closeTag(node.entity)
    const innerRaw = rawMode || isRaw(node.entity)

    if (open !== null) {
      out += open
    }

    if (node.children.length === 0) {
      const innerEsc = innerRaw ? escapeHtmlBody : escapeHtml

      out += innerEsc(text.slice(node.start, node.end))
    } else {
      out += renderRange(text, node.start, node.end, node.children, innerRaw)
    }

    if (close !== null) {
      out += close
    }

    cursor = node.end
  }

  if (cursor < end) {
    out += esc(text.slice(cursor, end))
  }

  return out
}

/** serializes a {@link Formatted} (or `{text, entities}` shape) into telegram html source */
export function toHtml (source: Formatted | { text: string, entities?: readonly Entity[] }) {
  const text = source.text
  const entities = source.entities ?? []
  const roots = layout(text, entities)

  return renderRange(text, 0, text.length, roots, false)
}
