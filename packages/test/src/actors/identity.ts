let nextUserId = 100_000_000

export function allocateUserId () {
  nextUserId += 1

  return nextUserId
}

let nextChatId = -100_000_000

export function allocateChatId (type: 'private' | 'group' | 'supergroup' | 'channel') {
  if (type === 'private') {
    return allocateUserId()
  }

  nextChatId -= 1

  return nextChatId
}

export interface BotIdentity {
  id: number
  is_bot: true
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}

export function defaultBotIdentity (override?: Partial<BotIdentity>) {
  const base: BotIdentity = {
    id: 12345,
    is_bot: true,
    first_name: 'TestBot',
    username: 'testbot'
  }

  return { ...base, ...override }
}
