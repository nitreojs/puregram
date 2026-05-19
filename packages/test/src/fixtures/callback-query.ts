import type { TelegramCallbackQuery } from '@puregram/api'

import { nextFixtureCallbackQueryId } from './counter'
import { buildUser } from './user'

/**
 * build a minimal-but-realistic `TelegramCallbackQuery` payload
 *
 * defaults: sequential id, default `from` user (via `buildUser`), `chat_instance: 'inst-fx'`
 *
 * pass `overrides` to replace any field — `from` is deep-merged with the default user
 */
export function buildCallbackQuery (overrides: Partial<TelegramCallbackQuery> = {}) {
  const from = overrides.from === undefined
    ? buildUser()
    : { ...buildUser(), ...overrides.from }

  const base: TelegramCallbackQuery = {
    id: nextFixtureCallbackQueryId(),
    from,
    chat_instance: 'inst-fx'
  }

  return { ...base, ...overrides, from }
}
