import { describe, it, expect } from 'vitest'
import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { emitStructures } from '../../scripts/lib/emitter/emit-structures'
import type { Schema } from '../../scripts/lib/schema-types'

const __dirname = dirname(fileURLToPath(import.meta.url))

describe('emitStructures', () => {
  it('emits class with raw + lazy getters + fromPayload + inspect', async () => {
    const schema = JSON.parse(
      await readFile(resolve(__dirname, '../fixtures/small-schema.json'), 'utf8')
    ) as Schema

    const out = emitStructures(schema)

    expect(out).toContain('export class User')
    expect(out).toContain('constructor(public raw: TelegramUser)')
    expect(out).toContain('static fromPayload(raw: TelegramUser)')
    expect(out).toContain('get id(): number')
    expect(out).toContain('get isBot(): boolean')
    expect(out).toContain('get firstName(): string')

    expect(out).toContain('export class Message')
    expect(out).toContain('private _chat?: Chat')
    expect(out).toContain('get chat(): Chat')
    expect(out).toContain('this._chat ??= new Chat(this.raw.chat)')

    expect(out).toContain('get from(): User | undefined')

    expect(out).toContain('[INSPECT]()')

    expect(out).toContain("import type {")
    expect(out).toContain("import { INSPECT, makeInspect } from \"./inspect\"")
  })
})
