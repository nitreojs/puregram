import type { TestUser } from '../actors/user'

interface KeyResolvable {
  from?: { id?: number | string }
  senderChat?: { id?: number | string }
  chat?: { id?: number | string }
}

// mirrors `@puregram/session`'s `defaultGetStorageKey` + `normalizeKey`: `user:<from.id>:chat:<chat.id>`
// with undefined segments omitted. the plugin keeps its resolver in a closure and exposes only the
// raw kv handle, so a custom `getStorageKey` makes these packs read the wrong slot
export const sessionKeyOfUpdate = (update: unknown) => {
  const u = update as KeyResolvable
  const fromId = u.from?.id
  const chatId = u.chat?.id ?? u.senderChat?.id

  const segments: string[] = []

  if (fromId !== undefined) {
    segments.push(`user:${fromId}`)
  }

  if (chatId !== undefined) {
    segments.push(`chat:${chatId}`)
  }

  return segments.length > 0 ? segments.join(':') : undefined
}

// testuser→pm convention means user.id === pmChat.id
export const sessionKeyOfUser = (user: TestUser) => `user:${user.id}:chat:${user.pmChat.id}`
