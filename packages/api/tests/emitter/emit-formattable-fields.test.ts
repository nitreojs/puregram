import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, it, expect } from 'vitest'

import { emitFormattableFields } from '../../scripts/lib/emitter/emit-formattable-fields'
import type { Schema } from '../../scripts/lib/schema-types'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function loadFixture () {
  return JSON.parse(
    await readFile(resolve(__dirname, '../fixtures/formattable-schema.json'), 'utf8')
  ) as Schema
}

describe('emitFormattableFields', () => {
  it('emits descriptor for direct text/entities pair', async () => {
    const schema = await loadFixture()
    const out = emitFormattableFields(schema)

    expect(out).toContain('export const FORMATTABLE_FIELDS')
    expect(out).toContain('"sendMessage"')
    expect(out).toMatch(/path:\s*\["text"\]/)
    expect(out).toMatch(/textKey:\s*"text"/)
    expect(out).toMatch(/entitiesKey:\s*"entities"/)
  })

  it('emits descriptor for nested-array paired field (sendMediaGroup.media[].caption)', async () => {
    const schema = await loadFixture()
    const out = emitFormattableFields(schema)

    expect(out).toContain('"sendMediaGroup"')
    expect(out).toMatch(/path:\s*\["media",\s*"\*",\s*"caption"\]/)
    expect(out).toMatch(/entitiesKey:\s*"caption_entities"/)
  })
})
