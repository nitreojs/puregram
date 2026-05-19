import type { TelegramChat } from '@puregram/api'

import { nextFixtureChatId } from './counter'

/**
 * build a minimal-but-realistic `TelegramChat` payload
 *
 * defaults: sequential id, `type: 'private'`, `first_name: 'Test'`, `last_name: 'User'`, `username: 'test-user'`
 *
 * pass `overrides` to replace any default field — e.g. `{ type: 'group', title: 'devs' }`
 */
export function buildChat (overrides: Partial<TelegramChat> = {}) {
  const base: TelegramChat = {
    id: nextFixtureChatId(),
    type: 'private',
    first_name: 'Test',
    last_name: 'User',
    username: 'test-user'
  }

  return { ...base, ...overrides }
}
