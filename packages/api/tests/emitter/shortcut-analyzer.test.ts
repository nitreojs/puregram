import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, it, expect } from 'vitest'

import { analyzeShortcuts } from '../../scripts/lib/emitter/shortcut-analyzer'
import type { Schema } from '../../scripts/lib/schema-types'

const __dirname = dirname(fileURLToPath(import.meta.url))

describe('analyzeShortcuts', () => {
  it('binds chat_id-only methods to message updates', async () => {
    const schema = JSON.parse(
      await readFile(resolve(__dirname, '../fixtures/small-schema.json'), 'utf8')
    ) as Schema

    const result = analyzeShortcuts(schema)
    const onMessage = result.byKind.message ?? []

    const send = onMessage.find(s => s.method === 'sendMessage')

    expect(send).toBeDefined()
    expect(send!.filledArgs.map(a => a.schemaArg).sort()).toEqual(['chat_id'])
    expect(send!.userArgs.map(a => a.name)).toContain('text')
  })

  it('does not bind methods missing required anchored args', async () => {
    const schema = JSON.parse(
      await readFile(resolve(__dirname, '../fixtures/small-schema.json'), 'utf8')
    ) as Schema

    const result = analyzeShortcuts(schema)
    const onCallbackQuery = result.byKind.callback_query ?? []

    expect(onCallbackQuery.find(s => s.method === 'sendMessage')).toBeUndefined()
  })
})
