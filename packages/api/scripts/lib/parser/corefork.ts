import type { Schema, SchemaVersion, SchemaRecentChanges } from '../schema-types'

import { extractFromHtml } from './normalize'

export interface SchemaFragment {
  methods: Schema['methods']
  objects: Schema['objects']
  returnTypeFallbacks: string[]
  version: SchemaVersion
  recentChanges: SchemaRecentChanges
}

export function parseCorefork (html: string) {
  const { methods, objects, returnTypeFallbacks } = extractFromHtml(html)
  const version = parseVersion(html)
  const recentChanges = parseRecentChanges(html)

  return { methods, objects, returnTypeFallbacks, version, recentChanges }
}

function parseVersion (html: string) {
  const match = html.match(/Bot API\s+(\d+)\.(\d+)(?:\.(\d+))?/i)

  if (!match) {
    throw new Error('could not detect bot-api version in corefork html')
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: match[3] ? Number(match[3]) : 0
  }
}

function parseRecentChanges (html: string) {
  const match = html.match(/(\w+)\s+(\d{1,2}),\s+(\d{4})/)

  if (!match) {
    const now = new Date()

    return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() }
  }

  const monthIndex = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].indexOf(match[1]!)

  return {
    year: Number(match[3]),
    month: monthIndex >= 0 ? monthIndex + 1 : 1,
    day: Number(match[2])
  }
}
