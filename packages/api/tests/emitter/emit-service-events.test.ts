import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, it, expect } from 'vitest'

import { emitServiceEvents } from '../../scripts/lib/emitter/emit-service-events'
import type { Schema } from '../../scripts/lib/schema-types'

const __dirname = dirname(fileURLToPath(import.meta.url))

describe('emitServiceEvents', () => {
  it('emits a SERVICE_EVENT_FIELDS map of message-field → kind name', async () => {
    const schema = JSON.parse(
      await readFile(resolve(__dirname, '../fixtures/small-schema.json'), 'utf8')
    ) as Schema

    const out = emitServiceEvents(schema)

    expect(out).toContain('export const SERVICE_EVENT_FIELDS')
    expect(out).toContain('"new_chat_members": "new_chat_members"')
    expect(out).toContain('"pinned_message": "pinned_message"')
    expect(out).toContain('export const SERVICE_EVENT_ORDER')
  })
})
