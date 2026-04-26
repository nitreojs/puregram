import { describe, it, expect } from 'vitest'
import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Schema } from '../scripts/lib/schema-types'

const __dirname = dirname(fileURLToPath(import.meta.url))

describe('schema types', () => {
  it('small-schema fixture parses as Schema', async () => {
    const path = resolve(__dirname, 'fixtures/small-schema.json')
    const raw = await readFile(path, 'utf8')
    const parsed = JSON.parse(raw) as Schema
    expect(parsed.version.major).toBe(8)
    expect(parsed.methods.length).toBeGreaterThan(0)
    expect(parsed.objects.length).toBeGreaterThan(0)
  })
})
