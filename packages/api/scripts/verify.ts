import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { loadLatestSchema } from './lib/emitter/load-schema'
import { emitTypes } from './lib/emitter/emit-types'
import { emitMethods } from './lib/emitter/emit-methods'
import { emitApiMethods } from './lib/emitter/emit-api-methods'
import { emitEnums } from './lib/emitter/emit-enums'
import { emitInspect } from './lib/emitter/emit-inspect'
import { emitStructures } from './lib/emitter/emit-structures'
import { emitUpdates } from './lib/emitter/emit-updates'
import { emitShortcuts } from './lib/emitter/emit-shortcuts'
import { emitServiceEvents } from './lib/emitter/emit-service-events'
import { emitFactories } from './lib/emitter/emit-factories'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function main () {
  const schema = await loadLatestSchema()

  const expected: [string, string][] = [
    ['inspect.ts',         emitInspect(schema)],
    ['types.ts',           emitTypes(schema)],
    ['methods.ts',         emitMethods(schema)],
    ['api-methods.ts',     emitApiMethods(schema)],
    ['enums.ts',           emitEnums(schema)],
    ['structures.ts',      emitStructures(schema)],
    ['updates.ts',         emitUpdates(schema)],
    ['shortcuts.ts',       emitShortcuts(schema)],
    ['service-events.ts',  emitServiceEvents(schema)],
    ['factories.ts',       emitFactories(schema)]
  ]

  const generatedDir = resolve(__dirname, '..', 'src', 'generated')

  let drifted = 0

  for (const [name, content] of expected) {
    const path = resolve(generatedDir, name)
    let onDisk: string
    try {
      onDisk = await readFile(path, 'utf8')
    } catch {
      console.error(`[verify] missing: ${name}`)
      drifted++
      continue
    }
    if (onDisk !== content) {
      console.error(`[verify] drift detected: ${name}`)
      drifted++
    }
  }

  if (drifted > 0) {
    console.error(`[verify] ${drifted} file(s) drifted. run "yarn emit" to regenerate, then commit.`)
    process.exit(1)
  }

  console.log('[verify] ok — generated/ matches schema')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
