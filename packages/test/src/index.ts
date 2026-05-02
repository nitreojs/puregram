import type { Telegram } from 'puregram'

import { TestEnv } from './env'
import type { TestEnvOptions } from './options'

export function createTestEnv<TG extends Telegram> (tg: TG, options?: TestEnvOptions) {
  return new TestEnv(tg, options)
}

export { TestEnv } from './env'
export type { ApiCallRecord } from './env'
export type { TestEnvOptions } from './options'
export { apiError, isApiErrorSentinel } from './stubs/api-error'
export type { ApiErrorSentinel } from './stubs/api-error'
