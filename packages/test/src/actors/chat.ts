import type { TestMessage } from './message'

export type ChatType = 'private' | 'group' | 'supergroup' | 'channel'

export class TestChat {
  readonly id: number
  readonly type: ChatType
  readonly title: string | undefined
  readonly username: string | undefined

  private readonly _messages: TestMessage[] = []
  private messageIdCounter = 0

  constructor (init: { id: number, type: ChatType, title?: string, username?: string }) {
    this.id = init.id
    this.type = init.type
    this.title = init.title
    this.username = init.username
  }

  get messages () {
    return this._messages as readonly TestMessage[]
  }

  appendMessage (msg: TestMessage) {
    this._messages.push(msg)
  }

  nextMessageId () {
    this.messageIdCounter += 1

    return this.messageIdCounter
  }

  toRaw () {
    return {
      id: this.id,
      type: this.type,
      ...(this.title !== undefined ? { title: this.title } : {}),
      ...(this.username !== undefined ? { username: this.username } : {})
    }
  }
}
