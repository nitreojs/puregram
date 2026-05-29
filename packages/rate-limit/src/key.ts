import type { AnyUpdate } from './types'

interface KeyResolvable {
  from?: { id?: number | string }
  senderChat?: { id?: number | string }
  chat?: { id?: number | string }
}

/**
 * default per-user key — prefer the authoring user, fall back to senderChat
 * (channel posts), then chat (anonymous service updates). undefined when nothing
 * matches; callers pass through unkeyable updates rather than blocking them
 */
export const defaultGetStorageKey = (update: AnyUpdate) => {
  const u = update as KeyResolvable
  const fromId = u.from?.id

  if (fromId !== undefined) {
    return String(fromId)
  }

  const senderChatId = u.senderChat?.id

  if (senderChatId !== undefined) {
    return String(senderChatId)
  }

  const chatId = u.chat?.id

  if (chatId !== undefined) {
    return String(chatId)
  }

  return undefined
}

/** combine a resolved user key with an optional bucket name. default bucket is `'default'` */
export const composeKey = (userKey: string, bucket?: string) => `${bucket ?? 'default'}:${userKey}`
