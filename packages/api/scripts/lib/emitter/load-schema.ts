import { readFile, readdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Schema } from '../schema-types'

export async function loadLatestSchema () {
  const here = dirname(fileURLToPath(import.meta.url))
  const schemaDir = resolve(here, '..', '..', '..', 'schema')
  const files = await readdir(schemaDir)
  const versionFiles = files
    .filter(f => /^\d+\.\d+\.json$/.test(f))
    .sort((a, b) => {
      const pa = a.replace('.json', '').split('.').map(Number)
      const pb = b.replace('.json', '').split('.').map(Number)

      for (let i = 0; i < 2; i++) {
        if (pa[i] !== pb[i]) {
          return pa[i]! - pb[i]!
        }
      }

      return 0
    })

  if (versionFiles.length === 0) {
    throw new Error(`no schema/<version>.json found in ${schemaDir}; run "yarn parse" first`)
  }

  const latest = versionFiles[versionFiles.length - 1]!
  const raw = await readFile(resolve(schemaDir, latest), 'utf8')

  return JSON.parse(raw) as Schema
}

export function versionString (schema: Schema) {
  return `${schema.version.major}.${schema.version.minor}`
}
