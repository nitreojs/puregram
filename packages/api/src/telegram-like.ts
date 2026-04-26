// minimal structural type @puregram/api depends on, so we don't pull in `puregram` core
// (which depends back on us). puregram's Telegram class satisfies this shape

import type { ApiMethods } from './generated/api-methods'

export interface TelegramLike {
  readonly api: {
    [K in keyof ApiMethods]: ApiMethods[K] extends (...args: infer A) => infer R
      ? (...args: A) => R
      : never
  } & {
    call: (method: string, params?: Record<string, unknown>) => Promise<unknown>
  }
}
