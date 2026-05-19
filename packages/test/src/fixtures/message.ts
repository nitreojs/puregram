import type { TelegramChat, TelegramMessage, TelegramUser } from '@puregram/api'

import { buildChat } from './chat'
import { nextFixtureMessageId } from './counter'
import { nowSeconds } from './now'
import { buildUser } from './user'

// `from` / `chat` are deep-merged with their defaults so partial overrides are valid
export type BuildMessageOverrides = Omit<Partial<TelegramMessage>, 'from' | 'chat'> & {
  from?: Partial<TelegramUser>
  chat?: Partial<TelegramChat>
}

/**
 * build a minimal-but-realistic `TelegramMessage` payload
 *
 * defaults: sequential `message_id`, current unix time, default `from` and `chat` (via `buildUser` / `buildChat`)
 *
 * pass `overrides` to replace any field — `chat` and `from` are deep-merged with the defaults
 */
export function buildMessage (overrides: BuildMessageOverrides = {}) {
  const from = overrides.from === undefined
    ? buildUser()
    : { ...buildUser(), ...overrides.from }

  // mirror from's identity onto the default private chat
  const chatSeed: Partial<TelegramChat> = { id: from.id, first_name: from.first_name }

  if (from.last_name !== undefined) {
    chatSeed.last_name = from.last_name
  }

  if (from.username !== undefined) {
    chatSeed.username = from.username
  }

  const chat = overrides.chat === undefined
    ? buildChat(chatSeed)
    : { ...buildChat(), ...overrides.chat }

  const base: TelegramMessage = {
    message_id: nextFixtureMessageId(),
    date: nowSeconds(),
    from,
    chat
  }

  return { ...base, ...overrides, from, chat }
}
