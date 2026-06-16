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

  it('classifies no-field objects by their subtype <ul>: list -> union, none -> empty object', () => {
    const html = `
      <h4>ChatMember</h4>
      <p>This object contains information about one member of a chat. Currently, the following 6 types of chat members are supported:</p>
      <ul>
        <li><a href="#chatmemberowner">ChatMemberOwner</a></li>
        <li><a href="#chatmemberadministrator">ChatMemberAdministrator</a></li>
        <li><a href="#chatmembermember">ChatMemberMember</a></li>
      </ul>
      <h4>VideoChatStarted</h4>
      <p>This object represents a service message about a video chat started in the chat. Currently holds no information.</p>
      <h4>CallbackGame</h4>
      <p>A placeholder, currently holds no information. Use <a href="https://t.me/botfather">@BotFather</a> to set up your game.</p>
    `

    const { objects } = extractFromHtml(html)

    const chatMember = objects.find(o => o.name === 'ChatMember')

    expect(chatMember!.kind).toBe('union')
    if (chatMember!.kind === 'union') {
      expect(chatMember.members).toEqual([
        { kind: 'reference', name: 'ChatMemberOwner' },
        { kind: 'reference', name: 'ChatMemberAdministrator' },
        { kind: 'reference', name: 'ChatMemberMember' }
      ])
    }

    // no subtype list -> genuinely empty object, not a union (the prose <a> to @BotFather is ignored)
    expect(objects.find(o => o.name === 'VideoChatStarted')!.kind).toBe('object')
    expect(objects.find(o => o.name === 'CallbackGame')!.kind).toBe('object')
  })
})
