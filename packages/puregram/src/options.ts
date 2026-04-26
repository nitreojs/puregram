import type { TelegramUser } from '@puregram/api'

import type { HttpClient } from './http/client'

export interface TelegramOptions {
  token: string
  httpClient?: HttpClient
  /** pre-populate `tg.bot` and skip the start-time getMe call */
  bot?: TelegramUser
  allowedUpdates?: string[]
  apiBaseUrl?: string
  apiTimeout?: number
  apiWait?: number
  apiRetryLimit?: number
  apiHeaders?: Record<string, string>
  useTestDc?: boolean
  useLocal?: boolean
}

export interface ResolvedTelegramOptions extends Required<Omit<TelegramOptions, 'httpClient' | 'bot'>> {
  httpClient: HttpClient | undefined
  bot?: TelegramUser
}

const VERSION = '3.0.0-alpha.0'

export const DEFAULT_OPTIONS: Omit<ResolvedTelegramOptions, 'token' | 'httpClient'> = {
  allowedUpdates: [],
  apiBaseUrl: 'https://api.telegram.org/bot',
  apiTimeout: 30_000,
  apiWait: 3000,
  apiRetryLimit: -1,
  apiHeaders: {
    connection: 'keep-alive',
    'user-agent': `puregram/${VERSION} (+https://github.com/nitreojs/puregram)`
  },
  useTestDc: false,
  useLocal: false
}

export function resolveOptions (input: TelegramOptions) {
  return {
    ...DEFAULT_OPTIONS,
    ...input,
    apiHeaders: { ...DEFAULT_OPTIONS.apiHeaders, ...(input.apiHeaders ?? {}) },
    httpClient: input.httpClient,
    bot: input.bot
  } as ResolvedTelegramOptions
}
