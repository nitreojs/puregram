import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, it, expect } from 'vitest'

import { analyzeThreadShortcuts } from '../../scripts/lib/emitter/shortcut-analyzer'
import type { Schema } from '../../scripts/lib/schema-types'

const __dirname = dirname(fileURLToPath(import.meta.url))

// the fixture Message has no message_thread_id and sendMessage doesn't accept it — add both,
// plus rely on getMe (already in the fixture) to prove the filter excludes non-thread methods
async function loadThreadable () {
  const schema = JSON.parse(
    await readFile(resolve(__dirname, '../fixtures/small-schema.json'), 'utf8')
  ) as Schema

  const message = schema.objects.find(o => o.name === 'Message')

  if (message?.kind === 'object') {
    message.fields.push({
      name: 'message_thread_id', description: 'thread id', required: false, type: { kind: 'integer' }
    })
  }

  const sendMessage = schema.methods.find(m => m.name === 'sendMessage')!

  sendMessage.arguments.push(
    { name: 'message_thread_id', description: 'thread id', required: false, type: { kind: 'integer' } },
    { name: 'reply_parameters', description: 'reply', required: false, type: { kind: 'reference', name: 'ReplyParameters' } }
  )

  schema.objects.push({
    kind: 'object',
    name: 'ReplyParameters',
    description: 'Reply parameters.',
    fields: [{ name: 'message_id', description: 'id', required: true, type: { kind: 'integer' } }]
  })

  return schema
}

describe('analyzeThreadShortcuts', () => {
  it('binds chat_id + message_thread_id on message methods that accept a thread id', async () => {
    const result = analyzeThreadShortcuts(await loadThreadable())
    const onMessage = result.byKind.message ?? []

    const send = onMessage.find(s => s.method === 'sendMessage' && !s.reply)

    expect(send).toBeDefined()
    expect(send!.filledArgs.map(a => a.schemaArg).sort()).toEqual(['chat_id', 'message_thread_id'])
    expect(send!.userArgs.map(a => a.name)).toContain('text')
  })

  it('emits reply twins inside the thread set', async () => {
    const result = analyzeThreadShortcuts(await loadThreadable())
    const onMessage = result.byKind.message ?? []

    const reply = onMessage.find(s => s.method === 'sendMessage' && s.reply)

    expect(reply?.reply?.verb).toBe('reply')
    expect(reply?.reply?.messageId.accessPath).toEqual(['raw', 'message_id'])
  })

  it('excludes methods that do not accept message_thread_id', async () => {
    const result = analyzeThreadShortcuts(await loadThreadable())
    const onMessage = result.byKind.message ?? []

    expect(onMessage.find(s => s.method === 'getMe')).toBeUndefined()
  })

  it('produces no thread shortcuts for payloads without a message_thread_id field', async () => {
    const schema = JSON.parse(
      await readFile(resolve(__dirname, '../fixtures/small-schema.json'), 'utf8')
    ) as Schema

    const result = analyzeThreadShortcuts(schema)

    expect(result.byKind.message ?? []).toHaveLength(0)
  })
})
