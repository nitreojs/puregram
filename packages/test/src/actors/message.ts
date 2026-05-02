import type { TestChat } from './chat'
import type { TestUser } from './user'

export class TestMessage {
  readonly chat: TestChat
  readonly from: TestUser | undefined
  readonly message_id: number
  readonly date: number
  readonly reactions = new Map<number, Set<string>>()

  text = ''
  caption: string | undefined
  isDeleted = false
  replyMarkup: unknown

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

    if (this.replyMarkup !== undefined) {
      base.reply_markup = this.replyMarkup
    }

    return base
  }

  applyReaction (userId: number, emojis: readonly string[]) {
    const existing = this.reactions.get(userId)
    const before = existing !== undefined ? Array.from(existing) : []

    if (emojis.length === 0) {
      this.reactions.delete(userId)
    } else {
      this.reactions.set(userId, new Set(emojis))
    }

    return { old: before, new: [...emojis] }
  }
}
