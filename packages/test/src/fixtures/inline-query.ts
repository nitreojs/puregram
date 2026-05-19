import type { TelegramInlineQuery } from '@puregram/api'

import { nextFixtureInlineQueryId } from './counter'
import { buildUser } from './user'

/**
 * build a minimal-but-realistic `TelegramInlineQuery` payload
 *
 * defaults: sequential id, default `from` user (via `buildUser`), empty `query`, empty `offset`
 *
 * pass `overrides` to replace any field — `from` is deep-merged with the default user
 */
export function buildInlineQuery (overrides: Partial<TelegramInlineQuery> = {}) {
  const from = overrides.from === undefined
    ? buildUser()
    : { ...buildUser(), ...overrides.from }

  const base: TelegramInlineQuery = {
    id: nextFixtureInlineQueryId(),
    from,
    query: '',
    offset: ''
  }

  return { ...base, ...overrides, from }
}
