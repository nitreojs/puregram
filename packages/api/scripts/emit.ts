import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { emitApiMethods } from './lib/emitter/emit-api-methods'
import { emitEnums } from './lib/emitter/emit-enums'
import { emitFactories } from './lib/emitter/emit-factories'
import { emitFilters } from './lib/emitter/emit-filters'
import { emitFormattableFields } from './lib/emitter/emit-formattable-fields'
import { emitInspect } from './lib/emitter/emit-inspect'
import { emitMethods } from './lib/emitter/emit-methods'
import { emitServiceEvents } from './lib/emitter/emit-service-events'
import { emitShortcuts } from './lib/emitter/emit-shortcuts'
import { emitStructures } from './lib/emitter/emit-structures'
import { emitTypes } from './lib/emitter/emit-types'
import { emitUpdates } from './lib/emitter/emit-updates'
import { loadLatestSchema, versionString } from './lib/emitter/load-schema'

async function main () {
  const schema = await loadLatestSchema()

  console.log(`[emit] schema: bot api ${versionString(schema)} (${schema.methods.length} methods, ${schema.objects.length} objects)`)

  const here = dirname(fileURLToPath(import.meta.url))
  const generatedDir = resolve(here, '..', 'src', 'generated')

  await mkdir(generatedDir, { recursive: true })

  const writes: [string, string][] = [
    ['inspect.ts', emitInspect(schema)],
    ['types.ts', emitTypes(schema)],
    ['methods.ts', emitMethods(schema)],
    ['api-methods.ts', emitApiMethods(schema)],
    ['enums.ts', emitEnums(schema)],
    ['structures.ts', emitStructures(schema)],
    ['updates.ts', emitUpdates(schema)],
    ['shortcuts.ts', emitShortcuts(schema)],
    ['service-events.ts', emitServiceEvents(schema)],
    ['factories.ts', emitFactories(schema)],
    ['formattable-fields.ts', emitFormattableFields(schema)],
    ['filters.ts', emitFilters(schema)]
  ]

  for (const [name, content] of writes) {
    const path = resolve(generatedDir, name)

    await writeFile(path, content, 'utf8')
    console.log(`[emit] wrote ${name} (${content.length} bytes)`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
