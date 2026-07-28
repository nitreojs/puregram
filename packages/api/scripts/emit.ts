import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { loadLatestSchema, versionString } from './lib/emitter/load-schema'
import { applyMethodReturnOverrides } from './lib/emitter/method-overrides'
import { emitAll } from './lib/emitter/outputs'
import { applySoftEnums } from './lib/emitter/soft-enums'

async function main () {
  const schema = await loadLatestSchema()

  applySoftEnums(schema)
  applyMethodReturnOverrides(schema)

  console.log(`[emit] schema: bot api ${versionString(schema)} (${schema.methods.length} methods, ${schema.objects.length} objects)`)

  const here = dirname(fileURLToPath(import.meta.url))
  const generatedDir = resolve(here, '..', 'src', 'generated')

  await mkdir(generatedDir, { recursive: true })

  const writes = emitAll(schema)

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
