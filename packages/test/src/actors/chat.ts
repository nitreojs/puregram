import type { TestMessage } from './message'
import type { TestUser } from './user'

export type ChatType = 'private' | 'group' | 'supergroup' | 'channel'

export type PostFn = (text: string) => Promise<TestMessage>

export interface ChatMembership {
  status: 'creator' | 'administrator' | 'member' | 'restricted' | 'left' | 'kicked'
  since: number
  customTitle?: string
}

export class TestChat {
  readonly id: number
  readonly type: ChatType
  readonly title: string | undefined
  readonly username: string | undefined

  private readonly _messages: TestMessage[] = []
  private readonly _pinned: TestMessage[] = []
  private readonly _members = new Map<number, ChatMembership>()
  private messageIdCounter = 0
  private _postFn: PostFn | undefined

  constructor (init: { id: number, type: ChatType, title?: string, username?: string }) {
    this.id = init.id
    this.type = init.type
    this.title = init.title
    this.username = init.username
  }

  get messages () {
    return this._messages as readonly TestMessage[]
  }

  get lastMessage () {
    return this._messages[this._messages.length - 1]
  }

  get lastBotMessage () {
    for (let i = this._messages.length - 1; i >= 0; i -= 1) {
      const candidate = this._messages[i]

      if (candidate === undefined) {
        continue
      }

      if (candidate.from === undefined || candidate.from.is_bot) {
        return candidate
      }
    }

    return undefined
  }

  get lastUserMessage () {
    for (let i = this._messages.length - 1; i >= 0; i -= 1) {
      const candidate = this._messages[i]

      if (candidate === undefined) {
        continue
      }

      if (candidate.from !== undefined && !candidate.from.is_bot) {
        return candidate
      }
    }

    return undefined
  }

  get pinnedMessages () {
    return this._pinned as readonly TestMessage[]
  }

  get members () {
    return this._members as ReadonlyMap<number, ChatMembership>
  }

  membershipOf (user: TestUser) {
    const explicit = this._members.get(user.id)

    if (explicit !== undefined) {
      return explicit
    }

    const fallback: ChatMembership = this.type === 'private'
      ? { status: 'member', since: 0 }
      : { status: 'left', since: 0 }

    return fallback
  }

  botMembership () {
    const fallback: ChatMembership = this.type === 'private'
      ? { status: 'member', since: 0 }
      : { status: 'administrator', since: 0 }

    return fallback
  }

  setMembership (userId: number, membership: ChatMembership) {
    this._members.set(userId, membership)
  }

  appendMessage (msg: TestMessage) {
    this._messages.push(msg)
  }

  removeAt (idx: number) {
    this._messages.splice(idx, 1)
  }

  pinTop (msg: TestMessage) {
    this._pinned.unshift(msg)
  }

  unpin (messageId: number) {
    const idx = this._pinned.findIndex(m => m.message_id === messageId)

    if (idx >= 0) {
      this._pinned.splice(idx, 1)
    }
  }

  unpinAll () {
    this._pinned.length = 0
  }

  nextMessageId () {
    this.messageIdCounter += 1

    return this.messageIdCounter
  }

  setPostFn (fn: PostFn) {
    this._postFn = fn
  }

  async post (text: string): Promise<TestMessage> {
    if (this.type !== 'channel') {
      throw new Error('TestChat.post is only valid for channel chats')
    }

    if (this._postFn === undefined) {
      throw new Error('TestChat: post handler not wired (use env.createChat)')
    }

    return this._postFn(text)
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
