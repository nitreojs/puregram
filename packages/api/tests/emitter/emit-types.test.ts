import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, it, expect } from 'vitest'

import { emitTypes } from '../../scripts/lib/emitter/emit-types'
import type { Schema } from '../../scripts/lib/schema-types'

const __dirname = dirname(fileURLToPath(import.meta.url))

describe('emitTypes', () => {
  it('emits expected interfaces for the small fixture', async () => {
    const schema = JSON.parse(
      await readFile(resolve(__dirname, '../fixtures/small-schema.json'), 'utf8')
    ) as Schema

    const out = emitTypes(schema)

    expect(out).toContain('export interface TelegramUser')
    expect(out).toContain('id: number')
    expect(out).toContain('is_bot: boolean')
    expect(out).toContain('last_name?: string')

    expect(out).toContain('export interface TelegramChat')
    expect(out).toContain('type: "private" | "group" | "supergroup" | "channel"')

    expect(out).toContain('export interface TelegramMessage')
    expect(out).toContain('chat: TelegramChat')

    expect(out).toContain('AUTO-GENERATED')
  })
})
