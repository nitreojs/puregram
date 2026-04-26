import { describe, it, expect } from 'vitest'
import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { emitEnums } from '../../scripts/lib/emitter/emit-enums'
import type { Schema } from '../../scripts/lib/schema-types'

const __dirname = dirname(fileURLToPath(import.meta.url))

describe('emitEnums', () => {
  it('emits enum declarations for the curated list', async () => {
    const schema = JSON.parse(
      await readFile(resolve(__dirname, '../fixtures/small-schema.json'), 'utf8')
    ) as Schema

    const out = emitEnums(schema)

    expect(out).toContain('export enum ChatType')
    expect(out).toContain('Private = "private"')
    expect(out).toContain('Group = "group"')
    expect(out).toContain('Supergroup = "supergroup"')
    expect(out).toContain('Channel = "channel"')

    expect(out).toContain('export enum ParseMode')
    expect(out).toContain('Markdown = "Markdown"')
  })
})
