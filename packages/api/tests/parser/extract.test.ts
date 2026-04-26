import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, it, expect } from 'vitest'

import { extractFromHtml } from '../../scripts/lib/parser/normalize'

const __dirname = dirname(fileURLToPath(import.meta.url))

describe('extractFromHtml', () => {
  it('extracts methods from corefork fixture', async () => {
    const html = await readFile(resolve(__dirname, '../fixtures/corefork-snippet.html'), 'utf8')
    const { methods, objects } = extractFromHtml(html)

    const getMe = methods.find(m => m.name === 'getMe')

    expect(getMe).toBeDefined()
    expect(getMe!.arguments).toEqual([])
    expect(getMe!.returnType).toEqual({ kind: 'reference', name: 'User' })

    const sendMessage = methods.find(m => m.name === 'sendMessage')

    expect(sendMessage).toBeDefined()
    const chatIdArg = sendMessage!.arguments.find(a => a.name === 'chat_id')

    expect(chatIdArg!.required).toBe(true)
    expect(chatIdArg!.type).toEqual({
      kind: 'union',
      of: [{ kind: 'integer' }, { kind: 'string' }]
    })

    const message = objects.find(o => o.name === 'Message')

    expect(message).toBeDefined()
    expect(message!.kind).toBe('object')

    if (message!.kind === 'object') {
      const from = message.fields.find(f => f.name === 'from')

      expect(from!.required).toBe(false)
    }
  })
})
