import { type RichNode, isRichNode, makeNode } from '../node'
import { type RichContent, renderContent } from '../render'

/** line break — `<br>` in html, hard newline in markdown */
export function br () {
  return makeNode('inline', d => (d === 'markdown' ? '\n' : '<br>'))
}

function isBlock (item: RichContent) {
  return isRichNode(item) && item.level === 'block'
}

/** join an array of content with a separator; block items newline-join, inline items concat */
export function join (items: RichContent[], separator: string | RichNode = '') {
  const block = items.some(isBlock)

  return makeNode(block ? 'block' : 'inline', (d) => {
    const sep = block ? '\n' : renderContent(separator, d)

    return items.map(item => renderContent(item, d)).join(sep)
  })
}
