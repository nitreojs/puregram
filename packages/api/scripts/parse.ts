import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { parseCore } from './lib/parser/core'
import { parseCorefork } from './lib/parser/corefork'
import { fetchHtml } from './lib/parser/fetch'
import { mergeFragments } from './lib/parser/merge'
import type { Schema } from './lib/schema-types'

const COREFORK_URL = 'https://corefork.telegram.org/bots/api'
const CORE_URL = 'https://core.telegram.org/bots/api'

async function main () {
  console.log('[parse] fetching corefork…')
  const coreforkHtml = await fetchHtml(COREFORK_URL)

  console.log('[parse] fetching core…')
  const coreHtml = await fetchHtml(CORE_URL)

  console.log('[parse] parsing…')
  const coreforkFragment = parseCorefork(coreforkHtml)
  const coreFragment = parseCore(coreHtml)

  const merged = mergeFragments(coreforkFragment, coreFragment)

  const schema: Schema = {
    ...merged,
    source: {
      corefork: COREFORK_URL,
      core: CORE_URL,
      fetchedAt: new Date().toISOString()
    }
  }

  const versionString = `${schema.version.major}.${schema.version.minor}.${schema.version.patch}`
  const here = dirname(fileURLToPath(import.meta.url))
  const outDir = resolve(here, '..', 'schema')
  const outFile = resolve(outDir, `${versionString}.json`)

  await mkdir(outDir, { recursive: true })
  await writeFile(outFile, JSON.stringify(schema, null, 2) + '\n', 'utf8')

  console.log(`[parse] wrote ${outFile}`)
  console.log(`[parse]   ${schema.methods.length} methods, ${schema.objects.length} objects`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
