import { readFile, readdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Schema } from '../schema-types'

const __dirname = dirname(fileURLToPath(import.meta.url))

export async function loadLatestSchema (): Promise<Schema> {
  const schemaDir = resolve(__dirname, '..', '..', '..', 'schema')
  const files = await readdir(schemaDir)
  const versionFiles = files.filter(f => /^\d+\.\d+\.\d+\.json$/.test(f)).sort()

  if (versionFiles.length === 0) {
    throw new Error(`no schema/<version>.json found in ${schemaDir}; run "yarn parse" first`)
  }

  const latest = versionFiles[versionFiles.length - 1]
  const raw = await readFile(resolve(schemaDir, latest), 'utf8')
  return JSON.parse(raw) as Schema
}

export function versionString (schema: Schema): string {
  return `${schema.version.major}.${schema.version.minor}.${schema.version.patch}`
}
