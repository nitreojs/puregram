import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { loadLatestSchema } from './lib/emitter/load-schema'
import { applyMethodReturnOverrides } from './lib/emitter/method-overrides'
import { emitAll } from './lib/emitter/outputs'
import { applySoftEnums } from './lib/emitter/soft-enums'

async function main () {
  const schema = await loadLatestSchema()

  applySoftEnums(schema)
  applyMethodReturnOverrides(schema)

  const expected = emitAll(schema)

  const here = dirname(fileURLToPath(import.meta.url))
  const generatedDir = resolve(here, '..', 'src', 'generated')

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
