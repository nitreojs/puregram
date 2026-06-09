import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, it, expect } from 'vitest'

import { analyzeShortcuts } from '../../scripts/lib/emitter/shortcut-analyzer'
import type { Schema } from '../../scripts/lib/schema-types'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function loadSchema () {
  return JSON.parse(
    await readFile(resolve(__dirname, '../fixtures/small-schema.json'), 'utf8')
  ) as Schema
}

// fixture's sendMessage has no reply_parameters — augment it (and add a sendPhoto)
// so the reply-binding path has something to bite on
function withReplyableMethods (schema: Schema) {
  const replyParam = {
    name: 'reply_parameters',
    description: 'description of the message to reply to',
    required: false,
    type: { kind: 'reference' as const, name: 'ReplyParameters' }
  }

  schema.methods.find(m => m.name === 'sendMessage')!.arguments.push({ ...replyParam })

  schema.methods.push({
    name: 'sendPhoto',
    description: 'Sends a photo.',
    multipartOnly: false,
    arguments: [
      { name: 'chat_id', description: 'Target chat id.', required: true, type: { kind: 'union', of: [{ kind: 'integer' }, { kind: 'string' }] } },
      { name: 'photo', description: 'Photo to send.', required: true, type: { kind: 'string' } },
      { ...replyParam }
    ],
    returnType: { kind: 'reference', name: 'Message' }
  })

  schema.objects.push({
    kind: 'object',
    name: 'ReplyParameters',
    description: 'Reply parameters.',
    fields: [
      { name: 'message_id', description: 'Replied message id.', required: true, type: { kind: 'integer' } },
      { name: 'allow_sending_without_reply', description: 'Allow.', required: false, type: { kind: 'bool' } }
    ]
  })

  return schema
}

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

  it('emits reply variants for send* methods with reply_parameters on message kinds', async () => {
    const schema = withReplyableMethods(await loadSchema())

    const result = analyzeShortcuts(schema)
    const onMessage = result.byKind.message ?? []

    const reply = onMessage.find(s => s.method === 'sendMessage' && s.reply)
    const replyWithPhoto = onMessage.find(s => s.method === 'sendPhoto' && s.reply)

    expect(reply?.reply?.verb).toBe('reply')
    expect(replyWithPhoto?.reply?.verb).toBe('replyWithPhoto')
    expect(reply?.reply?.messageId.accessPath).toEqual(['raw', 'message_id'])

    // the plain send variants still exist alongside the reply ones
    expect(onMessage.filter(s => s.method === 'sendMessage' && !s.reply)).toHaveLength(1)
  })

  it('does not emit reply variants for methods without reply_parameters', async () => {
    const schema = withReplyableMethods(await loadSchema())

    const result = analyzeShortcuts(schema)
    const onMessage = result.byKind.message ?? []

    // getMe has no anchors so never binds; sendMessage without the reply marker is the plain send
    expect(onMessage.find(s => s.method === 'getMe')).toBeUndefined()
    expect(onMessage.some(s => s.reply && s.method === 'getMe')).toBe(false)
  })
})

async function withBusiness () {
  const schema = JSON.parse(
    await readFile(resolve(__dirname, '../fixtures/small-schema.json'), 'utf8')
  ) as Schema

  const message = schema.objects.find(o => o.name === 'Message')

  if (message?.kind === 'object') {
    message.fields.push({
      name: 'business_connection_id', description: 'biz', required: false, type: { kind: 'string' }
    })
  }

  schema.methods.find(m => m.name === 'sendMessage')!.arguments.push({
    name: 'business_connection_id', description: 'biz', required: false, type: { kind: 'string' }
  })

  schema.methods.push({
    name: 'getBusinessConnection',
    description: 'Business-account method with no chat_id.',
    multipartOnly: false,
    arguments: [
      { name: 'business_connection_id', description: 'biz', required: true, type: { kind: 'string' } }
    ],
    returnType: { kind: 'reference', name: 'BusinessConnection' }
  })

  schema.methods.push({
    name: 'sendChecklist',
    description: 'Business-only send with a required business_connection_id.',
    multipartOnly: false,
    arguments: [
      { name: 'business_connection_id', description: 'biz', required: true, type: { kind: 'string' } },
      { name: 'chat_id', description: 'chat', required: true, type: { kind: 'integer' } }
    ],
    returnType: { kind: 'reference', name: 'Message' }
  })

  return schema
}

describe('analyzeShortcuts — business_connection_id augment', () => {
  it('augments chat_id-bound methods with an optional business_connection_id fill', async () => {
    const result = analyzeShortcuts(await withBusiness())
    const send = (result.byKind.message ?? []).find(s => s.method === 'sendMessage' && !s.reply)

    expect(send).toBeDefined()
    expect(send!.filledArgs.map(a => a.schemaArg).sort()).toEqual(['business_connection_id', 'chat_id'])
    expect(send!.filledArgs.find(a => a.schemaArg === 'business_connection_id')?.optional).toBe(true)
    expect(send!.userArgs.some(a => a.name === 'business_connection_id')).toBe(false)
  })

  it('does not turn a business-account method (no chat_id) into an update shortcut', async () => {
    const result = analyzeShortcuts(await withBusiness())

    expect((result.byKind.message ?? []).find(s => s.method === 'getBusinessConnection')).toBeUndefined()
  })

  it('fills a required business_connection_id non-optionally', async () => {
    const result = analyzeShortcuts(await withBusiness())
    const checklist = (result.byKind.message ?? []).find(s => s.method === 'sendChecklist')

    const anchor = checklist?.filledArgs.find(a => a.schemaArg === 'business_connection_id')

    expect(anchor?.optional).toBe(false)
    expect(anchor?.nonNull).toBe(true)
  })
})
