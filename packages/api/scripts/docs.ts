import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { emitFiltersPage } from './lib/docs/emit-filters'
import { emitMethodsPage } from './lib/docs/emit-methods'
import { emitObjectsPage } from './lib/docs/emit-objects'
import { emitUpdatesPage } from './lib/docs/emit-updates'
import { GENERATED_BANNER } from './lib/docs/shared'
import { loadLatestSchema, versionString } from './lib/emitter/load-schema'

const index = `${GENERATED_BANNER}

# api reference

auto-generated from the committed bot api schema.

- [methods](/api/methods) — the raw \`tg.api.*\` surface
- [objects](/api/objects) — objects, unions and enums
- [updates](/api/updates) — every wrapped update kind, its shortcuts and helpers
- [filters](/api/filters) — the codegen'd \`hasX\` presence filters
`

async function main () {
  const schema = await loadLatestSchema()

  const here = dirname(fileURLToPath(import.meta.url))
  const outDir = resolve(here, '..', '..', '..', 'docs', 'api')

  await mkdir(outDir, { recursive: true })

  const writes: [string, string][] = [
    ['index.md', index],
    ['methods.md', emitMethodsPage(schema)],
    ['objects.md', emitObjectsPage(schema)],
    ['updates.md', emitUpdatesPage(schema)],
    ['filters.md', emitFiltersPage(schema)]
  ]

  for (const [name, content] of writes) {
    await writeFile(resolve(outDir, name), content, 'utf8')
    console.log(`[docs] wrote api/${name} (${content.length} bytes)`)
  }

  console.log(`[docs] api reference generated for bot api ${versionString(schema)}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
