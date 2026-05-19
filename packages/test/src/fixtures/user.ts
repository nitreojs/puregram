import type { TelegramUser } from '@puregram/api'

import { nextFixtureUserId } from './counter'

/**
 * build a minimal-but-realistic `TelegramUser` payload
 *
 * defaults: sequential id, `is_bot: false`, `first_name: 'Test'`, `last_name: 'User'`, `username: 'test-user'`,
 * `language_code: 'en'`
 *
 * pass `overrides` to replace any default field
 */
export function buildUser (overrides: Partial<TelegramUser> = {}) {
  const base: TelegramUser = {
    id: nextFixtureUserId(),
    is_bot: false,
    first_name: 'Test',
    last_name: 'User',
    username: 'test-user',
    language_code: 'en'
  }

  return { ...base, ...overrides }
}
