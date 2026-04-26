import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, it, expect } from 'vitest'

import { emitShortcuts } from '../../scripts/lib/emitter/emit-shortcuts'
import type { Schema } from '../../scripts/lib/schema-types'

const __dirname = dirname(fileURLToPath(import.meta.url))

describe('emitShortcuts', () => {
  it('emits TelegramShortcuts interface with curated verbs', async () => {
    const schema = JSON.parse(
      await readFile(resolve(__dirname, '../fixtures/small-schema.json'), 'utf8')
    ) as Schema

    const out = emitShortcuts(schema)

    expect(out).toContain('export interface TelegramShortcuts')
    expect(out).toContain('send(')
    expect(out).toContain('chat: number | string')
    expect(out).toContain('text: string')
  })
})
