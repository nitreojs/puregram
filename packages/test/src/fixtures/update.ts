import type { TelegramUpdate } from '@puregram/api'

import { nextFixtureUpdateId } from './counter'

export type UpdateKind = Exclude<keyof TelegramUpdate, 'update_id'>

/**
 * wrap a payload into a `TelegramUpdate` envelope under the given `kind`
 *
 * the returned update has a sequential `update_id` and a single populated field — `update[kind] = payload`
 *
 * example: `buildUpdate('message', buildMessage({ text: 'hi' }))`
 */
export function buildUpdate<K extends UpdateKind> (kind: K, payload: NonNullable<TelegramUpdate[K]>) {
  return {
    update_id: nextFixtureUpdateId(),
    [kind]: payload
  } as TelegramUpdate
}
