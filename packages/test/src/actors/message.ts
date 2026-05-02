import type { TestChat } from './chat'
import type { TestUser } from './user'

export class TestMessage {
  readonly chat: TestChat
  readonly from: TestUser | undefined
  readonly message_id: number
  readonly date: number

  text = ''
  caption: string | undefined
  isDeleted = false

  constructor (init: { chat: TestChat, from: TestUser | undefined, message_id: number, date: number }) {
    this.chat = init.chat
    this.from = init.from
    this.message_id = init.message_id
    this.date = init.date
  }

  toRaw () {
    const base: Record<string, unknown> = {
      message_id: this.message_id,
      date: this.date,
      chat: this.chat.toRaw()
    }

    if (this.from !== undefined) {
      base.from = this.from.toRaw()
    }

    if (this.text !== '') {
      base.text = this.text
    }

    if (this.caption !== undefined) {
      base.caption = this.caption
    }

    return base
  }
}
