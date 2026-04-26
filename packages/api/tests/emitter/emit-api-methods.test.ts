import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, it, expect } from 'vitest'

import { emitApiMethods } from '../../scripts/lib/emitter/emit-api-methods'
import type { Schema } from '../../scripts/lib/schema-types'

const __dirname = dirname(fileURLToPath(import.meta.url))

describe('emitApiMethods', () => {
  it('emits ApiMethods interface mapping', async () => {
    const schema = JSON.parse(
      await readFile(resolve(__dirname, '../fixtures/small-schema.json'), 'utf8')
    ) as Schema

    const out = emitApiMethods(schema)

    expect(out).toContain('export interface ApiMethods')
    expect(out).toContain('sendMessage: api.sendMessage')
    expect(out).toContain('getMe: api.getMe')
    expect(out).toContain('import * as api from "./methods"')
  })
})
