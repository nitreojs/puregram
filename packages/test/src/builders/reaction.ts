import type { TestMessage } from '../actors/message'
import type { TestUser } from '../actors/user'

export class ReactionBuilder {
  private _from: TestUser | undefined
  private _message: TestMessage | undefined
  private _added: string[] = []
  private _removed: string[] = []

  from (user: TestUser) {
    this._from = user

    return this
  }

  on (msg: TestMessage) {
    this._message = msg

    return this
  }

  add (...emojis: string[]) {
    this._added.push(...emojis)

    return this
  }

  remove (...emojis: string[]) {
    this._removed.push(...emojis)

    return this
  }

  toUpdate () {
    if (this._from === undefined || this._message === undefined) {
      throw new Error('ReactionBuilder: from and on(message) are required')
    }

    const oldSet = this._message.reactions.get(this._from.id)
    const before = oldSet !== undefined ? Array.from(oldSet) : []
    const next = before.filter(e => !this._removed.includes(e)).concat(this._added)

    return {
      message_reaction: {
        chat: this._message.chat.toRaw(),
        message_id: this._message.message_id,
        user: this._from.toRaw(),
        date: Math.floor(Date.now() / 1000),
        old_reaction: before.map(e => ({ type: 'emoji', emoji: e })),
        new_reaction: next.map(e => ({ type: 'emoji', emoji: e }))
      }
    }
  }
}
