import type { Telegram } from 'puregram'

import { TestEnv } from './env'
import type { TestEnvOptions } from './options'

export function createTestEnv<TG extends Telegram> (tg: TG, options?: TestEnvOptions) {
  return new TestEnv(tg, options)
}

export { TestChat } from './actors/chat'
export type { ChatMembership, ChatType } from './actors/chat'
export { TestMessage } from './actors/message'
export { TestUser } from './actors/user'
export type { CreateUserOptions } from './actors/user'
export { TestEnv } from './env'
export type { ApiCallRecord } from './env'
export { MembershipRequired } from './errors'
export type { TestEnvOptions } from './options'
export { apiError, isApiErrorSentinel } from './stubs/api-error'
export type { ApiErrorSentinel } from './stubs/api-error'
