import type { Telegram } from 'puregram'

import type { World } from '../world/world'

import { TestChat } from './chat'
import { allocateUserId } from './identity'
import { TestMessage } from './message'

export interface CreateUserOptions {
  id?: number
  first_name?: string
  last_name?: string
  username?: string
  language_code?: string
}

export class TestUser {
  readonly id: number
  readonly is_bot = false
  readonly first_name: string
  readonly last_name: string | undefined
  readonly username: string | undefined
  readonly language_code: string | undefined
  readonly pmChat: TestChat

  private readonly world: World
  private readonly inject: (raw: Record<string, unknown>) => Promise<void>

  constructor (init: {
    tg: Telegram
    world: World
    inject: (raw: Record<string, unknown>) => Promise<void>
    options: CreateUserOptions
  }) {
    this.world = init.world
    this.inject = init.inject
    this.id = init.options.id ?? allocateUserId()
    this.first_name = init.options.first_name ?? `User${this.id}`
    this.last_name = init.options.last_name
    this.username = init.options.username
    this.language_code = init.options.language_code
    this.pmChat = new TestChat({ id: this.id, type: 'private' })
  }

  get chat () {
    return this.pmChat
  }

  toRaw () {
    const base: Record<string, unknown> = {
      id: this.id,
      is_bot: this.is_bot,
      first_name: this.first_name
    }

    if (this.last_name !== undefined) {
      base.last_name = this.last_name
    }

    if (this.username !== undefined) {
      base.username = this.username
    }

    if (this.language_code !== undefined) {
      base.language_code = this.language_code
    }

    return base
  }

  async sendMessage (text: string): Promise<TestMessage>
  async sendMessage (chat: TestChat, text: string): Promise<TestMessage>
  async sendMessage (a: string | TestChat, b?: string): Promise<TestMessage> {
    const chat = typeof a === 'string' ? this.pmChat : a
    const text = typeof a === 'string' ? a : (b as string)
    const messageId = chat.nextMessageId()
    const msg = new TestMessage({
      chat,
      from: this,
      message_id: messageId,
      date: Math.floor(Date.now() / 1000)
    })

    msg.text = text
    chat.appendMessage(msg)

    await this.inject({
      update_id: this.world.nextUpdateId(),
      message: msg.toRaw()
    })

    return msg
  }

  async pinMessage (msg: TestMessage) {
    msg.chat.pinTop(msg)

    const carrier = new TestMessage({
      chat: msg.chat,
      from: this,
      message_id: msg.chat.nextMessageId(),
      date: Math.floor(Date.now() / 1000)
    })

    const carrierRaw = carrier.toRaw()

    carrierRaw.pinned_message = msg.toRaw()

    await this.inject({
      update_id: this.world.nextUpdateId(),
      message: carrierRaw
    })
  }
}
