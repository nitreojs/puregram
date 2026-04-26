import { describe, it, expect } from 'vitest'
import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseCorefork } from '../../scripts/lib/parser/corefork'

const __dirname = dirname(fileURLToPath(import.meta.url))

describe('parseCorefork', () => {
  it('parses corefork fixture into schema fragment', async () => {
    const html = await readFile(resolve(__dirname, '../fixtures/corefork-snippet.html'), 'utf8')
    const fragment = parseCorefork(html)

    expect(fragment.methods.find(m => m.name === 'sendMessage')).toBeDefined()
    expect(fragment.objects.find(o => o.name === 'Update')).toBeDefined()
    expect(fragment.version.major).toBeGreaterThanOrEqual(7)
  })
})
