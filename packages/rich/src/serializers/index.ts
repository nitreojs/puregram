import type { TelegramInputRichBlock } from '@puregram/api'

import type { Dialect } from '../node'

import { serializeHtmlBlocks } from './html'
import { serializeMarkdownBlocks } from './markdown'

export { serializeHtmlBlocks, serializeHtmlText } from './html'
export { serializeMarkdownBlocks, serializeMarkdownText } from './markdown'

/** render native blocks as a single dialect source string */
export function serializeBlocks (blocks: readonly TelegramInputRichBlock[], dialect: Dialect) {
  return dialect === 'markdown' ? serializeMarkdownBlocks(blocks) : serializeHtmlBlocks(blocks)
}
