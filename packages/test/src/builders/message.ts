import type { TestChat } from '../actors/chat'
import type { TestMessage } from '../actors/message'
import type { TestUser } from '../actors/user'

let nextUpdateId = 0

function allocateUpdateId () {
  nextUpdateId += 1

  return nextUpdateId
}

export type MessageKind = 'message' | 'edited_message' | 'channel_post' | 'edited_channel_post'

export interface MessageEntity {
  type: string
  offset: number
  length: number
}

export class MessageBuilder {
  private _kind: MessageKind = 'message'
  private _text: string | undefined
  private _from: TestUser | undefined
  private _chat: TestChat | undefined
  private _replyTo: TestMessage | undefined
  private _entities: MessageEntity[] | undefined
  private _messageId: number | undefined

  constructor (init?: { text?: string }) {
    if (init?.text !== undefined) {
      this._text = init.text
    }
  }

  kind (kind: MessageKind) {
    this._kind = kind

    return this
  }

  text (text: string) {
    this._text = text

    return this
  }

  from (user: TestUser) {
    this._from = user

    return this
  }

  chat (chat: TestChat) {
    this._chat = chat

    return this
  }

  replyTo (msg: TestMessage) {
    this._replyTo = msg

    return this
  }

  entities (e: MessageEntity[]) {
    this._entities = e

    return this
  }

  messageId (id: number) {
    this._messageId = id

    return this
  }

  toUpdate () {
    if (this._chat === undefined) {
      throw new Error('MessageBuilder: chat is required (call .chat(...))')
    }

    const messageId = this._messageId ?? this._chat.nextMessageId()
    const inner: Record<string, unknown> = {
      message_id: messageId,
      date: Math.floor(Date.now() / 1000),
      chat: this._chat.toRaw()
    }

    if (this._from !== undefined) {
      inner.from = this._from.toRaw()
    }

    if (this._text !== undefined) {
      inner.text = this._text
    }

    if (this._replyTo !== undefined) {
      inner.reply_to_message = this._replyTo.toRaw()
    }

    if (this._entities !== undefined) {
      inner.entities = this._entities
    }

    return {
      update_id: allocateUpdateId(),
      [this._kind]: inner
    }
  }
}
