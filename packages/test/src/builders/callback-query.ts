import type { TestMessage } from '../actors/message'
import type { TestUser } from '../actors/user'

let nextId = 0

function allocateId () {
  nextId += 1

  return 'cbq_' + nextId
}

export class CallbackQueryBuilder {
  private _id: string | undefined
  private _from: TestUser | undefined
  private _data: string | undefined
  private _message: TestMessage | undefined
  private _inlineMessageId: string | undefined

  id (id: string) {
    this._id = id

    return this
  }

  from (user: TestUser) {
    this._from = user

    return this
  }

  data (data: string) {
    this._data = data

    return this
  }

  message (msg: TestMessage) {
    this._message = msg

    return this
  }

  inlineMessageId (id: string) {
    this._inlineMessageId = id

    return this
  }

  toUpdate () {
    if (this._from === undefined) {
      throw new Error('CallbackQueryBuilder: from is required')
    }

    const cbq: Record<string, unknown> = {
      id: this._id ?? allocateId(),
      from: this._from.toRaw(),
      chat_instance: 'inst_' + (this._message?.chat.id ?? 0)
    }

    if (this._data !== undefined) {
      cbq.data = this._data
    }

    if (this._message !== undefined) {
      cbq.message = this._message.toRaw()
    }

    if (this._inlineMessageId !== undefined) {
      cbq.inline_message_id = this._inlineMessageId
    }

    return { callback_query: cbq }
  }
}
