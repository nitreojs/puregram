import { mkdir, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { loadLatestSchema, versionString } from './lib/emitter/load-schema'
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

  console.log(`[emit] schema: bot api ${versionString(schema)} (${schema.methods.length} methods, ${schema.objects.length} objects)`)

  const generatedDir = resolve(__dirname, '..', 'src', 'generated')
  await mkdir(generatedDir, { recursive: true })

  const writes: [string, string][] = [
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
