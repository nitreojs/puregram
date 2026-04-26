import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, it, expect } from 'vitest'

import { emitMethods } from '../../scripts/lib/emitter/emit-methods'
import type { Schema } from '../../scripts/lib/schema-types'

const __dirname = dirname(fileURLToPath(import.meta.url))

describe('emitMethods', () => {
  it('emits expected param interfaces and method type aliases', async () => {
    const schema = JSON.parse(
      await readFile(resolve(__dirname, '../fixtures/small-schema.json'), 'utf8')
    ) as Schema

    const out = emitMethods(schema)

    expect(out).toContain('export interface SendMessageParams')
    expect(out).toContain('chat_id: number | string')
    expect(out).toContain('text: string')

    expect(out).toContain('export type sendMessage = (params: SendMessageParams) => Promise<TelegramMessage>')
    expect(out).toContain('export type getMe = () => Promise<TelegramUser>')
  })
})
