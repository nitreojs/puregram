import { describe, it, expect } from 'vitest'
import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { emitUpdates } from '../../scripts/lib/emitter/emit-updates'
import type { Schema } from '../../scripts/lib/schema-types'

const __dirname = dirname(fileURLToPath(import.meta.url))

describe('emitUpdates', () => {
  it('emits MessageUpdate class with kind, raw, lazy getters, shortcuts', async () => {
    const schema = JSON.parse(
      await readFile(resolve(__dirname, '../fixtures/small-schema.json'), 'utf8')
    ) as Schema

    const out = emitUpdates(schema)

    expect(out).toContain('export class MessageUpdate')
    expect(out).toContain('readonly kind = "message" as const')
    expect(out).toContain('public raw: TelegramMessage')
    expect(out).toContain('private tg: TelegramLike')
    expect(out).toContain('get chat(): Chat')
    expect(out).toContain('is<K extends UpdateKind>')

    expect(out).toContain('send(')
    expect(out).toContain('this.tg.api.sendMessage')
    expect(out).toContain('chat_id: this.raw.chat.id')

    expect(out).toContain("import type { TelegramLike } from \"../telegram-like\"")
    expect(out).toContain("import { INSPECT, makeInspect } from \"./inspect\"")
  })
})
