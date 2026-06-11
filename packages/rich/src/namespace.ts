import * as builders from './builders'
import { makeTemplate } from './template'

/** the rich authoring namespace — template tags + every builder under one import */
export const rich = {
  md: makeTemplate('markdown'),
  markdown: makeTemplate('markdown'),
  html: makeTemplate('html'),
  ...builders
}
