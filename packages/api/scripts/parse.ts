import { mkdir, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { fetchHtml } from './lib/parser/fetch'
import { parseCorefork } from './lib/parser/corefork'
import { parseCore } from './lib/parser/core'
import { mergeFragments } from './lib/parser/merge'
import type { Schema } from './lib/schema-types'

const __dirname = dirname(fileURLToPath(import.meta.url))

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
  const outDir = resolve(__dirname, '..', 'schema')
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
