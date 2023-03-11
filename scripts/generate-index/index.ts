import { writeFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const args = process.argv.slice(2)

if (args.length === 0) {
  console.error('[generate-index] expected directory path')

  process.exit(-1)
}

const STRUCTURES_PATH = resolve(__dirname, '..', '..', 'packages', 'puregram', 'src', args[0])
const INDEX_PATH = resolve(STRUCTURES_PATH, 'index.ts')

const main = async () => {
  const rawFiles = await readdir(STRUCTURES_PATH)

  const filenames = rawFiles
    .filter(file => file.endsWith('.ts'))
    .filter(file => file !== 'index.ts')
    .map(file => file.slice(0, -3))

  const content = filenames.map(filename => `export * from './${filename}'`).join('\n') + '\n'

  await writeFile(INDEX_PATH, content)

  console.log(`[generate-index] successfully generated ${filenames.length} exports in ${args[0]}/index.ts`)
}

main().catch(console.error)
