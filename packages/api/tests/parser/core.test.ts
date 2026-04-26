import { describe, it, expect } from 'vitest'
import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseCore } from '../../scripts/lib/parser/core'

const __dirname = dirname(fileURLToPath(import.meta.url))

describe('parseCore', () => {
  it('parses core fixture into schema fragment', async () => {
    const html = await readFile(resolve(__dirname, '../fixtures/core-snippet.html'), 'utf8')
    const fragment = parseCore(html)

    expect(fragment.methods.find(m => m.name === 'sendMessage')).toBeDefined()
    expect(fragment.objects.find(o => o.name === 'User')).toBeDefined()
  })
})
